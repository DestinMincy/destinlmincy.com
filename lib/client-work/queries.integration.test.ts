import "dotenv/config";

import assert from "node:assert/strict";
import { after, test } from "node:test";

import { prisma } from "@/lib/db/client";
import {
  getApplicationSite,
  getClientVisibleWork,
  getProject,
  getRelationshipIdentity,
} from "./queries";
import { createProjectForRelationship } from "./project-writes";

const slugPrefix = `unit05-integration-${Date.now()}`;

after(async () => {
  await prisma.clientRelationship.deleteMany({
    where: { slug: { startsWith: slugPrefix } },
  });
  await prisma.$disconnect();
});

test("client work stays relationship-scoped and hides archived records", async () => {
  const relationshipA = await prisma.clientRelationship.create({
    data: { name: "Unit 05 A", slug: `${slugPrefix}-a` },
  });
  const relationshipB = await prisma.clientRelationship.create({
    data: { name: "Unit 05 B", slug: `${slugPrefix}-b` },
  });

  const activeApplication = await prisma.applicationSite.create({
    data: {
      clientRelationshipId: relationshipA.id,
      name: "Active site",
      type: "WEBSITE",
      productionUrl: "https://example.com",
    },
  });
  await prisma.applicationSite.create({
    data: {
      clientRelationshipId: relationshipA.id,
      name: "Archived site",
      type: "INTERNAL_TOOL",
      status: "ARCHIVED",
    },
  });
  const otherApplication = await prisma.applicationSite.create({
    data: {
      clientRelationshipId: relationshipB.id,
      name: "Other relationship site",
    },
  });

  const activeProject = await prisma.project.create({
    data: {
      clientRelationshipId: relationshipA.id,
      applicationSiteId: activeApplication.id,
      name: "Active project",
      status: "IN_PROGRESS",
      clientDescription: "Visible to the client.",
    },
  });
  await prisma.project.create({
    data: {
      clientRelationshipId: relationshipA.id,
      name: "Archived project",
      status: "ARCHIVED",
    },
  });

  await assert.rejects(
    prisma.project.create({
      data: {
        clientRelationshipId: relationshipA.id,
        applicationSiteId: otherApplication.id,
        name: "Cross-relationship project",
      },
    }),
  );

  assert.equal(
    (await getApplicationSite(relationshipB.id, activeApplication.id)),
    null,
  );
  assert.equal(await getProject(relationshipB.id, activeProject.id), null);

  const summary = await getRelationshipIdentity(relationshipA.id);
  assert.equal(summary?._count.applications, 1);
  assert.equal(summary?._count.projects, 1);

  const visible = await getClientVisibleWork(relationshipA.id);
  assert.deepEqual(
    visible.applications.map((application) => application.name),
    ["Active site"],
  );
  assert.deepEqual(
    visible.projects.map((project) => project.name),
    ["Active project"],
  );

  const concurrentApplication = await prisma.applicationSite.create({
    data: {
      clientRelationshipId: relationshipA.id,
      name: "Concurrent site",
    },
  });
  const concurrentProjectName = "Concurrent project save";

  const [saveResult, archiveResult] = await Promise.all([
    createProjectForRelationship(relationshipA.id, {
      applicationSiteId: concurrentApplication.id,
      name: concurrentProjectName,
      status: "PLANNED",
      summary: null,
      clientDescription: null,
      createsNewAsset: false,
      startsAt: null,
      targetDate: null,
    }),
    prisma.applicationSite.updateMany({
      where: {
        id: concurrentApplication.id,
        clientRelationshipId: relationshipA.id,
        status: "ACTIVE",
      },
      data: { status: "ARCHIVED" },
    }),
  ]);

  assert.equal(archiveResult.count, 1);
  assert.ok(
    saveResult === "saved" || saveResult === "application-not-selectable",
  );
  assert.equal(
    await prisma.project.count({ where: { name: concurrentProjectName } }),
    saveResult === "saved" ? 1 : 0,
  );
});
