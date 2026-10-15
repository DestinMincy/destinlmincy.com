import assert from "node:assert/strict";
import test, { before, beforeEach, mock } from "node:test";

import {
  mockPackage,
  neutraliseServerOnly,
} from "@/__tests__/helpers/mock-package";
import { EMPTY_MILESTONE_FORM_VALUES } from "@/lib/milestones/types";

/**
 * The milestone actions map the scoped write results to form state. The
 * writes themselves are covered by `lib/milestones/queries.integration.test.ts`.
 */
const getAdminUser = mock.fn<() => Promise<{ id: string } | null>>();
const revalidatePath = mock.fn<(path: string) => void>();
const redirect = mock.fn<(url: string) => never>();
const createMilestone = mock.fn<(input: unknown) => Promise<unknown>>();
const updateMilestone = mock.fn<(...args: unknown[]) => Promise<unknown>>();

neutraliseServerOnly();
mockPackage("@/lib/auth/require-admin", { getAdminUser });
mockPackage("next/cache", { revalidatePath });
mockPackage("next/navigation", { redirect });
mock.module("@/lib/db/client", { namedExports: { prisma: {} } });
mock.module("@/lib/milestones/queries", {
  namedExports: { createMilestone, updateMilestone },
});

type Actions = typeof import("@/lib/milestones/actions");

let createMilestoneAction: Actions["createMilestoneAction"];
let updateMilestoneAction: Actions["updateMilestoneAction"];

const IDLE = { status: "idle" as const, values: EMPTY_MILESTONE_FORM_VALUES, errors: {} };
const TOKEN = "2026-10-15T12:00:00.000Z";

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

before(async () => {
  ({ createMilestoneAction, updateMilestoneAction } = await import(
    "@/lib/milestones/actions"
  ));
});

beforeEach(() => {
  for (const fn of [getAdminUser, revalidatePath, redirect, createMilestone, updateMilestone]) {
    fn.mock.resetCalls();
  }
  getAdminUser.mock.mockImplementation(async () => ({ id: "admin-1" }));
  redirect.mock.mockImplementation((_url: string) => {
    throw new Error("REDIRECT");
  });
  createMilestone.mock.mockImplementation(async () => ({ status: "saved", id: "ms-1" }));
  updateMilestone.mock.mockImplementation(async () => ({ status: "saved", id: "ms-1" }));
});

test("create returns an out-of-scope payment gate as a field error", async () => {
  createMilestone.mock.mockImplementation(async () => ({
    status: "payment-dependency-invalid",
  }));

  const state = await createMilestoneAction(
    "rel-1",
    "proj-1",
    IDLE,
    form({ title: "Launch", paymentDependencyId: "gate-elsewhere" }),
  );

  assert.equal(state.status, "error");
  assert.match(state.errors.paymentDependencyId ?? "", /payment gate from this relationship/);
  assert.equal(state.values.paymentDependencyId, "gate-elsewhere");
  assert.equal(redirect.mock.callCount(), 0);
});

test("update returns an out-of-scope payment gate as a field error", async () => {
  updateMilestone.mock.mockImplementation(async () => ({
    status: "payment-dependency-invalid",
  }));

  const state = await updateMilestoneAction(
    "ms-1",
    "rel-1",
    "proj-1",
    IDLE,
    form({ title: "Launch", paymentDependencyId: "gate-elsewhere", concurrencyToken: TOKEN }),
  );

  assert.equal(state.status, "error");
  assert.ok(state.errors.paymentDependencyId);
});

test("update passes the project scope and the token to the write", async () => {
  await assert.rejects(
    updateMilestoneAction(
      "ms-1",
      "rel-1",
      "proj-1",
      IDLE,
      form({ title: "Launch", concurrencyToken: TOKEN }),
    ),
    /REDIRECT/,
  );

  const [id, relationshipId, , options] = updateMilestone.mock.calls[0]?.arguments ?? [];
  assert.equal(id, "ms-1");
  assert.equal(relationshipId, "rel-1");
  const { projectId, expectedUpdatedAt } = options as {
    projectId: string;
    expectedUpdatedAt: Date;
  };
  assert.equal(projectId, "proj-1");
  assert.equal(expectedUpdatedAt.toISOString(), TOKEN);
});

test("a stale update comes back as a form error", async () => {
  updateMilestone.mock.mockImplementation(async () => ({ status: "stale" }));

  const state = await updateMilestoneAction(
    "ms-1",
    "rel-1",
    "proj-1",
    IDLE,
    form({ title: "Launch", concurrencyToken: TOKEN }),
  );

  assert.equal(state.status, "error");
  assert.match(state.formError ?? "", /changed after you opened it/);
});

test("an update without a token is rejected before any write", async () => {
  const state = await updateMilestoneAction(
    "ms-1",
    "rel-1",
    "proj-1",
    IDLE,
    form({ title: "Launch" }),
  );

  assert.equal(state.status, "error");
  assert.equal(updateMilestone.mock.callCount(), 0);
});
