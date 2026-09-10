import assert from "node:assert/strict";
import test, { before, beforeEach, mock } from "node:test";

import {
  mockPackage,
  neutraliseServerOnly,
} from "@/__tests__/helpers/mock-package";
import {
  prismaModel,
  resetModels,
} from "@/__tests__/helpers/prisma-mock";

const getAdminUser = mock.fn<() => Promise<{ id: string } | null>>();
const revalidatePath = mock.fn<(path: string) => void>();
const redirect = mock.fn<(url: string) => never>();

const subscriptionReference = prismaModel("create", "updateMany");

neutraliseServerOnly();
mockPackage("@/lib/auth/require-admin", { getAdminUser });
mockPackage("next/cache", { revalidatePath });
mockPackage("next/navigation", { redirect });
mock.module("@/lib/db/client", {
  namedExports: { prisma: { subscriptionReference } },
});

type Actions = typeof import(
  "@/app/admin/relationships/[id]/subscriptions/actions"
);

let createSubscriptionAction: Actions["createSubscriptionAction"];
let updateSubscriptionAction: Actions["updateSubscriptionAction"];

const IDLE_STATE = { status: "idle" as const, errors: {} };
const REL_ID = "rel-1";
const SUB_ID = "sub-1";

function makeForm(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

before(async () => {
  ({ createSubscriptionAction, updateSubscriptionAction } = await import(
    "@/app/admin/relationships/[id]/subscriptions/actions"
  ));
});

beforeEach(() => {
  resetModels(subscriptionReference);
  revalidatePath.mock.resetCalls();
  redirect.mock.resetCalls();
  getAdminUser.mock.resetCalls();

  getAdminUser.mock.mockImplementation(async () => ({ id: "admin-1" }));
  subscriptionReference.create.mock.mockImplementation(async () => ({ id: SUB_ID }));
  subscriptionReference.updateMany.mock.mockImplementation(async () => ({ count: 1 }));
  redirect.mock.mockImplementation((_url: string) => {
    throw new Error("REDIRECT");
  });
});

// ─── createSubscriptionAction ──────────────────────────────────────────────

test("create: returns not-authorized when getAdminUser returns null", async () => {
  getAdminUser.mock.mockImplementation(async () => null);
  const result = await createSubscriptionAction(
    REL_ID,
    IDLE_STATE,
    makeForm({ serviceType: "HOSTING", status: "ACTIVE" }),
  );
  assert.equal(result.status, "error");
  assert.ok(result.formError?.includes("Not authorized"));
  assert.equal(subscriptionReference.create.mock.calls.length, 0);
});

test("create: returns error for invalid serviceType", async () => {
  const result = await createSubscriptionAction(
    REL_ID,
    IDLE_STATE,
    makeForm({ serviceType: "INVALID", status: "ACTIVE" }),
  );
  assert.equal(result.status, "error");
  assert.ok(result.errors.serviceType);
  assert.equal(subscriptionReference.create.mock.calls.length, 0);
});

test("create: returns error for empty serviceType", async () => {
  const result = await createSubscriptionAction(
    REL_ID,
    IDLE_STATE,
    makeForm({ serviceType: "", status: "ACTIVE" }),
  );
  assert.equal(result.status, "error");
  assert.ok(result.errors.serviceType);
});

test("create: returns error for invalid status enum value", async () => {
  const result = await createSubscriptionAction(
    REL_ID,
    IDLE_STATE,
    makeForm({ serviceType: "HOSTING", status: "BOGUS_STATUS" }),
  );
  assert.equal(result.status, "error");
  assert.ok(result.errors.status);
  assert.equal(subscriptionReference.create.mock.calls.length, 0);
});

test("create: returns error for unparseable date", async () => {
  const result = await createSubscriptionAction(
    REL_ID,
    IDLE_STATE,
    makeForm({
      serviceType: "HOSTING",
      status: "ACTIVE",
      currentPeriodEndsAt: "not-a-date",
    }),
  );
  assert.equal(result.status, "error");
  assert.ok(result.errors.currentPeriodEndsAt);
  assert.equal(subscriptionReference.create.mock.calls.length, 0);
});

test("create: succeeds for HOSTING/ACTIVE with no optional fields", async () => {
  await assert.rejects(
    () =>
      createSubscriptionAction(
        REL_ID,
        IDLE_STATE,
        makeForm({ serviceType: "HOSTING", status: "ACTIVE" }),
      ),
    /REDIRECT/,
  );
  assert.equal(subscriptionReference.create.mock.calls.length, 1);
  const args = subscriptionReference.create.mock.calls[0].arguments[0] as {
    data: Record<string, unknown>;
  };
  assert.equal(args.data.serviceType, "HOSTING");
  assert.equal(args.data.status, "ACTIVE");
  assert.equal(args.data.clientRelationshipId, REL_ID);
  assert.equal(args.data.currentPeriodEndsAt, null);
});

test("create: succeeds for MAINTENANCE/CANCELED with a valid date", async () => {
  const isoDate = "2027-01-15";
  await assert.rejects(
    () =>
      createSubscriptionAction(
        REL_ID,
        IDLE_STATE,
        makeForm({
          serviceType: "MAINTENANCE",
          status: "CANCELED",
          currentPeriodEndsAt: isoDate,
        }),
      ),
    /REDIRECT/,
  );
  assert.equal(subscriptionReference.create.mock.calls.length, 1);
  const args = subscriptionReference.create.mock.calls[0].arguments[0] as {
    data: Record<string, unknown>;
  };
  assert.equal(args.data.serviceType, "MAINTENANCE");
  assert.equal(args.data.status, "CANCELED");
  assert.ok(args.data.currentPeriodEndsAt instanceof Date);
});

test("create: returns formError when prisma throws", async () => {
  subscriptionReference.create.mock.mockImplementation(async () => {
    throw new Error("DB error");
  });
  const result = await createSubscriptionAction(
    REL_ID,
    IDLE_STATE,
    makeForm({ serviceType: "HOSTING", status: "ACTIVE" }),
  );
  assert.equal(result.status, "error");
  assert.ok(result.formError);
  assert.equal(redirect.mock.calls.length, 0);
});

// ─── updateSubscriptionAction ──────────────────────────────────────────────

test("update: returns not-authorized when getAdminUser returns null", async () => {
  getAdminUser.mock.mockImplementation(async () => null);
  const result = await updateSubscriptionAction(
    REL_ID,
    SUB_ID,
    IDLE_STATE,
    makeForm({ status: "ACTIVE" }),
  );
  assert.equal(result.status, "error");
  assert.ok(result.formError?.includes("Not authorized"));
  assert.equal(subscriptionReference.updateMany.mock.calls.length, 0);
});

test("update: returns error for invalid status enum value", async () => {
  const result = await updateSubscriptionAction(
    REL_ID,
    SUB_ID,
    IDLE_STATE,
    makeForm({ status: "TOTALLY_FAKE" }),
  );
  assert.equal(result.status, "error");
  assert.ok(result.errors.status);
  assert.equal(subscriptionReference.updateMany.mock.calls.length, 0);
});

test("update: returns error for unparseable date", async () => {
  const result = await updateSubscriptionAction(
    REL_ID,
    SUB_ID,
    IDLE_STATE,
    makeForm({ status: "ACTIVE", currentPeriodEndsAt: "banana" }),
  );
  assert.equal(result.status, "error");
  assert.ok(result.errors.currentPeriodEndsAt);
});

test("update: returns formError when subscription not found (count 0)", async () => {
  subscriptionReference.updateMany.mock.mockImplementation(async () => ({
    count: 0,
  }));
  const result = await updateSubscriptionAction(
    REL_ID,
    SUB_ID,
    IDLE_STATE,
    makeForm({ status: "ACTIVE" }),
  );
  assert.equal(result.status, "error");
  assert.ok(result.formError?.toLowerCase().includes("not found"));
});

test("update: succeeds with ACTIVE status and redirects", async () => {
  await assert.rejects(
    () =>
      updateSubscriptionAction(
        REL_ID,
        SUB_ID,
        IDLE_STATE,
        makeForm({ status: "ACTIVE" }),
      ),
    /REDIRECT/,
  );
  assert.equal(subscriptionReference.updateMany.mock.calls.length, 1);
  const args = subscriptionReference.updateMany.mock.calls[0].arguments[0] as {
    where: Record<string, unknown>;
    data: Record<string, unknown>;
  };
  assert.equal(args.where.id, SUB_ID);
  assert.equal(args.where.clientRelationshipId, REL_ID);
  assert.equal(args.data.status, "ACTIVE");
});

test("update: returns formError when prisma throws", async () => {
  subscriptionReference.updateMany.mock.mockImplementation(async () => {
    throw new Error("DB error");
  });
  const result = await updateSubscriptionAction(
    REL_ID,
    SUB_ID,
    IDLE_STATE,
    makeForm({ status: "ACTIVE" }),
  );
  assert.equal(result.status, "error");
  assert.ok(result.formError);
  assert.equal(redirect.mock.calls.length, 0);
});
