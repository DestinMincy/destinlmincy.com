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

function parseConnectEvent(body: unknown): DocuSignConnectEvent {
  if (typeof body !== "object" || body === null) return {};
  const b = body as Record<string, unknown>;
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

  if (contentType.includes("application/json")) {
    try {
      const body: unknown = await req.json();
      parsed = parseConnectEvent(body);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
  } else {
    // DocuSign Connect default sends XML; parse envelope ID and status from text.
    const text = await req.text();
    const envelopeIdMatch = /<EnvelopeID>([^<]+)<\/EnvelopeID>/i.exec(text);
    const statusMatch = /<Status>([^<]+)<\/Status>/i.exec(text);
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
