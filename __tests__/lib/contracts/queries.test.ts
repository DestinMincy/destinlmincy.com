import assert from "node:assert/strict";
import test, { before, beforeEach, mock } from "node:test";

import { argsOf, prismaModel, resetModels } from "@/__tests__/helpers/prisma-mock";

/**
 * `tx` stands in for the Prisma transaction client. Both
 * `updateContractTemplateDraft` and `publishContractTemplateVersion` run
 * entirely inside `prisma.$transaction`, so the immutability guards under test
 * live on these handles rather than on the top-level client.
 */
const tx = {
  contractTemplate: prismaModel("findFirst", "update"),
  contractTemplateVersion: prismaModel("findFirst", "update", "create"),
};

const contract = prismaModel("create", "findMany", "findFirst", "updateMany");
const contractTemplate = prismaModel(
  "findMany",
  "findFirst",
  "create",
  "updateMany",
);
const contractTemplateVersion = prismaModel("findUnique", "findFirst");

const $transaction = mock.fn<
  (run: (client: typeof tx) => Promise<unknown>) => Promise<unknown>
>(async (run) => run(tx));

mock.module("@/lib/db/client", {
  namedExports: {
    prisma: {
      $transaction,
      contract,
      contractTemplate,
      contractTemplateVersion,
    },
  },
});

type Queries = typeof import("@/lib/contracts/queries");

let publishContractTemplateVersion: Queries["publishContractTemplateVersion"];
let updateContractTemplateDraft: Queries["updateContractTemplateDraft"];
let createContract: Queries["createContract"];
let archiveContractTemplate: Queries["archiveContractTemplate"];

before(async () => {
  ({
    publishContractTemplateVersion,
    updateContractTemplateDraft,
    createContract,
    archiveContractTemplate,
  } = await import("@/lib/contracts/queries"));
});

beforeEach(() => {
  resetModels(
    tx.contractTemplate,
    tx.contractTemplateVersion,
    contract,
    contractTemplate,
    contractTemplateVersion,
  );

  $transaction.mock.resetCalls();
  $transaction.mock.mockImplementation(async (run) => run(tx));
});

/** Puts the template into the DRAFT state the write paths require. */
function draftTemplate() {
  tx.contractTemplate.findFirst.mock.mockImplementation(async () => ({
    id: "tpl-1",
    status: "DRAFT",
  }));
}

// ── Publishing ───────────────────────────────────────────────────────────────

test("publishContractTemplateVersion stamps publishedAt and marks the template PUBLISHED", async () => {
  draftTemplate();
  tx.contractTemplateVersion.findFirst.mock.mockImplementation(async () => ({
    id: "ver-1",
  }));
  tx.contractTemplateVersion.update.mock.mockImplementation(async () => ({
    id: "ver-1",
  }));
  tx.contractTemplate.update.mock.mockImplementation(async () => ({
    id: "tpl-1",
  }));

  const before = Date.now();
  const result = await publishContractTemplateVersion("tpl-1", "rel-1");
  const after = Date.now();

  assert.deepEqual(result, { id: "ver-1" });

  const versionArgs = argsOf(tx.contractTemplateVersion.update);
  assert.deepEqual(versionArgs.where, { id: "ver-1" });

  const publishedAt = versionArgs.data.publishedAt as Date;
  assert.ok(publishedAt instanceof Date);
  assert.ok(publishedAt.getTime() >= before && publishedAt.getTime() <= after);

  const templateArgs = argsOf(tx.contractTemplate.update);
  assert.deepEqual(templateArgs.where, { id: "tpl-1" });
  assert.equal(templateArgs.data.status, "PUBLISHED");
});

test("publishContractTemplateVersion runs inside a transaction", async () => {
  draftTemplate();
  tx.contractTemplateVersion.findFirst.mock.mockImplementation(async () => ({
    id: "ver-1",
  }));
  tx.contractTemplateVersion.update.mock.mockImplementation(async () => ({
    id: "ver-1",
  }));

  await publishContractTemplateVersion("tpl-1", "rel-1");

  assert.equal(
    $transaction.mock.callCount(),
    1,
    "publishing must be atomic across the version and the template",
  );
});

test("publishContractTemplateVersion selects the unpublished draft version", async () => {
  draftTemplate();
  tx.contractTemplateVersion.findFirst.mock.mockImplementation(async () => ({
    id: "ver-1",
  }));
  tx.contractTemplateVersion.update.mock.mockImplementation(async () => ({
    id: "ver-1",
  }));

  await publishContractTemplateVersion("tpl-1", "rel-1");

  assert.deepEqual(argsOf(tx.contractTemplateVersion.findFirst).where, {
    contractTemplateId: "tpl-1",
    publishedAt: null,
  });
});

test("publishContractTemplateVersion refuses an already published template", async () => {
  tx.contractTemplate.findFirst.mock.mockImplementation(async () => ({
    id: "tpl-1",
    status: "PUBLISHED",
  }));

  const result = await publishContractTemplateVersion("tpl-1", "rel-1");

  assert.equal(result, null);
  assert.equal(tx.contractTemplateVersion.update.mock.callCount(), 0);
  assert.equal(tx.contractTemplate.update.mock.callCount(), 0);
});

