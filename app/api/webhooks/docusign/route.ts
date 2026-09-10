import crypto from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db/client";
import { downloadSignedPdf } from "@/lib/docusign/client";
import { uploadToPrivateS3 } from "@/lib/storage/s3";

// DocuSign sends Connect notifications as XML (multipart/form-data or application/xml).
// We parse the relevant fields from the JSON-formatted Connect message if configured,
// or from the XML body in the default Connect format.

interface DocuSignConnectEvent {
  envelopeId?: string;
  status?: string;
}

/**
 * Verify the DocuSign Connect HMAC-SHA256 signature when a key is configured.
 * Returns true if the key is not configured (permissive) or the signature matches.
 */
async function verifyHmac(rawBody: string, signature: string | null): Promise<boolean> {
  const key = process.env.DOCUSIGN_CONNECT_HMAC_KEY;
  if (!key) return true; // HMAC not configured — skip verification
  if (!signature) return false;
  const expected = crypto
    .createHmac("sha256", key)
    .update(rawBody)
    .digest("base64");
  const expectedBuf = Buffer.from(expected, "base64");
  try {
    const actualBuf = Buffer.from(signature, "base64");
    if (expectedBuf.length !== actualBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, actualBuf);
  } catch {
    return false;
  }
}

function parseConnectEvent(body: unknown): DocuSignConnectEvent {
  if (typeof body !== "object" || body === null) return {};
  const b = body as Record<string, unknown>;

  // DocuSign JSON Connect format: { data: { envelopeId, envelopeSummary: { status } } }
  if (typeof b["data"] === "object" && b["data"] !== null) {
    const data = b["data"] as Record<string, unknown>;
    if (typeof data["envelopeId"] === "string") {
      let nestedStatus: string | undefined;
      if (typeof data["envelopeSummary"] === "object" && data["envelopeSummary"] !== null) {
        const summary = data["envelopeSummary"] as Record<string, unknown>;
        nestedStatus =
          typeof summary["status"] === "string" ? summary["status"] : undefined;
      }
      return { envelopeId: data["envelopeId"], status: nestedStatus };
    }
  }

  // Flat PascalCase (DocuSign legacy JSON) takes precedence over camelCase.
  const envelopeId =
    typeof b["EnvelopeID"] === "string"
      ? b["EnvelopeID"]
      : typeof b["envelopeId"] === "string"
        ? b["envelopeId"]
        : undefined;
  const status =
    typeof b["Status"] === "string"
      ? b["Status"]
      : typeof b["status"] === "string"
        ? b["status"]
        : undefined;
  return { envelopeId, status };
}

// Map DocuSign envelope status strings to our ContractStatus enum values.
function mapDocuSignStatus(
  dsStatus: string,
): "SENT_FOR_SIGNING" | "CLIENT_SIGNED" | "COMPLETE" | "VOIDED" | null {
  switch (dsStatus.toLowerCase()) {
    case "sent":
    case "delivered":
      return "SENT_FOR_SIGNING";
    case "completed":
      return "COMPLETE";
    case "voided":
    case "declined":
      return "VOIDED";
    default:
      return null;
  }
}

export async function POST(req: NextRequest) {
  let parsed: DocuSignConnectEvent = {};

  const contentType = req.headers.get("content-type") ?? "";
  // Read the raw body first so we can verify the HMAC signature.
  const rawBody = await req.text();

  const hmacSignature = req.headers.get("x-docusign-signature-1");
  const hmacValid = await verifyHmac(rawBody, hmacSignature);
  if (!hmacValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (contentType.includes("application/json")) {
    try {
      const body: unknown = JSON.parse(rawBody);
      parsed = parseConnectEvent(body);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
  } else {
    // DocuSign Connect default sends XML.
    // Strip <RecipientStatuses>…</RecipientStatuses> so that the envelope-level
    // <Status> is not shadowed by a recipient-level <Status> that appears first.
    const strippedXml = rawBody.replace(
      /<RecipientStatuses[\s\S]*?<\/RecipientStatuses>/gi,
      "",
    );
    const envelopeIdMatch = /<EnvelopeID>([^<]+)<\/EnvelopeID>/i.exec(strippedXml);
    const statusMatch = /<Status>([^<]+)<\/Status>/i.exec(strippedXml);
    parsed = {
      envelopeId: envelopeIdMatch?.[1],
      status: statusMatch?.[1],
    };
  }

  const { envelopeId, status: dsStatus } = parsed;

  if (!envelopeId || !dsStatus) {
    return NextResponse.json({ ok: true, message: "No envelope data" });
  }

  const contract = await prisma.contract.findFirst({
    where: { docusignEnvelopeId: envelopeId },
    select: { id: true, clientRelationshipId: true, status: true, s3Bucket: true },
  });

  if (!contract) {
    // Unknown envelope — acknowledge and ignore.
    return NextResponse.json({ ok: true });
  }

  // Monotonic status advancement: never regress from a terminal state.
  if (contract.status === "COMPLETE" || contract.status === "VOIDED") {
    return NextResponse.json({ ok: true });
  }

  const newStatus = mapDocuSignStatus(dsStatus);
  if (!newStatus) {
    // Intermediate status we don't map — update docusignStatus only.
    await prisma.contract.update({
      where: { id: contract.id },
      data: { docusignStatus: dsStatus },
    });
    return NextResponse.json({ ok: true });
  }

  // When the envelope completes (both parties signed), download and archive the signed PDF.
  if (newStatus === "COMPLETE" && process.env.AWS_REGION && contract.s3Bucket) {
    try {
      const signedPdf = await downloadSignedPdf(envelopeId);
      const signedKey = `contracts/${contract.clientRelationshipId}/signed-${envelopeId}.pdf`;
      await uploadToPrivateS3(signedKey, signedPdf, "application/pdf");
      await prisma.contract.update({
        where: { id: contract.id },
        data: {
          status: "COMPLETE",
          docusignStatus: dsStatus,
          s3Key: signedKey,
        },
      });
    } catch (err: unknown) {
      console.error("Failed to archive signed PDF", err);
      // Still update status even if archival fails.
      await prisma.contract.update({
        where: { id: contract.id },
        data: { status: "COMPLETE", docusignStatus: dsStatus },
      });
    }
  } else {
    await prisma.contract.update({
      where: { id: contract.id },
      data: { status: newStatus, docusignStatus: dsStatus },
    });
  }

  return NextResponse.json({ ok: true });
}
