import assert from "node:assert/strict";
import crypto from "node:crypto";
import test, { before, beforeEach, mock } from "node:test";

import type { NextRequest } from "next/server";

import { argsOf, prismaModel, resetModels } from "@/__tests__/helpers/prisma-mock";

/**
 * The Connect webhook is unauthenticated and fed by DocuSign in two different
 * encodings, so the parsing, status mapping and archival branches are all
 * exercised through the real `POST` handler. Only the outbound edges (Prisma,
 * the DocuSign download and the S3 upload) are stubbed.
 *
 * HMAC verification fails closed, so every request is signed with `TEST_KEY`
 * unless a test says otherwise.
 */
const contract = prismaModel("findFirst", "update", "updateMany", "findUnique");

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
const HMAC_HEADER = "x-docusign-signature-1";
const TEST_KEY = "test-key";
const TEST_REGION = "us-east-2";
const TEST_BUCKET = "contracts-bucket";

before(async () => {
  ({ POST } = await import("@/app/api/webhooks/docusign/route"));
});

beforeEach(() => {
  resetModels(contract);
  contract.updateMany.mock.mockImplementation(async () => ({ count: 1 }));

  downloadSignedPdf.mock.resetCalls();
  downloadSignedPdf.mock.mockImplementation(async () => Buffer.from("signed-pdf"));
  uploadToPrivateS3.mock.resetCalls();
  uploadToPrivateS3.mock.mockImplementation(async () => ({
    bucket: "contracts-bucket",
    key: "k",
  }));

  process.env.DOCUSIGN_CONNECT_HMAC_KEY = TEST_KEY;
  process.env.AWS_REGION = TEST_REGION;
  process.env.S3_PRIVATE_BUCKET = TEST_BUCKET;
});

// ── Fixtures ─────────────────────────────────────────────────────────────────

/** The signature DocuSign would send for this exact body under this key. */
function sign(rawBody: string, key = TEST_KEY): string {
  return crypto.createHmac("sha256", key).update(rawBody).digest("base64");
}

/**
 * A request signed with `TEST_KEY`, unless `headers` sets the signature
 * header itself.
 */
function request(
  body: string,
  contentType: string,
  headers: Record<string, string> = {},
): NextRequest {
  return new Request(ENDPOINT, {
    method: "POST",
    headers: { "content-type": contentType, [HMAC_HEADER]: sign(body), ...headers },
    body,
  }) as unknown as NextRequest;
}

/** A request with no signature header at all. */
function unsignedRequest(body: string, contentType: string): NextRequest {
  return new Request(ENDPOINT, {
    method: "POST",
    headers: { "content-type": contentType },
    body,
  }) as unknown as NextRequest;
}

function xmlRequest(body: string): NextRequest {
  return request(body, "text/xml");
}

function connectXmlBody(envelopeId: string, status: string): string {
  return (
    `<?xml version="1.0" encoding="utf-8"?>` +
    `<DocuSignEnvelopeInformation><EnvelopeStatus>` +
    `<EnvelopeID>${envelopeId}</EnvelopeID><Status>${status}</Status>` +
    `</EnvelopeStatus></DocuSignEnvelopeInformation>`
  );
}

function connectXml(envelopeId: string, status: string): NextRequest {
  return xmlRequest(connectXmlBody(envelopeId, status));
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

/**
 * The `data` of the completion write. Completion goes through `updateMany`:
 * call 0 takes the archive claim, call 1 writes COMPLETE (or releases).
 */
function completionData(): Record<string, unknown> {
  return argsOf(contract.updateMany, 1).data;
}

/** The contract status the handler wrote, through either write path. */
function writtenStatus(): unknown {
  return contract.update.mock.callCount() > 0
    ? updateData().status
    : completionData().status;
}

/** No write may mark the contract COMPLETE. */
function assertNotCompleted(): void {
  assert.equal(contract.update.mock.callCount(), 0);
  for (const call of contract.updateMany.mock.calls) {
    const args = (call.arguments[0] ?? {}) as { data?: Record<string, unknown> };
    assert.notEqual(args.data?.status, "COMPLETE");
  }
}

// ── HMAC verification ────────────────────────────────────────────────────────

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
  assert.equal(contract.updateMany.mock.callCount(), 0);
  assert.equal(contract.findUnique.mock.callCount(), 0);
  assert.equal(downloadSignedPdf.mock.callCount(), 0);
  assert.equal(uploadToPrivateS3.mock.callCount(), 0);
}