test("publishContractTemplateVersion refuses a template in another relationship", async () => {
  tx.contractTemplate.findFirst.mock.mockImplementation(async () => null);

  const result = await publishContractTemplateVersion("tpl-1", "rel-other");

  assert.equal(result, null);
  assert.equal(tx.contractTemplateVersion.update.mock.callCount(), 0);
});

test("publishContractTemplateVersion returns null when there is no draft version", async () => {
  draftTemplate();
  tx.contractTemplateVersion.findFirst.mock.mockImplementation(async () => null);

  const result = await publishContractTemplateVersion("tpl-1", "rel-1");

  assert.equal(result, null);
  assert.equal(tx.contractTemplate.update.mock.callCount(), 0);
});

// ── Draft immutability ───────────────────────────────────────────────────────

test("updateContractTemplateDraft rejects published templates", async () => {
  tx.contractTemplate.findFirst.mock.mockImplementation(async () => ({
    id: "tpl-1",
    status: "PUBLISHED",
  }));

  const result = await updateContractTemplateDraft("tpl-1", "rel-1", {
    blocks: [{ type: "text", value: "tampered" }],
  });

  assert.equal(result, null);
  assert.equal(tx.contractTemplateVersion.update.mock.callCount(), 0);
  assert.equal(tx.contractTemplateVersion.create.mock.callCount(), 0);
});

test("updateContractTemplateDraft rejects archived templates", async () => {
  tx.contractTemplate.findFirst.mock.mockImplementation(async () => ({
    id: "tpl-1",
    status: "ARCHIVED",
  }));

  const result = await updateContractTemplateDraft("tpl-1", "rel-1", {
    blocks: [],
  });

  assert.equal(result, null);
  assert.equal(tx.contractTemplateVersion.update.mock.callCount(), 0);
});

test("updateContractTemplateDraft rejects a template in another relationship", async () => {
  tx.contractTemplate.findFirst.mock.mockImplementation(async () => null);

  const result = await updateContractTemplateDraft("tpl-1", "rel-other", {
    blocks: [],
  });

  assert.equal(result, null);
  assert.equal(tx.contractTemplateVersion.update.mock.callCount(), 0);
});

test("updateContractTemplateDraft writes to the existing draft version", async () => {
  const blocks = [{ type: "text", value: "Scope of work" }];

  draftTemplate();
  tx.contractTemplateVersion.findFirst.mock.mockImplementation(async () => ({
    id: "ver-draft",
  }));
  tx.contractTemplateVersion.update.mock.mockImplementation(async () => ({
    id: "ver-draft",
  }));

  const result = await updateContractTemplateDraft("tpl-1", "rel-1", { blocks });

  assert.deepEqual(result, { id: "ver-draft" });

  const args = argsOf(tx.contractTemplateVersion.update);
  assert.deepEqual(args.where, { id: "ver-draft" });
  assert.deepEqual(args.data.blocks, blocks);
});

test("updateContractTemplateDraft creates the first version when none exists", async () => {
  draftTemplate();
  // No unpublished draft, and no prior version to take a max versionNumber from.
  tx.contractTemplateVersion.findFirst.mock.mockImplementation(async () => null);
  tx.contractTemplateVersion.create.mock.mockImplementation(async () => ({
    id: "ver-1",
  }));

  const result = await updateContractTemplateDraft("tpl-1", "rel-1", {
    blocks: [],
  });

  assert.deepEqual(result, { id: "ver-1" });

  const { data } = argsOf(tx.contractTemplateVersion.create);
  assert.equal(data.contractTemplateId, "tpl-1");
  assert.equal(data.versionNumber, 1);
});

// ── Contracts ────────────────────────────────────────────────────────────────

test("createContract links to the exact template version", async () => {
  contract.create.mock.mockImplementation(async () => ({ id: "contract-1" }));

  const fieldValues = { clientName: "Acme", fee: "5000" };

  const created = await createContract({
    clientRelationshipId: "rel-1",
    projectId: "proj-1",
    contractTemplateVersionId: "ver-published",
    fieldValues,
    signerEmail: "dana@example.com",
    signerClerkUserId: "user_abc",
  });

  assert.deepEqual(created, { id: "contract-1" });

  const { data } = argsOf(contract.create);
  assert.equal(data.contractTemplateVersionId, "ver-published");
  assert.equal(data.clientRelationshipId, "rel-1");
  assert.equal(data.projectId, "proj-1");
  assert.deepEqual(data.fieldValues, fieldValues);
  assert.equal(data.signerEmail, "dana@example.com");
  assert.equal(data.signerClerkUserId, "user_abc");
});

test("createContract starts in DRAFT status", async () => {
  contract.create.mock.mockImplementation(async () => ({ id: "contract-1" }));

  await createContract({
    clientRelationshipId: "rel-1",
    contractTemplateVersionId: "ver-published",
  });

  const { data } = argsOf(contract.create);
  assert.equal(data.status, "DRAFT");
  assert.equal(data.projectId, null);
  assert.equal(data.signerEmail, null);
});

test("archiveContractTemplate is scoped to the relationship", async () => {
  contractTemplate.updateMany.mock.mockImplementation(async () => ({
    count: 1,
  }));

  await archiveContractTemplate("tpl-1", "rel-1");

  const args = argsOf(contractTemplate.updateMany);
  assert.deepEqual(args.where, { id: "tpl-1", clientRelationshipId: "rel-1" });
  assert.equal(args.data.status, "ARCHIVED");
});
