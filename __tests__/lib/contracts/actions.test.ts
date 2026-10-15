import assert from "node:assert/strict";
import test, { before, beforeEach, mock } from "node:test";

import {
  mockPackage,
  neutraliseServerOnly,
} from "@/__tests__/helpers/mock-package";
import { prismaModel, resetModels } from "@/__tests__/helpers/prisma-mock";

/**
 * Contract generation and draft saving, exercised through the real server
 * actions. Prisma, the PDF renderer, S3 and the draft-save query are stubbed.
 */
const getAdminUser = mock.fn<() => Promise<{ id: string } | null>>();
const revalidatePath = mock.fn<(path: string) => void>();
const redirect = mock.fn<(url: string) => never>();
const generateContractPdf = mock.fn<(options: unknown) => Promise<Buffer>>();
const uploadToPrivateS3 = mock.fn<
  (key: string, body: Buffer, contentType: string) => Promise<{ bucket: string; key: string }>
>();
const downloadFromPrivateS3 = mock.fn<(key: string) => Promise<Buffer>>();
const deleteFromPrivateS3 = mock.fn<(key: string) => Promise<void>>(async () => undefined);
const sendEnvelopeForSigning = mock.fn<(options: unknown) => Promise<unknown>>();
const saveContractTemplateDraftSnapshot =
  mock.fn<(...args: unknown[]) => Promise<unknown>>();

const contract = prismaModel("create");
const contractTemplateVersion = prismaModel("findFirst");

neutraliseServerOnly();
mockPackage("@/lib/auth/require-admin", { getAdminUser });
mockPackage("next/cache", { revalidatePath });
mockPackage("next/navigation", { redirect });
mock.module("@/lib/db/client", {
  namedExports: { prisma: { contract, contractTemplateVersion } },
});
mock.module("@/lib/pdf/generate", { namedExports: { generateContractPdf } });
mock.module("@/lib/storage/s3", {
  namedExports: { uploadToPrivateS3, downloadFromPrivateS3, deleteFromPrivateS3 },
});
mock.module("@/lib/docusign/client", { namedExports: { sendEnvelopeForSigning } });
mock.module("@/lib/contracts/queries", {
  namedExports: { saveContractTemplateDraftSnapshot },
});

type Actions = typeof import("@/lib/contracts/actions");

let createContractFormAction: Actions["createContractFormAction"];
let saveContractTemplateDraftAction: Actions["saveContractTemplateDraftAction"];

const REL_ID = "rel-1";
const TEMPLATE_ID = "tpl-1";
const TOKEN = "2026-10-15T12:00:00.000Z";

const PUBLISHED_VERSION = {
  snapshot: {
    blocks: [{ id: "b1", type: "paragraph", content: "Scope", order: 0 }],
    variables: [
      { key: "projectName", label: "Project name", required: true },
      { key: "poNumber", label: "PO number", required: false },
    ],
  },
  contractTemplate: { name: "Services agreement" },
};

before(async () => {
  ({ createContractFormAction, saveContractTemplateDraftAction } = await import(
    "@/lib/contracts/actions"
  ));
});

beforeEach(() => {
  resetModels(contract, contractTemplateVersion);
  for (const fn of [
    getAdminUser,
    revalidatePath,
    redirect,
    generateContractPdf,
    uploadToPrivateS3,
    deleteFromPrivateS3,
    saveContractTemplateDraftSnapshot,
  ]) {
    fn.mock.resetCalls();
  }

  getAdminUser.mock.mockImplementation(async () => ({ id: "admin-1" }));
  redirect.mock.mockImplementation((_url: string) => {
    throw new Error("REDIRECT");
  });
  contractTemplateVersion.findFirst.mock.mockImplementation(
    async () => PUBLISHED_VERSION,
  );
  contract.create.mock.mockImplementation(async () => ({ id: "contract-1" }));
  generateContractPdf.mock.mockImplementation(async () => Buffer.from("%PDF-1.7"));
  uploadToPrivateS3.mock.mockImplementation(async (key: string) => ({
    bucket: "contracts-bucket",
    key,
  }));
  saveContractTemplateDraftSnapshot.mock.mockImplementation(async () => ({
    status: "saved",
    concurrencyToken: "2026-10-15T12:05:00.000Z",
  }));

  process.env.AWS_REGION = "us-east-1";
  process.env.S3_PRIVATE_BUCKET = "contracts-bucket";
});

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

