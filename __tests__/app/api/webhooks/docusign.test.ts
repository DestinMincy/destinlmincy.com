import assert from "node:assert/strict";
import crypto from "node:crypto";
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
const HMAC_KEY = process.env.DOCUSIGN_CONNECT_HMAC_KEY;

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

  if (HMAC_KEY === undefined) delete process.env.DOCUSIGN_CONNECT_HMAC_KEY;
  else process.env.DOCUSIGN_CONNECT_HMAC_KEY = HMAC_KEY;
});

// ── Fixtures ─────────────────────────────────────────────────────────────────

function request(
  body: string,
  contentType: string,
  headers: Record<string, string> = {},
): NextRequest {
  return new Request(ENDPOINT, {
    method: "POST",
    headers: { "content-type": contentType, ...headers },
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

// ── HMAC verification ────────────────────────────────────────────────────────

const HMAC_HEADER = "x-docusign-signature-1";
const TEST_KEY = "test-key";

/** The signature DocuSign would send for this exact body under this key. */
function sign(rawBody: string, key = TEST_KEY): string {
  return crypto.createHmac("sha256", key).update(rawBody).digest("base64");
}

/** A request carrying `signature` in the DocuSign Connect HMAC header. */
function signedRequest(
  body: string,
  signature: string,
  contentType = "application/json",
): NextRequest {
  return request(body, contentType, { [HMAC_HEADER]: signature });
}

/** Flips a bit in an otherwise valid signature, keeping its length intact. */
function tamper(signature: string): string {
  const bytes = Buffer.from(signature, "base64");
  bytes[0] = (bytes[0] ?? 0) ^ 0xff;
  return bytes.toString("base64");
}

/** No branch past the signature gate may run for a rejected request. */
function assertNothingProcessed(): void {
  assert.equal(
    contract.findFirst.mock.callCount(),
    0,
    "a rejected webhook must never reach the database",
  );
  assert.equal(contract.update.mock.callCount(), 0);
  assert.equal(downloadSignedPdf.mock.callCount(), 0);
  assert.equal(uploadToPrivateS3.mock.callCount(), 0);
}

test("accepts a JSON notification carrying a correctly computed HMAC signature", async () => {
  process.env.DOCUSIGN_CONNECT_HMAC_KEY = TEST_KEY;
  knownContract();

  const body = JSON.stringify({ EnvelopeID: "env-signed", Status: "Sent" });
  const response = await POST(signedRequest(body, sign(body)));

  assert.equal(response.status, 200);
  assert.deepEqual(await bodyOf(response), { ok: true });
  assert.deepEqual(argsOf(contract.findFirst).where, {
    docusignEnvelopeId: "env-signed",
  });
  assert.equal(updateData().status, "SENT_FOR_SIGNING");
});

test("accepts an XML Connect notification carrying a correctly computed HMAC signature", async () => {
  process.env.DOCUSIGN_CONNECT_HMAC_KEY = TEST_KEY;
  knownContract();

  const body =
    `<DocuSignEnvelopeInformation><EnvelopeStatus>` +
    `<EnvelopeID>env-xml-signed</EnvelopeID><Status>completed</Status>` +
    `</EnvelopeStatus></DocuSignEnvelopeInformation>`;

  const response = await POST(signedRequest(body, sign(body), "text/xml"));

  assert.equal(response.status, 200);
  assert.deepEqual(argsOf(contract.findFirst).where, {
    docusignEnvelopeId: "env-xml-signed",
  });
  assert.equal(updateData().status, "COMPLETE");
});

test("rejects a tampered signature with 401", async () => {
  process.env.DOCUSIGN_CONNECT_HMAC_KEY = TEST_KEY;
  knownContract();

  const body = JSON.stringify({ EnvelopeID: "env-signed", Status: "completed" });
  const response = await POST(signedRequest(body, tamper(sign(body))));

  assert.equal(response.status, 401);
  assert.deepEqual(await bodyOf(response), { error: "Invalid signature" });
  assertNothingProcessed();
});

test("rejects a signature computed over a different body", async () => {
  process.env.DOCUSIGN_CONNECT_HMAC_KEY = TEST_KEY;
  knownContract();

  const sent = JSON.stringify({ EnvelopeID: "env-signed", Status: "completed" });
  const signedElsewhere = sign(
    JSON.stringify({ EnvelopeID: "env-other", Status: "completed" }),
  );

  const response = await POST(signedRequest(sent, signedElsewhere));

  assert.equal(response.status, 401);
  assertNothingProcessed();
});

test("rejects a signature computed with the wrong key", async () => {
  process.env.DOCUSIGN_CONNECT_HMAC_KEY = TEST_KEY;
  knownContract();

  const body = JSON.stringify({ EnvelopeID: "env-signed", Status: "completed" });
  const response = await POST(signedRequest(body, sign(body, "not-the-key")));

  assert.equal(response.status, 401);
  assertNothingProcessed();
});

test("rejects a request with no signature header when an HMAC key is configured", async () => {
  process.env.DOCUSIGN_CONNECT_HMAC_KEY = TEST_KEY;
  knownContract();

  const response = await POST(connectXml("env-signed", "completed"));

  assert.equal(response.status, 401);
  assert.deepEqual(await bodyOf(response), { error: "Invalid signature" });
  assertNothingProcessed();
});

test("rejects an empty signature header when an HMAC key is configured", async () => {
  process.env.DOCUSIGN_CONNECT_HMAC_KEY = TEST_KEY;
  knownContract();

  const body = JSON.stringify({ EnvelopeID: "env-signed", Status: "completed" });
  const response = await POST(signedRequest(body, ""));

  assert.equal(response.status, 401);
  assertNothingProcessed();
});

test("rejects a signature whose decoded length does not match the digest", async () => {
  process.env.DOCUSIGN_CONNECT_HMAC_KEY = TEST_KEY;
  knownContract();

  const body = JSON.stringify({ EnvelopeID: "env-signed", Status: "completed" });
  // A truncated digest must never reach `timingSafeEqual`, which throws on
  // mismatched lengths.
  const truncated = Buffer.from(sign(body), "base64")
    .subarray(0, 16)
    .toString("base64");

  const response = await POST(signedRequest(body, truncated));

  assert.equal(response.status, 401);
  assertNothingProcessed();
});

test("rejects a signature that is not valid base64", async () => {
  process.env.DOCUSIGN_CONNECT_HMAC_KEY = TEST_KEY;
  knownContract();

  const body = JSON.stringify({ EnvelopeID: "env-signed", Status: "completed" });
  const response = await POST(signedRequest(body, "!!!not-base64!!!"));

  assert.equal(response.status, 401);
  assertNothingProcessed();
});

test("verifies the signature before parsing the body", async () => {
  process.env.DOCUSIGN_CONNECT_HMAC_KEY = TEST_KEY;

  // Malformed JSON would be a 400 on its own; the signature gate comes first,
  // so an unsigned request must not reveal anything about the body.
  const response = await POST(request("{not-json", "application/json"));

  assert.equal(response.status, 401);
  assert.deepEqual(await bodyOf(response), { error: "Invalid signature" });
});

test("skips verification entirely when no HMAC key is configured", async () => {
  delete process.env.DOCUSIGN_CONNECT_HMAC_KEY;
  knownContract();

  const body = JSON.stringify({ EnvelopeID: "env-unsigned", Status: "completed" });
  const response = await POST(signedRequest(body, "obviously-wrong"));

  assert.equal(
    response.status,
    200,
    "an unconfigured HMAC key must stay permissive rather than reject traffic",
  );
  assert.deepEqual(argsOf(contract.findFirst).where, {
    docusignEnvelopeId: "env-unsigned",
  });
});

test("accepts an unsigned request when no HMAC key is configured", async () => {
  delete process.env.DOCUSIGN_CONNECT_HMAC_KEY;
  knownContract();

  const response = await POST(connectXml("env-unsigned", "Sent"));

  assert.equal(response.status, 200);
  assert.equal(updateData().status, "SENT_FOR_SIGNING");
});

test("treats an empty HMAC key as no key at all", async () => {
  process.env.DOCUSIGN_CONNECT_HMAC_KEY = "";
  knownContract();

  const response = await POST(connectXml("env-unsigned", "Sent"));

  assert.equal(response.status, 200);
  assert.equal(contract.findFirst.mock.callCount(), 1);
});

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

test("ignores a recipient-level Status that precedes the envelope Status", async () => {
  knownContract();

  // Real Connect XML nests a <Status> per recipient. A recipient can be
  // "Completed" while the envelope is still out for signature, so the
  // recipient block must be stripped before the envelope status is read.
  await POST(
    xmlRequest(
      `<DocuSignEnvelopeInformation><EnvelopeStatus>` +
        `<RecipientStatuses><RecipientStatus>` +
        `<Email>client@example.com</Email><Status>Completed</Status>` +
        `</RecipientStatus></RecipientStatuses>` +
        `<EnvelopeID>env-recipients</EnvelopeID><Status>Sent</Status>` +
        `</EnvelopeStatus></DocuSignEnvelopeInformation>`,
    ),
  );

  assert.deepEqual(argsOf(contract.findFirst).where, {
    docusignEnvelopeId: "env-recipients",
  });
  assert.equal(updateData().docusignStatus, "Sent");
  assert.equal(
    updateData().status,
    "SENT_FOR_SIGNING",
    "one signed recipient must not complete the envelope",
  );
});

test("strips recipient blocks regardless of tag case", async () => {
  knownContract();

  await POST(
    xmlRequest(
      `<envelopestatus>` +
        `<recipientstatuses><recipientstatus><status>Completed</status></recipientstatus></recipientstatuses>` +
        `<envelopeid>env-lower</envelopeid><status>Delivered</status>` +
        `</envelopestatus>`,
    ),
  );

  assert.equal(updateData().docusignStatus, "Delivered");
  assert.equal(updateData().status, "SENT_FOR_SIGNING");
});

test("strips every recipient block, not just the first", async () => {
  knownContract();

  await POST(
    xmlRequest(
      `<EnvelopeStatus>` +
        `<RecipientStatuses><RecipientStatus><Status>Completed</Status></RecipientStatus></RecipientStatuses>` +
        `<RecipientStatuses><RecipientStatus><Status>Declined</Status></RecipientStatus></RecipientStatuses>` +
        `<EnvelopeID>env-two-blocks</EnvelopeID><Status>Sent</Status>` +
        `</EnvelopeStatus>`,
    ),
  );

  assert.equal(updateData().docusignStatus, "Sent");
});

test("acknowledges XML whose only Status lives inside a recipient block", async () => {
  const response = await POST(
    xmlRequest(
      `<EnvelopeStatus><EnvelopeID>env-no-status</EnvelopeID>` +
        `<RecipientStatuses><RecipientStatus><Status>Completed</Status></RecipientStatus></RecipientStatuses>` +
        `</EnvelopeStatus>`,
    ),
  );

  assert.deepEqual(await bodyOf(response), {
    ok: true,
    message: "No envelope data",
  });
  assert.equal(contract.findFirst.mock.callCount(), 0);
});

test("parses XML delivered under a non-JSON content type", async () => {
  knownContract();

  await POST(
    request(
      "<EnvelopeStatus><EnvelopeID>env-multipart</EnvelopeID><Status>completed</Status></EnvelopeStatus>",
      "multipart/form-data; boundary=--abc",
    ),
  );

  assert.deepEqual(argsOf(contract.findFirst).where, {
    docusignEnvelopeId: "env-multipart",
  });
  assert.equal(updateData().status, "COMPLETE");
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

test("reads the nested data/envelopeSummary shape of the modern Connect JSON", async () => {
  knownContract();

  await POST(
    jsonRequest({
      event: "envelope-completed",
      apiVersion: "v2.1",
      data: {
        envelopeId: "env-nested",
        envelopeSummary: { status: "completed", emailSubject: "Please sign" },
      },
    }),
  );

  assert.deepEqual(argsOf(contract.findFirst).where, {
    docusignEnvelopeId: "env-nested",
  });
  assert.equal(updateData().status, "COMPLETE");
  assert.equal(updateData().docusignStatus, "completed");
});

test("acknowledges a nested payload with no envelopeSummary", async () => {
  const response = await POST(jsonRequest({ data: { envelopeId: "env-nested" } }));

  assert.deepEqual(await bodyOf(response), {
    ok: true,
    message: "No envelope data",
  });
  assert.equal(contract.findFirst.mock.callCount(), 0);
});

test("acknowledges a nested payload whose envelopeSummary status is not a string", async () => {
  const response = await POST(
    jsonRequest({ data: { envelopeId: "env-nested", envelopeSummary: { status: 7 } } }),
  );

  assert.deepEqual(await bodyOf(response), {
    ok: true,
    message: "No envelope data",
  });
  assert.equal(contract.findFirst.mock.callCount(), 0);
});

test("lets the nested data block win over flat fields in the same payload", async () => {
  knownContract();

  const response = await POST(
    jsonRequest({
      data: { envelopeId: "env-nested" },
      EnvelopeID: "env-flat",
      Status: "completed",
    }),
  );

  assert.deepEqual(
    await bodyOf(response),
    { ok: true, message: "No envelope data" },
    "a payload in the nested shape must not be re-read as a flat one",
  );
  assert.equal(contract.findFirst.mock.callCount(), 0);
});

test("falls back to the flat fields when the nested data block has no envelope id", async () => {
  knownContract();

  await POST(
    jsonRequest({
      data: { envelopeSummary: { status: "completed" } },
      EnvelopeID: "env-flat",
      Status: "voided",
    }),
  );

  assert.deepEqual(argsOf(contract.findFirst).where, {
    docusignEnvelopeId: "env-flat",
  });
  assert.equal(updateData().status, "VOIDED");
});

test("falls back to the flat fields when data is null", async () => {
  knownContract();

  await POST(jsonRequest({ data: null, EnvelopeID: "env-flat", Status: "Sent" }));

  assert.deepEqual(argsOf(contract.findFirst).where, {
    docusignEnvelopeId: "env-flat",
  });
  assert.equal(updateData().status, "SENT_FOR_SIGNING");
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

test("reads only the contract fields the handler needs", async () => {
  knownContract();

  await POST(connectXml("env-123", "Sent"));

  assert.deepEqual(argsOf(contract.findFirst).select, {
    id: true,
    clientRelationshipId: true,
    status: true,
    s3Bucket: true,
  });
});

// ── Terminal states never regress ────────────────────────────────────────────

test("ignores a webhook for a contract already marked COMPLETE", async () => {
  knownContract({ status: "COMPLETE" });

  const response = await POST(connectXml("env-123", "voided"));

  assert.equal(response.status, 200);
  assert.deepEqual(await bodyOf(response), { ok: true });
  assert.equal(
    contract.update.mock.callCount(),
    0,
    "a completed contract must never be walked back to VOIDED",
  );
});

test("ignores a webhook for a contract already marked VOIDED", async () => {
  knownContract({ status: "VOIDED" });

  const response = await POST(connectXml("env-123", "completed"));

  assert.equal(response.status, 200);
  assert.deepEqual(await bodyOf(response), { ok: true });
  assert.equal(contract.update.mock.callCount(), 0);
});

test("does not record an intermediate status against a terminal contract", async () => {
  knownContract({ status: "COMPLETE" });

  await POST(connectXml("env-123", "processing"));

  assert.equal(contract.update.mock.callCount(), 0);
});

test("does not re-archive when DocuSign replays a completion", async () => {
  process.env.AWS_REGION = "us-east-2";
  knownContract({ status: "COMPLETE" });

  await POST(connectXml("env-123", "completed"));

  assert.equal(
    downloadSignedPdf.mock.callCount(),
    0,
    "a redelivered completion must not re-download and re-upload the PDF",
  );
  assert.equal(uploadToPrivateS3.mock.callCount(), 0);
  assert.equal(contract.update.mock.callCount(), 0);
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
