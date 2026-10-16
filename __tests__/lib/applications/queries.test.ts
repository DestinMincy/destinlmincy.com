import assert from "node:assert/strict";
import test, { before, beforeEach, mock } from "node:test";

import { argsOf, prismaModel, resetModels } from "@/__tests__/helpers/prisma-mock";

const applicationSite = prismaModel(
  "findMany",
  "findFirst",
  "create",
  "updateMany",
);

mock.module("@/lib/db/client", {
  namedExports: { prisma: { applicationSite } },
});

type Queries = typeof import("@/lib/applications/queries");

let listApplicationSites: Queries["listApplicationSites"];
let getApplicationSite: Queries["getApplicationSite"];
let createApplicationSite: Queries["createApplicationSite"];
let updateApplicationSite: Queries["updateApplicationSite"];
let archiveApplicationSite: Queries["archiveApplicationSite"];

before(async () => {
  ({
    listApplicationSites,
    getApplicationSite,
    createApplicationSite,
    updateApplicationSite,
    archiveApplicationSite,
  } = await import("@/lib/applications/queries"));
});

beforeEach(() => {
  resetModels(applicationSite);
});

test("listApplicationSites filters by relationship and excludes archived", async () => {
  applicationSite.findMany.mock.mockImplementation(async () => []);

  await listApplicationSites("rel-1");

  assert.equal(applicationSite.findMany.mock.callCount(), 1);
  const args = argsOf(applicationSite.findMany);

  assert.deepEqual(args.where, {
    clientRelationshipId: "rel-1",
    archivedAt: null,
  });
  assert.deepEqual(args.orderBy, { updatedAt: "desc" });
});

test("listApplicationSites returns the rows prisma yields", async () => {
  const rows = [{ id: "app-1", name: "Client website" }];
  applicationSite.findMany.mock.mockImplementation(async () => rows);

  assert.deepEqual(await listApplicationSites("rel-1"), rows);
});

test("getApplicationSite scopes the lookup to the relationship", async () => {
  applicationSite.findFirst.mock.mockImplementation(async () => null);

  await getApplicationSite("app-1", "rel-1");

  assert.deepEqual(argsOf(applicationSite.findFirst).where, {
    id: "app-1",
    clientRelationshipId: "rel-1",
  });
});

test("createApplicationSite returns the created record", async () => {
  applicationSite.create.mock.mockImplementation(async () => ({
    id: "app-new",
  }));

  const created = await createApplicationSite({
    clientRelationshipId: "rel-1",
    name: "Marketing site",
    type: "WEB_APPLICATION",
    productionUrl: "https://example.com",
    stagingUrl: "https://staging.example.com",
    repositoryUrl: "https://github.com/example/site",
    notes: "Operations notes",
  });

  assert.deepEqual(created, { id: "app-new" });

  assert.deepEqual(argsOf(applicationSite.create).data, {
    clientRelationshipId: "rel-1",
    name: "Marketing site",
    type: "WEB_APPLICATION",
    productionUrl: "https://example.com",
    stagingUrl: "https://staging.example.com",
    repositoryUrl: "https://github.com/example/site",
    notes: "Operations notes",
  });
});

test("createApplicationSite defaults type to WEBSITE and blanks to null", async () => {
  applicationSite.create.mock.mockImplementation(async () => ({
    id: "app-new",
  }));

  await createApplicationSite({
    clientRelationshipId: "rel-1",
    name: "Bare site",
  });

  const { data } = argsOf(applicationSite.create);
  assert.equal(data.type, "WEBSITE");
  assert.equal(data.productionUrl, null);
  assert.equal(data.stagingUrl, null);
  assert.equal(data.repositoryUrl, null);
  assert.equal(data.notes, null);
});

test("updateApplicationSite cannot cross relationship boundaries", async () => {
  applicationSite.updateMany.mock.mockImplementation(async () => ({ count: 1 }));

  await updateApplicationSite("app-1", "rel-1", { name: "Renamed" });

  const args = argsOf(applicationSite.updateMany);
  assert.equal(args.where.clientRelationshipId, "rel-1");
  assert.deepEqual(args.data, { name: "Renamed" });
});

test("archiveApplicationSite sets archivedAt and ARCHIVED status", async () => {
  applicationSite.updateMany.mock.mockImplementation(async () => ({ count: 1 }));

  const before = Date.now();
  await archiveApplicationSite("app-1", "rel-1");
  const after = Date.now();

  const { data } = argsOf(applicationSite.updateMany);

  const archivedAt = data.archivedAt as Date;
  assert.ok(archivedAt instanceof Date);
  assert.ok(archivedAt.getTime() >= before && archivedAt.getTime() <= after);
  assert.equal(data.status, "ARCHIVED");
});

test("archiveApplicationSite only touches rows that are not already archived", async () => {
  applicationSite.updateMany.mock.mockImplementation(async () => ({ count: 0 }));

  await archiveApplicationSite("app-1", "rel-1");

  assert.deepEqual(argsOf(applicationSite.updateMany).where, {
    id: "app-1",
    clientRelationshipId: "rel-1",
    archivedAt: null,
  });
});
