import assert from "node:assert/strict";
import test, { before, beforeEach, mock } from "node:test";

import type { NextRequest } from "next/server";

import { argsOf, prismaModel, resetModels } from "@/__tests__/helpers/prisma-mock";

/**
 * The Connect webhook is unauthenticated and fed by DocuSign in two different
 * encodings, so the parsing, status mapping and archival branches are all
 * exercised through the real `POST` handler. Only the outbound edges — Prisma,
 * the DocuSign download and the S3 upload — are stubbed.
 */
const contract = prismaModel("findFirst", "update");

const downloadSignedPdf = mock.fn<(envelopeId: string) => Promise<Buffer>>(
  async () => Buffer.from("signed-pdf"),
);
const uploadToPrivateS3 = mock.fn<
  (key: string, body: Buffer, contentType: string) => Promise<unknown>
>(async () => ({ bucket: "contracts-bucket", key: "k" }));

mock.module("@/lib/db/client", { namedExports: { prisma: { contract } } });
mock.module("@/lib/docusign/client", { namedExports: { downloadSignedPdf } });
mock.module("@/lib/storage/s3", { namedExports: { uploadToPrivateS3 } });

type Route = typeof import("@/app/api/webhooks/docusign/route");

let POST: Route["POST"];

const ENDPOINT = "https://destinlmincy.com/api/webhooks/docusign";
const AWS_REGION = process.env.AWS_REGION;

before(async () => {
  ({ POST } = await import("@/app/api/webhooks/docusign/route"));
});

beforeEach(() => {
  resetModels(contract);

  downloadSignedPdf.mock.resetCalls();
  downloadSignedPdf.mock.mockImplementation(async () => Buffer.from("signed-pdf"));
  uploadToPrivateS3.mock.resetCalls();
  uploadToPrivateS3.mock.mockImplementation(async () => ({
    bucket: "contracts-bucket",
    key: "k",
  }));

  if (AWS_REGION === undefined) delete process.env.AWS_REGION;
  else process.env.AWS_REGION = AWS_REGION;
});

// ── Fixtures ─────────────────────────────────────────────────────────────────

function request(body: string, contentType: string): NextRequest {
  return new Request(ENDPOINT, {
    method: "POST",
    headers: { "content-type": contentType },
    body,
  }) as unknown as NextRequest;
}

function xmlRequest(body: string): NextRequest {
  return request(body, "text/xml");
}

function connectXml(envelopeId: string, status: string): NextRequest {
  return xmlRequest(
    `<?xml version="1.0" encoding="utf-8"?>` +
      `<DocuSignEnvelopeInformation><EnvelopeStatus>` +
      `<EnvelopeID>${envelopeId}</EnvelopeID><Status>${status}</Status>` +
      `</EnvelopeStatus></DocuSignEnvelopeInformation>`,
  );
}

function jsonRequest(body: unknown): NextRequest {
  return request(JSON.stringify(body), "application/json");
}

/** A contract row matching whatever envelope the webhook reports. */
function knownContract(overrides: Record<string, unknown> = {}) {
  contract.findFirst.mock.mockImplementation(async () => ({
    id: "contract-1",
    clientRelationshipId: "rel-1",
    status: "SENT_FOR_SIGNING",
    s3Bucket: "contracts-bucket",
    ...overrides,
  }));
}

async function bodyOf(response: Response): Promise<Record<string, unknown>> {
  return (await response.json()) as Record<string, unknown>;
}

/** The `data` payload of the nth `contract.update` call. */
function updateData(call = 0): Record<string, unknown> {
  return argsOf(contract.update, call).data;
}

// ── XML parsing ──────────────────────────────────────────────────────────────

test("parses the envelope id and status out of a Connect XML notification", async () => {
  knownContract();

  const response = await POST(connectXml("env-123", "Sent"));

  assert.equal(response.status, 200);
  assert.deepEqual(await bodyOf(response), { ok: true });
  assert.deepEqual(argsOf(contract.findFirst).where, {
    docusignEnvelopeId: "env-123",
  });
  assert.equal(updateData().status, "SENT_FOR_SIGNING");
  assert.equal(updateData().docusignStatus, "Sent");
});

test("matches Connect XML tags regardless of case", async () => {
  knownContract();

  await POST(
    xmlRequest("<envelopestatus><envelopeid>env-9</envelopeid><status>completed</status></envelopestatus>"),
  );

  assert.deepEqual(argsOf(contract.findFirst).where, {
    docusignEnvelopeId: "env-9",
  });
  assert.equal(updateData().status, "COMPLETE");
});

