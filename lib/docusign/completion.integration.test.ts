import "dotenv/config";

import assert from "node:assert/strict";
import { setTimeout as delay } from "node:timers/promises";
import { after, beforeEach, test } from "node:test";

import { prisma } from "@/lib/db/client";
import { completeSignedContract, type CompletionDependencies } from "./completion";

const slugPrefix = `factory002-complete-${Date.now()}`;

beforeEach(() => {
  process.env.AWS_REGION = "us-east-1";
  process.env.S3_PRIVATE_BUCKET = "factory002-test-bucket";
});

after(async () => {
  await prisma.clientRelationship.deleteMany({
    where: { slug: { startsWith: slugPrefix } },
  });
  await prisma.$disconnect();
});

async function sentContract(suffix: string) {
  const relationship = await prisma.clientRelationship.create({
    data: { name: `Complete ${suffix}`, slug: `${slugPrefix}-${suffix}` },
  });
  const contract = await prisma.contract.create({
    data: {
      clientRelationshipId: relationship.id,
      signerEmail: `client-${suffix}@example.com`,
      status: "SENT_FOR_SIGNING",
      docusignEnvelopeId: `env-${suffix}`,
      s3Key: `contracts/${relationship.id}/generated.pdf`,
      s3Bucket: "factory002-test-bucket",
    },
  });
  return { relationship, contract, envelopeId: `env-${suffix}` };
}

function countingStore() {
  const uploads: string[] = [];
  const dependencies: CompletionDependencies = {
    downloadSignedPdf: async () => {
      // Keep the archive open so a concurrent delivery overlaps it.
      await delay(150);
      return Buffer.from("%PDF-signed");
    },
    uploadToPrivateS3: async (key) => {
      uploads.push(key);
      return { bucket: "factory002-test-bucket", key };
    },
  };
  return { uploads, dependencies };
}

test("two concurrent completion notifications upload the signed PDF once", async () => {
  const { relationship, contract, envelopeId } = await sentContract("race");
  const { uploads, dependencies } = countingStore();
  const envelope = {
    contractId: contract.id,
    clientRelationshipId: relationship.id,
    envelopeId,
    docusignStatus: "completed",
  };

  const results = await Promise.all([
    completeSignedContract(envelope, dependencies),
    completeSignedContract(envelope, dependencies),
  ]);

  assert.equal(uploads.length, 1, "the signed PDF must be uploaded exactly once");
  assert.deepEqual(
    results.map(({ status }) => status).sort(),
    ["completed", "in-progress"],
  );

  const stored = await prisma.contract.findUniqueOrThrow({ where: { id: contract.id } });
  assert.equal(stored.status, "COMPLETE");
  assert.equal(stored.s3Key, `contracts/${relationship.id}/signed-${envelopeId}.pdf`);
  assert.equal(stored.signedPdfArchiveClaimedAt, null);

  // DocuSign redelivers the 409'd notification later: it is acknowledged
  // without a second upload.
  const replay = await completeSignedContract(envelope, dependencies);
  assert.deepEqual(replay, { status: "already-complete" });
  assert.equal(uploads.length, 1);
});

test("a failed archive leaves the contract open and a replay completes it", async () => {
  const { relationship, contract, envelopeId } = await sentContract("retry");
  const envelope = {
    contractId: contract.id,
    clientRelationshipId: relationship.id,
    envelopeId,
    docusignStatus: "completed",
  };

  const original = console.error;
  console.error = () => undefined;
  let failed;
  try {
    failed = await completeSignedContract(envelope, {
      downloadSignedPdf: async () => Buffer.from("%PDF-signed"),
      uploadToPrivateS3: async () => {
        throw new Error("AccessDenied");
      },
    });
  } finally {
    console.error = original;
  }
  assert.deepEqual(failed, { status: "archive-failed" });

  const open = await prisma.contract.findUniqueOrThrow({ where: { id: contract.id } });
  assert.equal(open.status, "SENT_FOR_SIGNING");
  assert.equal(open.signedPdfArchiveClaimedAt, null, "the claim must be released");

  const { uploads, dependencies } = countingStore();
  const replay = await completeSignedContract(envelope, dependencies);
  assert.equal(replay.status, "completed");
  assert.equal(uploads.length, 1);
  const done = await prisma.contract.findUniqueOrThrow({ where: { id: contract.id } });
  assert.equal(done.status, "COMPLETE");
});

test("without S3 configuration nothing is claimed or completed", async () => {
  const { relationship, contract, envelopeId } = await sentContract("nos3");
  delete process.env.S3_PRIVATE_BUCKET;

  const result = await completeSignedContract(
    {
      contractId: contract.id,
      clientRelationshipId: relationship.id,
      envelopeId,
      docusignStatus: "completed",
    },
    countingStore().dependencies,
  );

  assert.deepEqual(result, { status: "storage-not-configured" });
  const stored = await prisma.contract.findUniqueOrThrow({ where: { id: contract.id } });
  assert.equal(stored.status, "SENT_FOR_SIGNING");
  assert.equal(stored.signedPdfArchiveClaimedAt, null);
});

test("a guarded status write on a completed contract is reported as P2025", async () => {
  // The webhook relies on this to drop a late "delivered" notification that
  // raced a completion (app/api/webhooks/docusign/route.ts updateUnlessTerminal).
  const { contract } = await sentContract("terminal");
  await prisma.contract.update({ where: { id: contract.id }, data: { status: "COMPLETE" } });

  await assert.rejects(
    prisma.contract.update({
      where: { id: contract.id, status: { notIn: ["COMPLETE", "VOIDED"] } },
      data: { status: "SENT_FOR_SIGNING", docusignStatus: "delivered" },
    }),
    (error: unknown) => (error as { code?: unknown }).code === "P2025",
  );

  const stored = await prisma.contract.findUniqueOrThrow({ where: { id: contract.id } });
  assert.equal(stored.status, "COMPLETE");
});
