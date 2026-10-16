import assert from "node:assert/strict";
import test, { before, beforeEach, mock } from "node:test";

import { argsOf, prismaModel, resetModels } from "@/__tests__/helpers/prisma-mock";

const project = prismaModel("findMany", "findFirst", "create", "updateMany");

mock.module("@/lib/db/client", { namedExports: { prisma: { project } } });

type Queries = typeof import("@/lib/projects/queries");

let listProjects: Queries["listProjects"];
let getProject: Queries["getProject"];
let createProject: Queries["createProject"];
let archiveProject: Queries["archiveProject"];

before(async () => {
  ({ listProjects, getProject, createProject, archiveProject } = await import(
    "@/lib/projects/queries"
  ));
});

beforeEach(() => {
  resetModels(project);
});

test("listProjects filters by relationship and excludes archived", async () => {
  project.findMany.mock.mockImplementation(async () => []);

  await listProjects("rel-1");

  const args = argsOf(project.findMany);
  assert.deepEqual(args.where, {
    clientRelationshipId: "rel-1",
    archivedAt: null,
  });
  assert.deepEqual(args.orderBy, { updatedAt: "desc" });
});

test("listProjects narrows to an application/site when filtered", async () => {
  project.findMany.mock.mockImplementation(async () => []);

  await listProjects("rel-1", { applicationSiteId: "app-1" });

  assert.deepEqual(argsOf(project.findMany).where, {
    clientRelationshipId: "rel-1",
    archivedAt: null,
    applicationSiteId: "app-1",
  });
});

test("listProjects omits the applicationSiteId clause when no filter is given", async () => {
  project.findMany.mock.mockImplementation(async () => []);

  await listProjects("rel-1", {});

  assert.ok(!("applicationSiteId" in argsOf(project.findMany).where));
});

test("getProject scopes the lookup to the relationship", async () => {
  project.findFirst.mock.mockImplementation(async () => null);

  await getProject("proj-1", "rel-1");

  assert.deepEqual(argsOf(project.findFirst).where, {
    id: "proj-1",
    clientRelationshipId: "rel-1",
  });
});

test("createProject stores all fields", async () => {
  project.create.mock.mockImplementation(async () => ({ id: "proj-new" }));

  const startDate = new Date("2026-01-05T00:00:00.000Z");
  const targetDate = new Date("2026-03-01T00:00:00.000Z");

  const created = await createProject({
    clientRelationshipId: "rel-1",
    applicationSiteId: "app-1",
    name: "Portal rebuild",
    status: "IN_PROGRESS",
    summary: "Internal summary",
    startDate,
    targetDate,
    clientFacingDescription: "What the client sees",
    createsNewAsset: true,
  });

  assert.deepEqual(created, { id: "proj-new" });

  assert.deepEqual(argsOf(project.create).data, {
    clientRelationshipId: "rel-1",
    applicationSiteId: "app-1",
    name: "Portal rebuild",
    status: "IN_PROGRESS",
    summary: "Internal summary",
    startDate,
    targetDate,
    clientFacingDescription: "What the client sees",
    createsNewAsset: true,
  });
});

test("createProject defaults status to PLANNED and optional fields to null/false", async () => {
  project.create.mock.mockImplementation(async () => ({ id: "proj-new" }));

  await createProject({ clientRelationshipId: "rel-1", name: "Bare project" });

  const { data } = argsOf(project.create);
  assert.equal(data.status, "PLANNED");
  assert.equal(data.applicationSiteId, null);
  assert.equal(data.summary, null);
  assert.equal(data.startDate, null);
  assert.equal(data.targetDate, null);
  assert.equal(data.clientFacingDescription, null);
  assert.equal(data.createsNewAsset, false);
});

test("archiveProject sets archivedAt", async () => {
  project.updateMany.mock.mockImplementation(async () => ({ count: 1 }));

  const before = Date.now();
  await archiveProject("proj-1", "rel-1");
  const after = Date.now();

  const archivedAt = argsOf(project.updateMany).data.archivedAt as Date;
  assert.ok(archivedAt instanceof Date);
  assert.ok(archivedAt.getTime() >= before && archivedAt.getTime() <= after);
});

test("archiveProject only touches unarchived rows in the relationship", async () => {
  project.updateMany.mock.mockImplementation(async () => ({ count: 0 }));

  await archiveProject("proj-1", "rel-1");

  assert.deepEqual(argsOf(project.updateMany).where, {
    id: "proj-1",
    clientRelationshipId: "rel-1",
    archivedAt: null,
  });
});