test("acknowledges an XML body with no envelope data without touching the database", async () => {
  const response = await POST(xmlRequest("<DocuSignEnvelopeInformation/>"));

  assert.equal(response.status, 200);
  assert.deepEqual(await bodyOf(response), {
    ok: true,
    message: "No envelope data",
  });
  assert.equal(contract.findFirst.mock.callCount(), 0);
  assert.equal(contract.update.mock.callCount(), 0);
});

test("acknowledges an XML body carrying an envelope id but no status", async () => {
  const response = await POST(xmlRequest("<EnvelopeID>env-123</EnvelopeID>"));

  assert.deepEqual(await bodyOf(response), {
    ok: true,
    message: "No envelope data",
  });
  assert.equal(contract.findFirst.mock.callCount(), 0);
});

// ── JSON parsing ─────────────────────────────────────────────────────────────

test("reads the PascalCase EnvelopeID/Status pair from a JSON notification", async () => {
  knownContract();

  await POST(jsonRequest({ EnvelopeID: "env-json", Status: "Delivered" }));

  assert.deepEqual(argsOf(contract.findFirst).where, {
    docusignEnvelopeId: "env-json",
  });
  assert.equal(updateData().status, "SENT_FOR_SIGNING");
  assert.equal(updateData().docusignStatus, "Delivered");
});

test("reads the camelCase envelopeId/status pair from a JSON notification", async () => {
  knownContract();

  await POST(jsonRequest({ envelopeId: "env-camel", status: "voided" }));

  assert.deepEqual(argsOf(contract.findFirst).where, {
    docusignEnvelopeId: "env-camel",
  });
  assert.equal(updateData().status, "VOIDED");
});

test("prefers the PascalCase fields when a payload carries both spellings", async () => {
  knownContract();

  await POST(
    jsonRequest({
      EnvelopeID: "env-pascal",
      envelopeId: "env-camel",
      Status: "completed",
      status: "voided",
    }),
  );

  assert.deepEqual(argsOf(contract.findFirst).where, {
    docusignEnvelopeId: "env-pascal",
  });
  assert.equal(updateData().status, "COMPLETE");
});

test("rejects a malformed JSON body with 400", async () => {
  const response = await POST(request("{not-json", "application/json"));

  assert.equal(response.status, 400);
  assert.deepEqual(await bodyOf(response), { error: "Invalid JSON" });
  assert.equal(contract.findFirst.mock.callCount(), 0);
});

test("ignores non-string envelope fields in a JSON payload", async () => {
  const response = await POST(jsonRequest({ EnvelopeID: 123, Status: null }));

  assert.deepEqual(await bodyOf(response), {
    ok: true,
    message: "No envelope data",
  });
  assert.equal(contract.findFirst.mock.callCount(), 0);
});

test("ignores a JSON payload that is not an object", async () => {
  const response = await POST(jsonRequest("env-123"));

  assert.deepEqual(await bodyOf(response), {
    ok: true,
    message: "No envelope data",
  });
  assert.equal(contract.findFirst.mock.callCount(), 0);
});

// ── Status mapping ───────────────────────────────────────────────────────────

const MAPPED_STATUSES: [docusign: string, contractStatus: string][] = [
  ["sent", "SENT_FOR_SIGNING"],
  ["Sent", "SENT_FOR_SIGNING"],
  ["delivered", "SENT_FOR_SIGNING"],
  ["DELIVERED", "SENT_FOR_SIGNING"],
  ["completed", "COMPLETE"],
  ["Completed", "COMPLETE"],
  ["voided", "VOIDED"],
  ["declined", "VOIDED"],
  ["Declined", "VOIDED"],
];

for (const [dsStatus, expected] of MAPPED_STATUSES) {
  test(`maps the DocuSign status "${dsStatus}" to ${expected}`, async () => {
    // No bucket, so completion takes the plain status-update path.
    knownContract({ s3Bucket: null });

    await POST(connectXml("env-1", dsStatus));

    assert.equal(contract.update.mock.callCount(), 1);
    assert.deepEqual(argsOf(contract.update).where, { id: "contract-1" });
    assert.equal(updateData().status, expected);
    assert.equal(updateData().docusignStatus, dsStatus);
  });
}

test("records an unmapped status without changing the contract status", async () => {
  knownContract();

  const response = await POST(connectXml("env-1", "processing"));

  assert.deepEqual(await bodyOf(response), { ok: true });
  assert.deepEqual(updateData(), { docusignStatus: "processing" });
  assert.ok(
    !("status" in updateData()),
    "an intermediate DocuSign status must not overwrite our own status",
  );
});

test("leaves the contract status alone for an unrecognised status string", async () => {
  knownContract();

  await POST(connectXml("env-1", "authoritativecopy"));

  assert.equal(contract.update.mock.callCount(), 1);
  assert.equal(updateData().status, undefined);
});