test("accepts a JSON notification carrying a correctly computed HMAC signature", async () => {
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
  assert.equal(completionData().status, "COMPLETE");
});

test("rejects a tampered signature with 401", async () => {
  knownContract();

  const body = JSON.stringify({ EnvelopeID: "env-signed", Status: "completed" });
  const response = await POST(signedRequest(body, tamper(sign(body))));

  assert.equal(response.status, 401);
  assert.deepEqual(await bodyOf(response), { error: "Invalid signature" });
  assertNothingProcessed();
});

test("rejects a signature computed over a different body", async () => {
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
  knownContract();

  const body = JSON.stringify({ EnvelopeID: "env-signed", Status: "completed" });
  const response = await POST(signedRequest(body, sign(body, "not-the-key")));

  assert.equal(response.status, 401);
  assertNothingProcessed();
});

test("rejects a request with no signature header when an HMAC key is configured", async () => {
  knownContract();

  const response = await POST(
    unsignedRequest(connectXmlBody("env-signed", "completed"), "text/xml"),
  );

  assert.equal(response.status, 401);
  assert.deepEqual(await bodyOf(response), { error: "Invalid signature" });
  assertNothingProcessed();
});

test("rejects an empty signature header when an HMAC key is configured", async () => {
  knownContract();

  const body = JSON.stringify({ EnvelopeID: "env-signed", Status: "completed" });
  const response = await POST(signedRequest(body, ""));

  assert.equal(response.status, 401);
  assertNothingProcessed();
});

test("rejects a signature whose decoded length does not match the digest", async () => {
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
  knownContract();

  const body = JSON.stringify({ EnvelopeID: "env-signed", Status: "completed" });
  const response = await POST(signedRequest(body, "!!!not-base64!!!"));

  assert.equal(response.status, 401);
  assertNothingProcessed();
});

test("verifies the signature before parsing the body", async () => {
  // Malformed JSON would be a 400 on its own; the signature gate comes first,
  // so an unsigned request must not reveal anything about the body.
  const response = await POST(unsignedRequest("{not-json", "application/json"));

  assert.equal(response.status, 401);
  assert.deepEqual(await bodyOf(response), { error: "Invalid signature" });
});

test("fails closed when no HMAC key is configured, even for a request that carries a signature", async () => {
  delete process.env.DOCUSIGN_CONNECT_HMAC_KEY;
  knownContract();

  const body = JSON.stringify({ EnvelopeID: "env-unsigned", Status: "completed" });
  const response = await POST(signedRequest(body, sign(body)));

  assert.equal(
    response.status,
    401,
    "an unconfigured HMAC key must reject traffic rather than stay permissive",
  );
  assertNothingProcessed();
});

test("rejects an unsigned request when no HMAC key is configured", async () => {
  delete process.env.DOCUSIGN_CONNECT_HMAC_KEY;
  knownContract();

  const response = await POST(
    unsignedRequest(connectXmlBody("env-unsigned", "Sent"), "text/xml"),
  );

  assert.equal(response.status, 401);
  assertNothingProcessed();
});

