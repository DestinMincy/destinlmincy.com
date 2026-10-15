import assert from "node:assert/strict";
import test, { before, beforeEach, mock } from "node:test";

import { argsOf, prismaModel, resetModels } from "@/__tests__/helpers/prisma-mock";

const milestone = prismaModel("findMany", "findFirst", "create", "updateMany");
const milestoneApproval = prismaModel("create");
const deliverable = prismaModel("findMany", "create", "updateMany");

mock.module("@/lib/db/client", {
  namedExports: { prisma: { milestone, milestoneApproval, deliverable } },
});

type Queries = typeof import("@/lib/milestones/queries");

let createMilestone: Queries["createMilestone"];
let listMilestones: Queries["listMilestones"];
let addMilestoneApproval: Queries["addMilestoneApproval"];
let listDeliverables: Queries["listDeliverables"];
let createDeliverable: Queries["createDeliverable"];

before(async () => {
  ({
    createMilestone,
    listMilestones,
    addMilestoneApproval,
    listDeliverables,
    createDeliverable,
  } = await import("@/lib/milestones/queries"));
});

beforeEach(() => {
  resetModels(milestone, milestoneApproval, deliverable);
});

// ── Milestones ───────────────────────────────────────────────────────────────

test("createMilestone with approvalRequired=true persists the flag", async () => {
  milestone.create.mock.mockImplementation(async () => ({ id: "ms-new" }));

  const targetDate = new Date("2026-04-01T00:00:00.000Z");

  const created = await createMilestone({
    clientRelationshipId: "rel-1",
    projectId: "proj-1",
    title: "Design sign-off",
    status: "IN_PROGRESS",
    targetDate,
    clientFacingUpdate: "Ready for your review",
    paymentDependencyId: "gate-1",
    approvalRequired: true,
  });

  assert.deepEqual(created, { id: "ms-new" });

  assert.deepEqual(argsOf(milestone.create).data, {
    clientRelationshipId: "rel-1",
    projectId: "proj-1",
    title: "Design sign-off",
    status: "IN_PROGRESS",
    targetDate,
    clientFacingUpdate: "Ready for your review",
    paymentDependencyId: "gate-1",
    approvalRequired: true,
  });
});

test("createMilestone defaults approvalRequired to false and status to PLANNED", async () => {
  milestone.create.mock.mockImplementation(async () => ({ id: "ms-new" }));

  await createMilestone({
    clientRelationshipId: "rel-1",
    projectId: "proj-1",
    title: "Kickoff",
  });

  const { data } = argsOf(milestone.create);
  assert.equal(data.approvalRequired, false);
  assert.equal(data.status, "PLANNED");
  assert.equal(data.targetDate, null);
  assert.equal(data.paymentDependencyId, null);
});

test("listMilestones scopes to the relationship and can filter by project", async () => {
  milestone.findMany.mock.mockImplementation(async () => []);

  await listMilestones("rel-1", { projectId: "proj-1" });

  assert.deepEqual(argsOf(milestone.findMany).where, {
    clientRelationshipId: "rel-1",
    projectId: "proj-1",
  });
});

// ── Milestone approvals ──────────────────────────────────────────────────────

test("addMilestoneApproval creates a record with actor, action, and note", async () => {
  milestoneApproval.create.mock.mockImplementation(async () => ({
    id: "appr-1",
  }));

  const created = await addMilestoneApproval({
    milestoneId: "ms-1",
    clientRelationshipId: "rel-1",
    actorClerkUserId: "user_abc",
    actorName: "Dana Client",
    action: "CHANGES_REQUESTED",
    note: "Please adjust the header spacing.",
  });

  assert.deepEqual(created, { id: "appr-1" });

  assert.deepEqual(argsOf(milestoneApproval.create).data, {
    milestoneId: "ms-1",
    clientRelationshipId: "rel-1",
    actorClerkUserId: "user_abc",
    actorName: "Dana Client",
    action: "CHANGES_REQUESTED",
    note: "Please adjust the header spacing.",
  });
});

test("addMilestoneApproval records an APPROVED action with no note", async () => {
  milestoneApproval.create.mock.mockImplementation(async () => ({
    id: "appr-2",
  }));

  await addMilestoneApproval({
    milestoneId: "ms-1",
    clientRelationshipId: "rel-1",
    actorClerkUserId: "user_abc",
    action: "APPROVED",
  });

  const { data } = argsOf(milestoneApproval.create);
  assert.equal(data.action, "APPROVED");
  assert.equal(data.note, null);
  assert.equal(data.actorName, null);
  assert.equal(data.actorClerkUserId, "user_abc");
});

// ── Deliverables ─────────────────────────────────────────────────────────────

test("listDeliverables filters by visibility", async () => {
  deliverable.findMany.mock.mockImplementation(async () => []);

  await listDeliverables("rel-1", { visibility: "CLIENT" });

  assert.deepEqual(argsOf(deliverable.findMany).where, {
    clientRelationshipId: "rel-1",
    visibility: "CLIENT",
  });
});

test("listDeliverables filters by visibility together with project and milestone", async () => {
  deliverable.findMany.mock.mockImplementation(async () => []);

  await listDeliverables("rel-1", {
    projectId: "proj-1",
    milestoneId: "ms-1",
    visibility: "ADMIN_ONLY",
  });

  assert.deepEqual(argsOf(deliverable.findMany).where, {
    clientRelationshipId: "rel-1",
    projectId: "proj-1",
    milestoneId: "ms-1",
    visibility: "ADMIN_ONLY",
  });
});

test("listDeliverables omits the visibility clause when unfiltered", async () => {
  deliverable.findMany.mock.mockImplementation(async () => []);

  await listDeliverables("rel-1");

  const { where } = argsOf(deliverable.findMany);
  assert.deepEqual(where, { clientRelationshipId: "rel-1" });
  assert.ok(!("visibility" in where));
});

test("createDeliverable defaults visibility to CLIENT and type to LINK", async () => {
  deliverable.create.mock.mockImplementation(async () => ({ id: "del-1" }));

  await createDeliverable({
    clientRelationshipId: "rel-1",
    label: "Staging link",
  });

  const { data } = argsOf(deliverable.create);
  assert.equal(data.visibility, "CLIENT");
  assert.equal(data.type, "LINK");
});

test("createDeliverable keeps an explicit ADMIN_ONLY visibility", async () => {
  deliverable.create.mock.mockImplementation(async () => ({ id: "del-2" }));

  await createDeliverable({
    clientRelationshipId: "rel-1",
    label: "Internal audit notes",
    visibility: "ADMIN_ONLY",
  });

  assert.equal(argsOf(deliverable.create).data.visibility, "ADMIN_ONLY");
});
