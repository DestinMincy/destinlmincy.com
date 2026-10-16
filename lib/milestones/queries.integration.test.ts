import "dotenv/config";

import assert from "node:assert/strict";
import { after, test } from "node:test";

import { prisma } from "@/lib/db/client";
import { createMilestone, updateMilestone } from "./queries";

const slugPrefix = `factory002-milestones-${Date.now()}`;

after(async () => {
  await prisma.clientRelationship.deleteMany({
    where: { slug: { startsWith: slugPrefix } },
  });
  await prisma.$disconnect();
});

async function fixture(suffix: string) {
  const relationship = await prisma.clientRelationship.create({
    data: { name: `Milestones ${suffix}`, slug: `${slugPrefix}-${suffix}` },
  });
  const [projectA, projectB] = await Promise.all([
    prisma.project.create({
      data: { clientRelationshipId: relationship.id, name: "Project A" },
    }),
    prisma.project.create({
      data: { clientRelationshipId: relationship.id, name: "Project B" },
    }),
  ]);
  const [gateForA, gateForB, relationshipGate] = await Promise.all([
    prisma.paymentGate.create({
      data: { clientRelationshipId: relationship.id, projectId: projectA.id, label: "A deposit" },
    }),
    prisma.paymentGate.create({
      data: { clientRelationshipId: relationship.id, projectId: projectB.id, label: "B deposit" },
    }),
    prisma.paymentGate.create({
      data: { clientRelationshipId: relationship.id, label: "Retainer" },
    }),
  ]);
  return { relationship, projectA, projectB, gateForA, gateForB, relationshipGate };
}

test("milestone create rejects a payment gate outside the relationship or project", async () => {
  const mine = await fixture("create");
  const other = await fixture("create-other");

  const otherRelationship = await createMilestone({
    clientRelationshipId: mine.relationship.id,
    projectId: mine.projectA.id,
    title: "Cross relationship",
    paymentDependencyId: other.gateForA.id,
  });
  assert.deepEqual(otherRelationship, { status: "payment-dependency-invalid" });

  const otherProject = await createMilestone({
    clientRelationshipId: mine.relationship.id,
    projectId: mine.projectA.id,
    title: "Cross project",
    paymentDependencyId: mine.gateForB.id,
  });
  assert.deepEqual(otherProject, { status: "payment-dependency-invalid" });

  assert.equal(
    await prisma.milestone.count({ where: { clientRelationshipId: mine.relationship.id } }),
    0,
    "a rejected dependency must not create a milestone",
  );

  const sameProject = await createMilestone({
    clientRelationshipId: mine.relationship.id,
    projectId: mine.projectA.id,
    title: "Same project",
    paymentDependencyId: mine.gateForA.id,
  });
  assert.equal(sameProject.status, "saved");

  const relationshipLevel = await createMilestone({
    clientRelationshipId: mine.relationship.id,
    projectId: mine.projectA.id,
    title: "Relationship-level gate",
    paymentDependencyId: mine.relationshipGate.id,
  });
  assert.equal(relationshipLevel.status, "saved");
});

test("milestone update rejects an out-of-scope gate and a stale token", async () => {
  const mine = await fixture("update");
  const other = await fixture("update-other");

  const created = await createMilestone({
    clientRelationshipId: mine.relationship.id,
    projectId: mine.projectA.id,
    title: "Design review",
  });
  assert.equal(created.status, "saved");
  if (created.status !== "saved") return;

  const loaded = await prisma.milestone.findUniqueOrThrow({ where: { id: created.id } });

  for (const gateId of [other.gateForA.id, mine.gateForB.id]) {
    const rejected = await updateMilestone(
      created.id,
      mine.relationship.id,
      { paymentDependencyId: gateId },
      { projectId: mine.projectA.id, expectedUpdatedAt: loaded.updatedAt },
    );
    assert.deepEqual(rejected, { status: "payment-dependency-invalid" });
  }

  // Two admins open the same edit page with the same token.
  const first = await updateMilestone(
    created.id,
    mine.relationship.id,
    { title: "Design review (first admin)", paymentDependencyId: mine.gateForA.id },
    { projectId: mine.projectA.id, expectedUpdatedAt: loaded.updatedAt },
  );
  assert.equal(first.status, "saved");

  const second = await updateMilestone(
    created.id,
    mine.relationship.id,
    { title: "Design review (second admin)", paymentDependencyId: null },
    { projectId: mine.projectA.id, expectedUpdatedAt: loaded.updatedAt },
  );
  assert.deepEqual(second, { status: "stale" });

  const stored = await prisma.milestone.findUniqueOrThrow({ where: { id: created.id } });
  assert.equal(stored.title, "Design review (first admin)");
  assert.equal(stored.paymentDependencyId, mine.gateForA.id);
});

test("milestone update scoped to a project does not touch another project's milestone", async () => {
  const mine = await fixture("scope");
  const created = await createMilestone({
    clientRelationshipId: mine.relationship.id,
    projectId: mine.projectB.id,
    title: "Project B milestone",
  });
  assert.equal(created.status, "saved");
  if (created.status !== "saved") return;

  const result = await updateMilestone(
    created.id,
    mine.relationship.id,
    { title: "Renamed through project A" },
    { projectId: mine.projectA.id },
  );

  assert.deepEqual(result, { status: "milestone-missing" });
});