// ── Unknown envelopes ────────────────────────────────────────────────────────

test("acknowledges and ignores an envelope with no matching contract", async () => {
  contract.findFirst.mock.mockImplementation(async () => null);

  const response = await POST(connectXml("env-unknown", "completed"));

  assert.equal(response.status, 200);
  assert.deepEqual(await bodyOf(response), { ok: true });
  assert.equal(
    contract.update.mock.callCount(),
    0,
    "an unknown envelope must never write to a contract",
  );
  assert.equal(downloadSignedPdf.mock.callCount(), 0);
  assert.equal(uploadToPrivateS3.mock.callCount(), 0);
});

test("does not archive a PDF for an unknown completed envelope", async () => {
  process.env.AWS_REGION = "us-east-2";
  contract.findFirst.mock.mockImplementation(async () => null);

  await POST(jsonRequest({ EnvelopeID: "env-unknown", Status: "completed" }));

  assert.equal(downloadSignedPdf.mock.callCount(), 0);
});

// ── Archiving the signed PDF on completion ───────────────────────────────────

test("archives the signed PDF to S3 when an envelope completes", async () => {
  process.env.AWS_REGION = "us-east-2";
  knownContract();

  const response = await POST(connectXml("env-123", "Completed"));

  assert.deepEqual(await bodyOf(response), { ok: true });

  assert.equal(downloadSignedPdf.mock.callCount(), 1);
  assert.deepEqual(downloadSignedPdf.mock.calls[0]?.arguments, ["env-123"]);

  const [key, body, contentType] = uploadToPrivateS3.mock.calls[0]?.arguments ?? [];
  assert.equal(key, "contracts/rel-1/signed-env-123.pdf");
  assert.deepEqual(body, Buffer.from("signed-pdf"));
  assert.equal(contentType, "application/pdf");

  assert.deepEqual(updateData(), {
    status: "COMPLETE",
    docusignStatus: "Completed",
    s3Key: "contracts/rel-1/signed-env-123.pdf",
  });
});

test("still marks the contract COMPLETE when archival fails", async () => {
  process.env.AWS_REGION = "us-east-2";
  knownContract();
  downloadSignedPdf.mock.mockImplementation(async () => {
    throw new Error("DocuSign download failed");
  });

  const consoleError = mock.method(console, "error", () => undefined);

  try {
    const response = await POST(connectXml("env-123", "completed"));

    assert.deepEqual(await bodyOf(response), { ok: true });
    assert.equal(uploadToPrivateS3.mock.callCount(), 0);
    assert.deepEqual(updateData(), {
      status: "COMPLETE",
      docusignStatus: "completed",
    });
    assert.equal(
      updateData().s3Key,
      undefined,
      "a failed archival must not point the contract at a missing object",
    );
    assert.equal(consoleError.mock.callCount(), 1);
  } finally {
    consoleError.mock.restore();
  }
});

test("still marks the contract COMPLETE when the S3 upload fails", async () => {
  process.env.AWS_REGION = "us-east-2";
  knownContract();
  uploadToPrivateS3.mock.mockImplementation(async () => {
    throw new Error("access denied");
  });

  const consoleError = mock.method(console, "error", () => undefined);

  try {
    await POST(connectXml("env-123", "completed"));

    assert.deepEqual(updateData(), {
      status: "COMPLETE",
      docusignStatus: "completed",
    });
  } finally {
    consoleError.mock.restore();
  }
});

test("skips archival when AWS_REGION is not configured", async () => {
  delete process.env.AWS_REGION;
  knownContract();

  await POST(connectXml("env-123", "completed"));

  assert.equal(downloadSignedPdf.mock.callCount(), 0);
  assert.equal(uploadToPrivateS3.mock.callCount(), 0);
  assert.deepEqual(updateData(), {
    status: "COMPLETE",
    docusignStatus: "completed",
  });
});

test("skips archival when the contract has no S3 bucket", async () => {
  process.env.AWS_REGION = "us-east-2";
  knownContract({ s3Bucket: null });

  await POST(connectXml("env-123", "completed"));

  assert.equal(downloadSignedPdf.mock.callCount(), 0);
  assert.deepEqual(updateData(), {
    status: "COMPLETE",
    docusignStatus: "completed",
  });
});

test("never archives for a non-completed status", async () => {
  process.env.AWS_REGION = "us-east-2";
  knownContract();

  await POST(connectXml("env-123", "delivered"));

  assert.equal(downloadSignedPdf.mock.callCount(), 0);
  assert.equal(uploadToPrivateS3.mock.callCount(), 0);
  assert.equal(updateData().status, "SENT_FOR_SIGNING");
});