test("treats an empty HMAC key as no key at all", async () => {
  process.env.DOCUSIGN_CONNECT_HMAC_KEY = "";
  knownContract();

  // A digest computed under the empty key must not slip through.
  const body = JSON.stringify({ EnvelopeID: "env-unsigned", Status: "Sent" });
  const response = await POST(signedRequest(body, sign(body, "")));

  assert.equal(response.status, 401);
  assertNothingProcessed();
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
  assert.equal(writtenStatus(), "COMPLETE");
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
  assert.equal(writtenStatus(), "COMPLETE");
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
  assert.equal(writtenStatus(), "COMPLETE");
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
  assert.equal(completionData().status, "COMPLETE");
  assert.equal(completionData().docusignStatus, "completed");
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
    knownContract();

    await POST(connectXml("env-1", dsStatus));

    if (expected === "COMPLETE") {
      // Completion is written by the archive step, after the upload.
      assert.equal(contract.update.mock.callCount(), 0);
      assert.equal(completionData().status, expected);
      assert.equal(completionData().docusignStatus, dsStatus);
      return;
    }
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
  assert.equal(contract.updateMany.mock.callCount(), 0);
  assert.equal(downloadSignedPdf.mock.callCount(), 0);
  assert.equal(uploadToPrivateS3.mock.callCount(), 0);
});

test("does not archive a PDF for an unknown completed envelope", async () => {
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
  assert.equal(contract.updateMany.mock.callCount(), 0);
});

test("does not record an intermediate status against a terminal contract", async () => {
  knownContract({ status: "COMPLETE" });

  await POST(connectXml("env-123", "processing"));

  assert.equal(contract.update.mock.callCount(), 0);
});

test("does not re-archive when DocuSign replays a completion", async () => {
  knownContract({ status: "COMPLETE" });

  await POST(connectXml("env-123", "completed"));

  assert.equal(
    downloadSignedPdf.mock.callCount(),
    0,
    "a redelivered completion must not re-download and re-upload the PDF",
  );
  assert.equal(uploadToPrivateS3.mock.callCount(), 0);
  assert.equal(contract.update.mock.callCount(), 0);
  assert.equal(contract.updateMany.mock.callCount(), 0);
});

// ── Archiving the signed PDF on completion ───────────────────────────────────

/** Silences the expected `console.error` from a failed archive. */
async function withQuietErrors<T>(run: () => Promise<T>): Promise<T> {
  const consoleError = mock.method(console, "error", () => undefined);
  try {
    return await run();
  } finally {
    consoleError.mock.restore();
  }
}

test("archives the signed PDF to S3 before marking the contract COMPLETE", async () => {
  knownContract();

  const response = await POST(connectXml("env-123", "Completed"));

  assert.equal(response.status, 200);
  assert.deepEqual(await bodyOf(response), { ok: true });

  const claim = argsOf(contract.updateMany, 0);
  assert.equal(claim.where.id, "contract-1");
  assert.equal(claim.where.docusignEnvelopeId, "env-123");
  assert.ok(claim.data.signedPdfArchiveClaimedAt instanceof Date);

  assert.equal(downloadSignedPdf.mock.callCount(), 1);
  assert.deepEqual(downloadSignedPdf.mock.calls[0]?.arguments, ["env-123"]);

  const [key, body, contentType] = uploadToPrivateS3.mock.calls[0]?.arguments ?? [];
  assert.equal(key, "contracts/rel-1/signed-env-123.pdf");
  assert.deepEqual(body, Buffer.from("signed-pdf"));
  assert.equal(contentType, "application/pdf");

  assert.deepEqual(completionData(), {
    status: "COMPLETE",
    docusignStatus: "Completed",
    s3Key: "k",
    s3Bucket: "contracts-bucket",
    signedPdfArchiveClaimedAt: null,
  });
  assert.equal(contract.update.mock.callCount(), 0);
});

test("does not mark the contract COMPLETE when the signed PDF download fails", async () => {
  knownContract();
  downloadSignedPdf.mock.mockImplementation(async () => {
    throw new Error("DocuSign download failed");
  });

  const response = await withQuietErrors(() =>
    POST(connectXml("env-123", "completed")),
  );

  assert.equal(response.status, 500, "a non-2xx answer makes Connect retry");
  assert.equal(uploadToPrivateS3.mock.callCount(), 0);
  assertNotCompleted();
  assert.deepEqual(
    completionData(),
    { signedPdfArchiveClaimedAt: null },
    "a failed archive must release its claim so a retry can run",
  );
});

