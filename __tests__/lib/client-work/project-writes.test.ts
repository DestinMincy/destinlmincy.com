import assert from "node:assert/strict";
import test, { before, beforeEach, mock } from "node:test";

import { argsOf, prismaModel, resetModels } from "@/__tests__/helpers/prisma-mock";

const clientRelationship = prismaModel("findUnique");
const applicationSite = prismaModel("findFirst");
const project = prismaModel("findFirst", "create", "updateMany");
const paymentGate = prismaModel("findFirst");

const transactionClient = { clientRelationship, applicationSite, project, paymentGate };
const $transaction = mock.fn(
  async (run: (tx: typeof transactionClient) => Promise<unknown>) =>
    run(transactionClient),
);

mock.module("@/lib/db/client", {
  namedExports: { prisma: { $transaction, ...transactionClient } },
});

type Writes = typeof import("@/lib/client-work/project-writes");

let updateProjectForRelationship: Writes["updateProjectForRelationship"];
let createProjectForRelationship: Writes["createProjectForRelationship"];

const REL_ID = "rel-1";
const PROJECT_ID = "proj-1";

const baseInput = {
  applicationSiteId: "",
  name: "Website rebuild",
  summary: null,
  clientDescription: null,
  createsNewAsset: false,
  startsAt: null,
  targetDate: null,
} as const;

before(async () => {
  ({ updateProjectForRelationship, createProjectForRelationship } = await import(
    "@/lib/client-work/project-writes"
  ));
});

beforeEach(() => {
  resetModels(clientRelationship, applicationSite, project, paymentGate);
  $transaction.mock.resetCalls();
  clientRelationship.findUnique.mock.mockImplementation(async () => ({ id: REL_ID }));
  project.findFirst.mock.mockImplementation(async () => ({
    id: PROJECT_ID,
    applicationSiteId: null,
    status: "PLANNED",
  }));
  project.updateMany.mock.mockImplementation(async () => ({ count: 1 }));
  project.create.mock.mockImplementation(async () => ({ id: PROJECT_ID }));
  paymentGate.findFirst.mock.mockImplementation(async () => null);
});

test("starting a planned project is blocked by an unpaid required gate", async () => {
  paymentGate.findFirst.mock.mockImplementation(async () => ({ id: "gate-1" }));

  const result = await updateProjectForRelationship(REL_ID, PROJECT_ID, {
    ...baseInput,
    status: "ACTIVE",
  });

  assert.equal(result, "payment-gate-blocked");
  assert.equal(project.updateMany.mock.calls.length, 0);

  const where = argsOf(paymentGate.findFirst).where;
  assert.equal(where.clientRelationshipId, REL_ID);
  assert.equal(where.projectId, PROJECT_ID);
  assert.equal(where.requiredBeforeWork, true);
  assert.deepEqual(where.status, { notIn: ["PAID", "WAIVED"] });
});

test("starting a planned project proceeds once required gates are satisfied", async () => {
  const result = await updateProjectForRelationship(REL_ID, PROJECT_ID, {
    ...baseInput,
    status: "IN_PROGRESS",
  });

  assert.equal(result, "saved");
  assert.equal(paymentGate.findFirst.mock.calls.length, 1);
  assert.equal(project.updateMany.mock.calls.length, 1);
});

test("a project that is already running is not pulled back by a gate", async () => {
  project.findFirst.mock.mockImplementation(async () => ({
    id: PROJECT_ID,
    applicationSiteId: null,
    status: "ACTIVE",
  }));
  paymentGate.findFirst.mock.mockImplementation(async () => ({ id: "gate-1" }));

  const result = await updateProjectForRelationship(REL_ID, PROJECT_ID, {
    ...baseInput,
    status: "ACTIVE",
  });

  assert.equal(result, "saved");
  assert.equal(paymentGate.findFirst.mock.calls.length, 0);
});

test("moving to a non-started status never consults payment gates", async () => {
  paymentGate.findFirst.mock.mockImplementation(async () => ({ id: "gate-1" }));

  const result = await updateProjectForRelationship(REL_ID, PROJECT_ID, {
    ...baseInput,
    status: "ON_HOLD",
  });

  assert.equal(result, "saved");
  assert.equal(paymentGate.findFirst.mock.calls.length, 0);
});

test("creating a project does not consult payment gates (none can exist yet)", async () => {
  const result = await createProjectForRelationship(REL_ID, {
    ...baseInput,
    status: "ACTIVE",
  });

  assert.equal(result, "saved");
  assert.equal(paymentGate.findFirst.mock.calls.length, 0);
  assert.equal(project.create.mock.calls.length, 1);
});