/** Silences the expected `console.error` from a failed step. */
async function quietly<T>(run: () => Promise<T>): Promise<T> {
  const consoleError = mock.method(console, "error", () => undefined);
  try {
    return await run();
  } finally {
    consoleError.mock.restore();
  }
}

// ── createContractFormAction ─────────────────────────────────────────────────

const GENERATE_FIELDS = {
  versionId: "ver-1",
  signerEmail: "Client@Example.com",
  var_projectName: "Site rebuild",
};

function generate(fields: Record<string, string> = GENERATE_FIELDS) {
  return createContractFormAction(REL_ID, TEMPLATE_ID, { status: "idle" }, form(fields));
}

/** A failed generation creates no row and touches neither S3 nor the cache. */
function assertNoContractCreated(): void {
  assert.equal(contract.create.mock.callCount(), 0, "no Contract row may be created");
  assert.equal(redirect.mock.callCount(), 0);
}

test("generation stores the PDF in S3 and only then creates the contract", async () => {
  await assert.rejects(generate(), /REDIRECT/);

  assert.equal(generateContractPdf.mock.callCount(), 1);
  assert.equal(uploadToPrivateS3.mock.callCount(), 1);
  const [key] = uploadToPrivateS3.mock.calls[0]?.arguments ?? [];
  assert.match(String(key), /^contracts\/rel-1\/.+\.pdf$/);

  const created = contract.create.mock.calls[0]?.arguments[0] as {
    data: Record<string, unknown>;
  };
  assert.equal(created.data.signerEmail, "client@example.com");
  assert.equal(created.data.s3Key, key);
  assert.equal(created.data.s3Bucket, "contracts-bucket");
  assert.deepEqual(redirect.mock.calls[0]?.arguments, [
    "/admin/relationships/rel-1/contracts",
  ]);
});

test("a missing required variable returns an error and creates nothing", async () => {
  const state = await generate({ versionId: "ver-1", signerEmail: "client@example.com" });

  assert.equal(state.status, "error");
  assert.equal(state.error, "Fill in the required fields: Project name.");
  assert.equal(state.values?.signerEmail, "client@example.com");
  assert.equal(generateContractPdf.mock.callCount(), 0);
  assert.equal(uploadToPrivateS3.mock.callCount(), 0);
  assertNoContractCreated();
});

test("an unset AWS_REGION returns an error and creates nothing", async () => {
  delete process.env.AWS_REGION;

  const state = await generate();

  assert.equal(state.status, "error");
  assert.match(state.error ?? "", /AWS_REGION and S3_PRIVATE_BUCKET/);
  assert.equal(generateContractPdf.mock.callCount(), 0);
  assertNoContractCreated();
});

test("an unset S3_PRIVATE_BUCKET returns an error and creates nothing", async () => {
  delete process.env.S3_PRIVATE_BUCKET;

  const state = await generate();

  assert.equal(state.status, "error");
  assert.match(state.error ?? "", /AWS_REGION and S3_PRIVATE_BUCKET/);
  assertNoContractCreated();
});

test("a PDF render failure returns an error and creates nothing", async () => {
  generateContractPdf.mock.mockImplementation(async () => {
    throw new Error("renderer crashed");
  });

  const state = await quietly(() => generate());

  assert.equal(state.status, "error");
  assert.equal(
    state.error,
    "The contract PDF could not be generated. No contract was created.",
  );
  assert.equal(uploadToPrivateS3.mock.callCount(), 0);
  assertNoContractCreated();
});

test("an S3 upload failure returns an error and creates nothing", async () => {
  uploadToPrivateS3.mock.mockImplementation(async () => {
    throw new Error("AccessDenied");
  });

  const state = await quietly(() => generate());

  assert.equal(state.status, "error");
  assert.match(state.error ?? "", /could not be stored in S3/);
  assert.deepEqual(state.values?.fields, { projectName: "Site rebuild" });
  assertNoContractCreated();
});