test("does not mark the contract COMPLETE when the S3 upload fails", async () => {
  knownContract();
  uploadToPrivateS3.mock.mockImplementation(async () => {
    throw new Error("access denied");
  });

  const response = await withQuietErrors(() =>
    POST(connectXml("env-123", "completed")),
  );

  assert.equal(response.status, 500);
  assertNotCompleted();
  assert.deepEqual(completionData(), { signedPdfArchiveClaimedAt: null });
});

test("refuses to complete when AWS_REGION is not configured", async () => {
  delete process.env.AWS_REGION;
  knownContract();

  const response = await POST(connectXml("env-123", "completed"));

  assert.equal(response.status, 503);
  assert.equal(downloadSignedPdf.mock.callCount(), 0);
  assert.equal(uploadToPrivateS3.mock.callCount(), 0);
  assert.equal(contract.updateMany.mock.callCount(), 0);
  assertNotCompleted();
});

test("refuses to complete when S3_PRIVATE_BUCKET is not configured", async () => {
  delete process.env.S3_PRIVATE_BUCKET;
  knownContract();

  const response = await POST(connectXml("env-123", "completed"));

  assert.equal(response.status, 503);
  assert.equal(downloadSignedPdf.mock.callCount(), 0);
  assert.equal(contract.updateMany.mock.callCount(), 0);
  assertNotCompleted();
});

test("archives into the configured bucket even when the contract has no stored bucket", async () => {
  knownContract({ s3Bucket: null });

  const response = await POST(connectXml("env-123", "completed"));

  assert.equal(response.status, 200);
  assert.equal(downloadSignedPdf.mock.callCount(), 1);
  assert.equal(completionData().status, "COMPLETE");
  assert.equal(completionData().s3Bucket, "contracts-bucket");
});

test("a replay after a failed archive completes the contract", async () => {
  knownContract();
  downloadSignedPdf.mock.mockImplementation(async () => {
    throw new Error("DocuSign download failed");
  });

  const failed = await withQuietErrors(() => POST(connectXml("env-123", "completed")));
  assert.equal(failed.status, 500);

  downloadSignedPdf.mock.mockImplementation(async () => Buffer.from("signed-pdf"));
  contract.updateMany.mock.resetCalls();

  const replayed = await POST(connectXml("env-123", "completed"));

  assert.equal(replayed.status, 200);
  assert.equal(completionData().status, "COMPLETE");
});

test("answers 409 while another delivery holds the archive claim", async () => {
  knownContract();
  contract.updateMany.mock.mockImplementation(async () => ({ count: 0 }));
  contract.findUnique.mock.mockImplementation(async () => ({
    status: "SENT_FOR_SIGNING",
  }));

  const response = await POST(connectXml("env-123", "completed"));

  assert.equal(response.status, 409);
  assert.equal(downloadSignedPdf.mock.callCount(), 0);
  assert.equal(uploadToPrivateS3.mock.callCount(), 0);
});

test("acknowledges a completion that a concurrent delivery already finished", async () => {
  knownContract();
  contract.updateMany.mock.mockImplementation(async () => ({ count: 0 }));
  contract.findUnique.mock.mockImplementation(async () => ({ status: "COMPLETE" }));

  const response = await POST(connectXml("env-123", "completed"));

  assert.equal(response.status, 200);
  assert.equal(downloadSignedPdf.mock.callCount(), 0);
});

test("never archives for a non-completed status", async () => {
  knownContract();

  await POST(connectXml("env-123", "delivered"));

  assert.equal(downloadSignedPdf.mock.callCount(), 0);
  assert.equal(uploadToPrivateS3.mock.callCount(), 0);
  assert.equal(updateData().status, "SENT_FOR_SIGNING");
});
