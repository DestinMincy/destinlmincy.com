import "dotenv/config";

import assert from "node:assert/strict";
import { setTimeout as delay } from "node:timers/promises";
import { after, test } from "node:test";

import { prisma } from "@/lib/db/client";
import type { SendEnvelopeOptions } from "@/lib/docusign/client";
import { sendContractToDocuSign, type SendContractDependencies } from "./workflow";

const slugPrefix = `factory002-send-${Date.now()}`;

after(async () => {
  await prisma.clientRelationship.deleteMany({
    where: { slug: { startsWith: slugPrefix } },
  });
  await prisma.$disconnect();
});

async function generatedContract(suffix: string) {
  const relationship = await prisma.clientRelationship.create({
    data: { name: `Send ${suffix}`, slug: `${slugPrefix}-${suffix}` },
  });
  const template = await prisma.contractTemplate.create({
    data: {
      clientRelationshipId: relationship.id,
      name: "Services agreement",
      status: "PUBLISHED",
      versions: {
        create: {
          versionNumber: 1,
          snapshot: { blocks: [], variables: [] },
          publishedAt: new Date(),
        },
      },
    },
    include: { versions: true },
  });
  const contract = await prisma.contract.create({
    data: {
      clientRelationshipId: relationship.id,
      contractTemplateVersionId: template.versions[0]!.id,
      signerEmail: `client-${suffix}@example.com`,
      status: "DRAFT",
      s3Key: `contracts/${relationship.id}/${suffix}.pdf`,
      s3Bucket: "factory002-test-bucket",
    },
  });
  return { relationship, contract };
}

function dependencies(
  createEnvelope: SendContractDependencies["createEnvelope"],
): SendContractDependencies {
  return {
    createEnvelope,
    getPdf: async () => Buffer.from("%PDF-1.7\n"),
    admin: { email: "admin@example.com", name: "Admin" },
    webhookUrl: "https://example.com/api/webhooks/docusign",
  };
}

test("two concurrent sends of one contract create exactly one envelope", async () => {
  const { relationship, contract } = await generatedContract("race");

  const created: SendEnvelopeOptions[] = [];
  const createEnvelope = async (options: SendEnvelopeOptions) => {
    created.push(options);
    // Hold the provider call open so the second send overlaps the first.
    await delay(150);
    return { envelopeId: "env-race-1", status: "sent" };
  };

  const results = await Promise.all([
    sendContractToDocuSign(relationship.id, contract.id, dependencies(createEnvelope)),
    sendContractToDocuSign(relationship.id, contract.id, dependencies(createEnvelope)),
  ]);

  assert.equal(created.length, 1, "the provider must be called exactly once");
  assert.deepEqual(
    results.map(({ status }) => status).sort(),
    ["already-sent", "sent"],
  );

  const stored = await prisma.contract.findUniqueOrThrow({ where: { id: contract.id } });
  assert.equal(stored.docusignEnvelopeId, "env-race-1");
  assert.equal(stored.status, "SENT_FOR_SIGNING");
});

test("a provider failure releases the claim so a later send succeeds", async () => {
  const { relationship, contract } = await generatedContract("retry");

  await assert.rejects(
    sendContractToDocuSign(
      relationship.id,
      contract.id,
      dependencies(async () => {
        throw new Error("DocuSign is down");
      }),
    ),
    /DocuSign is down/,
  );

  const released = await prisma.contract.findUniqueOrThrow({ where: { id: contract.id } });
  assert.equal(released.docusignEnvelopeId, null, "the pending claim must be released");
  assert.equal(released.status, "DRAFT");

  let calls = 0;
  const retried = await sendContractToDocuSign(
    relationship.id,
    contract.id,
    dependencies(async () => {
      calls += 1;
      return { envelopeId: "env-retry-1", status: "sent" };
    }),
  );

  assert.deepEqual(retried, { status: "sent", envelopeId: "env-retry-1" });
  assert.equal(calls, 1);
  const sent = await prisma.contract.findUniqueOrThrow({ where: { id: contract.id } });
  assert.equal(sent.docusignEnvelopeId, "env-retry-1");
});

test("a send for another relationship's contract finds nothing", async () => {
  const { contract } = await generatedContract("scope");
  const other = await prisma.clientRelationship.create({
    data: { name: "Other", slug: `${slugPrefix}-other` },
  });

  const result = await sendContractToDocuSign(
    other.id,
    contract.id,
    dependencies(async () => {
      throw new Error("must not be called");
    }),
  );

  assert.deepEqual(result, { status: "contract-missing" });
});
