import "dotenv/config";

import assert from "node:assert/strict";
import { after, test } from "node:test";

import { prisma } from "@/lib/db/client";
import type { TemplateSnapshot } from "./types";
import { saveContractTemplateDraftSnapshot } from "./queries";

const slugPrefix = `factory002-draft-${Date.now()}`;

after(async () => {
  await prisma.clientRelationship.deleteMany({
    where: { slug: { startsWith: slugPrefix } },
  });
  await prisma.$disconnect();
});

function snapshotWith(content: string): TemplateSnapshot {
  return {
    blocks: [{ id: "b1", type: "paragraph", content, order: 0 }],
    variables: [{ key: "projectName", label: "Project name", required: true }],
  };
}

test("a draft save carrying a stale token is rejected without overwriting", async () => {
  const relationship = await prisma.clientRelationship.create({
    data: { name: "Draft tokens", slug: `${slugPrefix}-a` },
  });
  const template = await prisma.contractTemplate.create({
    data: {
      clientRelationshipId: relationship.id,
      name: "Services agreement",
      status: "DRAFT",
      versions: {
        create: { versionNumber: 1, snapshot: { blocks: [], variables: [] } },
      },
    },
  });

  // Two editors open the same draft and load the same token.
  const loadedToken = template.updatedAt;

  const first = await saveContractTemplateDraftSnapshot(
    relationship.id,
    template.id,
    snapshotWith("First editor"),
    loadedToken,
  );
  assert.equal(first.status, "saved");

  const second = await saveContractTemplateDraftSnapshot(
    relationship.id,
    template.id,
    snapshotWith("Second editor"),
    loadedToken,
  );
  assert.deepEqual(second, { status: "stale" });

  const draft = await prisma.contractTemplateVersion.findFirstOrThrow({
    where: { contractTemplateId: template.id, publishedAt: null },
  });
  assert.deepEqual(draft.snapshot, snapshotWith("First editor"));

  // The first editor keeps saving with the token its last save returned.
  assert.equal(first.status === "saved" && typeof first.concurrencyToken, "string");
  if (first.status !== "saved") return;
  const again = await saveContractTemplateDraftSnapshot(
    relationship.id,
    template.id,
    snapshotWith("First editor, second save"),
    new Date(first.concurrencyToken),
  );
  assert.equal(again.status, "saved");
});

test("a save against a published template finds no draft", async () => {
  const relationship = await prisma.clientRelationship.create({
    data: { name: "Published", slug: `${slugPrefix}-b` },
  });
  const template = await prisma.contractTemplate.create({
    data: {
      clientRelationshipId: relationship.id,
      name: "Published agreement",
      status: "PUBLISHED",
      versions: {
        create: {
          versionNumber: 1,
          snapshot: { blocks: [], variables: [] },
          publishedAt: new Date(),
        },
      },
    },
  });

  const result = await saveContractTemplateDraftSnapshot(
    relationship.id,
    template.id,
    snapshotWith("Late edit"),
    template.updatedAt,
  );

  assert.deepEqual(result, { status: "draft-missing" });
});
