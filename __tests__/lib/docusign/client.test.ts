import assert from "node:assert/strict";
import test from "node:test";

import { buildEnvelopeDefinition } from "@/lib/docusign/client";

const OPTIONS = {
  pdfBuffer: Buffer.from("%PDF-1.7"),
  documentName: "Services agreement",
  signerEmail: "client@example.com",
  signerName: "client@example.com",
  adminEmail: "admin@example.com",
  adminName: "Admin",
  webhookUrl: "https://destinlmincy.com/api/webhooks/docusign",
};

test("the envelope asks Connect to HMAC-sign every notification", () => {
  const notification = buildEnvelopeDefinition(OPTIONS).eventNotification;

  assert.ok(notification, "the envelope must register a Connect notification");
  assert.equal(
    notification.includeHMAC,
    "true",
    "the webhook fails closed, so unsigned notifications would all be rejected",
  );
  assert.equal(notification.requireAcknowledgment, "true");
  assert.equal(notification.url, OPTIONS.webhookUrl);
});

test("the envelope subject stays within DocuSign's 100-character limit", () => {
  const subject = buildEnvelopeDefinition({
    ...OPTIONS,
    documentName: "A".repeat(200),
  }).emailSubject;

  assert.equal(subject?.length, 100);
  assert.ok(subject?.startsWith("Please sign: "));
});

test("the envelope routes the client signer before the admin countersigner", () => {
  const signers = buildEnvelopeDefinition(OPTIONS).recipients?.signers ?? [];

  assert.deepEqual(
    signers.map(({ email, routingOrder }) => [email, routingOrder]),
    [
      ["client@example.com", "1"],
      ["admin@example.com", "2"],
    ],
  );
});