test("a failed contract insert removes the uploaded PDF instead of orphaning it", async () => {
  contract.create.mock.mockImplementation(async () => {
    throw new Error("connection reset");
  });

  const state = await quietly(() => generate());

  assert.equal(state.status, "error");
  const [uploadedKey] = uploadToPrivateS3.mock.calls[0]?.arguments ?? [];
  assert.deepEqual(deleteFromPrivateS3.mock.calls[0]?.arguments, [uploadedKey]);
  assert.equal(redirect.mock.callCount(), 0);
});

test("generation refuses a non-admin before reading anything", async () => {
  getAdminUser.mock.mockImplementation(async () => null);

  const state = await generate();

  assert.equal(state.status, "error");
  assert.equal(contractTemplateVersion.findFirst.mock.callCount(), 0);
  assertNoContractCreated();
});

// ── saveContractTemplateDraftAction ──────────────────────────────────────────

function saveDraft(snapshot: unknown, token: string | null = TOKEN) {
  const data = form({ snapshot: JSON.stringify(snapshot) });
  if (token !== null) data.set("concurrencyToken", token);
  return saveContractTemplateDraftAction(REL_ID, TEMPLATE_ID, { status: "idle" }, data);
}

const VALID_SNAPSHOT = {
  blocks: [{ id: "b1", type: "clause", content: "Payment terms", order: 0 }],
  variables: [{ key: "projectName", label: "Project name", required: true }],
};

const INVALID_SNAPSHOTS: [name: string, snapshot: unknown][] = [
  ["blocks is not an array", { blocks: {}, variables: [] }],
  ["variables is not an array", { blocks: [], variables: "projectName" }],
  [
    "a block type outside the five",
    { blocks: [{ id: "b1", type: "table", content: "", order: 0 }], variables: [] },
  ],
  [
    "a variable with an empty key",
    { blocks: [], variables: [{ key: "  ", label: "Blank", required: false }] },
  ],
  [
    "duplicate variable keys",
    {
      blocks: [],
      variables: [
        { key: "projectName", label: "Project", required: true },
        { key: "projectName", label: "Project again", required: false },
      ],
    },
  ],
];

for (const [name, snapshot] of INVALID_SNAPSHOTS) {
  test(`saving a draft rejects ${name} and leaves the draft alone`, async () => {
    const state = await saveDraft(snapshot);

    assert.equal(state.status, "error");
    assert.ok(state.error, "the editor must show why the save failed");
    assert.equal(
      saveContractTemplateDraftSnapshot.mock.callCount(),
      0,
      "an invalid snapshot must never reach the database",
    );
  });
}

test("saving a draft passes the validated snapshot and the token through", async () => {
  const state = await saveDraft(VALID_SNAPSHOT);

  assert.deepEqual(state, {
    status: "idle",
    concurrencyToken: "2026-10-15T12:05:00.000Z",
  });
  const [relationshipId, templateId, snapshot, expected] =
    saveContractTemplateDraftSnapshot.mock.calls[0]?.arguments ?? [];
  assert.equal(relationshipId, REL_ID);
  assert.equal(templateId, TEMPLATE_ID);
  assert.deepEqual(snapshot, VALID_SNAPSHOT);
  assert.equal((expected as Date).toISOString(), TOKEN);
});

test("saving a draft with a stale token returns an error", async () => {
  saveContractTemplateDraftSnapshot.mock.mockImplementation(async () => ({
    status: "stale",
  }));

  const state = await saveDraft(VALID_SNAPSHOT);

  assert.equal(state.status, "error");
  assert.match(state.error ?? "", /changed after you opened it/);
});

test("saving a draft without a token is rejected before any write", async () => {
  const state = await saveDraft(VALID_SNAPSHOT, null);

  assert.equal(state.status, "error");
  assert.equal(saveContractTemplateDraftSnapshot.mock.callCount(), 0);
});
