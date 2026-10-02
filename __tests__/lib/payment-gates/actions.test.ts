import assert from "node:assert/strict";
import test, { before, beforeEach, mock } from "node:test";

import {
  mockPackage,
  neutraliseServerOnly,
} from "@/__tests__/helpers/mock-package";
import {
  argsOf,
  prismaModel,
  resetModels,
} from "@/__tests__/helpers/prisma-mock";
import { EMPTY_PAYMENT_GATE_FORM_VALUES } from "@/lib/payment-gates/types";

const getAdminUser = mock.fn<() => Promise<{ id: string } | null>>();
const revalidatePath = mock.fn<(path: string) => void>();
const redirect = mock.fn<(url: string) => never>();

const paymentGate = prismaModel("create", "findFirst", "updateMany");
const clientRelationship = prismaModel("findUnique");
const project = prismaModel("findFirst");

neutraliseServerOnly();
mockPackage("@/lib/auth/require-admin", { getAdminUser });
mockPackage("next/cache", { revalidatePath });
mockPackage("next/navigation", { redirect });
mock.module("@/lib/db/client", {
  namedExports: { prisma: { paymentGate, clientRelationship, project } },
});

type Actions = typeof import("@/lib/payment-gates/actions");

let createPaymentGateAction: Actions["createPaymentGateAction"];
let updatePaymentGateAction: Actions["updatePaymentGateAction"];
let updatePaymentGateStatusAction: Actions["updatePaymentGateStatusAction"];

const IDLE_STATE = {
  status: "idle" as const,
  values: EMPTY_PAYMENT_GATE_FORM_VALUES,
  errors: {},
};
const REL_ID = "rel-1";
const GATE_ID = "gate-1";

function makeForm(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

const VALID = { label: "50% deposit", status: "PENDING", paymentType: "DEPOSIT" };

before(async () => {
  ({
    createPaymentGateAction,
    updatePaymentGateAction,
    updatePaymentGateStatusAction,
  } = await import("@/lib/payment-gates/actions"));
});

beforeEach(() => {
  resetModels(paymentGate, clientRelationship, project);
  revalidatePath.mock.resetCalls();
  redirect.mock.resetCalls();
  getAdminUser.mock.resetCalls();

  getAdminUser.mock.mockImplementation(async () => ({ id: "admin-1" }));
  clientRelationship.findUnique.mock.mockImplementation(async () => ({ id: REL_ID }));
  project.findFirst.mock.mockImplementation(async () => ({ id: "proj-1" }));
  paymentGate.create.mock.mockImplementation(async () => ({ id: GATE_ID }));
  paymentGate.findFirst.mock.mockImplementation(async () => ({
    id: GATE_ID,
    projectId: null,
    stripeUrl: null,
  }));
  paymentGate.updateMany.mock.mockImplementation(async () => ({ count: 1 }));
  redirect.mock.mockImplementation((_url: string) => {
    throw new Error("REDIRECT");
  });
});

// ─── createPaymentGateAction ───────────────────────────────────────────────

test("create: refuses non-admins before touching the database", async () => {
  getAdminUser.mock.mockImplementation(async () => null);
  const result = await createPaymentGateAction(REL_ID, IDLE_STATE, makeForm(VALID));
  assert.equal(result.status, "error");
  assert.match(result.formError ?? "", /not authorized/i);
  assert.equal(paymentGate.create.mock.calls.length, 0);
});

test("create: requires a label", async () => {
  const result = await createPaymentGateAction(
    REL_ID,
    IDLE_STATE,
    makeForm({ ...VALID, label: "   " }),
  );
  assert.equal(result.status, "error");
  assert.ok(result.errors.label);
  assert.equal(paymentGate.create.mock.calls.length, 0);
});

test("create: rejects unknown status and payment type instead of defaulting", async () => {
  const result = await createPaymentGateAction(
    REL_ID,
    IDLE_STATE,
    makeForm({ label: "x", status: "BOGUS", paymentType: "NOPE" }),
  );
  assert.equal(result.status, "error");
  assert.ok(result.errors.status);
  assert.ok(result.errors.paymentType);
});

test("create: rejects negative, non-numeric, and over-precise amounts", async () => {
  for (const amount of ["-5", "abc", "10.999"]) {
    const result = await createPaymentGateAction(
      REL_ID,
      IDLE_STATE,
      makeForm({ ...VALID, amount }),
    );
    assert.equal(result.status, "error", amount);
    assert.ok(result.errors.amount, amount);
  }
  assert.equal(paymentGate.create.mock.calls.length, 0);
});

test("create: rejects a non-https Stripe URL and a bad currency code", async () => {
  const result = await createPaymentGateAction(
    REL_ID,
    IDLE_STATE,
    makeForm({ ...VALID, stripeUrl: "http://evil.example/pay", currency: "dollars" }),
  );
  assert.equal(result.status, "error");
  assert.ok(result.errors.stripeUrl);
  assert.ok(result.errors.currency);
});

test("create: ATTACHED status needs a Stripe URL", async () => {
  const result = await createPaymentGateAction(
    REL_ID,
    IDLE_STATE,
    makeForm({ ...VALID, status: "ATTACHED" }),
  );
  assert.equal(result.status, "error");
  assert.match(result.errors.stripeUrl ?? "", /Stripe/);
});

test("create: rejects a project outside the relationship", async () => {
  project.findFirst.mock.mockImplementation(async () => null);
  const result = await createPaymentGateAction(
    REL_ID,
    IDLE_STATE,
    makeForm({ ...VALID, projectId: "other-proj" }),
  );
  assert.equal(result.status, "error");
  assert.ok(result.errors.projectId);
  const where = argsOf(project.findFirst).where;
  assert.equal(where.clientRelationshipId, REL_ID);
  assert.equal(where.id, "other-proj");
  assert.deepEqual(where.status, { not: "ARCHIVED" });
  assert.equal(paymentGate.create.mock.calls.length, 0);
});

test("create: persists normalized values and redirects to the list", async () => {
  await assert.rejects(
    createPaymentGateAction(
      REL_ID,
      IDLE_STATE,
      makeForm({
        ...VALID,
        status: "ATTACHED",
        amount: "1500",
        currency: "usd",
        dueDate: "2026-11-01",
        requiredBeforeWork: "true",
        stripeUrl: "https://invoice.stripe.com/i/abc",
        stripeId: "in_123",
        projectId: "proj-1",
      }),
    ),
    /REDIRECT/,
  );

  const data = argsOf(paymentGate.create).data;
  assert.equal(data.clientRelationshipId, REL_ID);
  assert.equal(data.label, "50% deposit");
  assert.equal(data.status, "ATTACHED");
  assert.equal(data.paymentType, "DEPOSIT");
  assert.equal(data.amount, "1500");
  assert.equal(data.currency, "USD");
  assert.equal((data.dueDate as Date).toISOString(), "2026-11-01T00:00:00.000Z");
  assert.equal(data.requiredBeforeWork, true);
  assert.equal(data.stripeUrl, "https://invoice.stripe.com/i/abc");
  assert.equal(data.stripeId, "in_123");
  assert.equal(data.projectId, "proj-1");

  const revalidated = revalidatePath.mock.calls.map((c) => c.arguments[0]);
  assert.ok(revalidated.includes(`/admin/relationships/${REL_ID}/payment-gates`));
  assert.ok(revalidated.includes(`/admin/relationships/${REL_ID}/projects/proj-1`));
  assert.ok(revalidated.includes("/portal/payments"));
});

test("create: returns formError when the relationship is gone", async () => {
  clientRelationship.findUnique.mock.mockImplementation(async () => null);
  const result = await createPaymentGateAction(REL_ID, IDLE_STATE, makeForm(VALID));
  assert.equal(result.status, "error");
  assert.match(result.formError ?? "", /no longer exists/);
});

// ─── updatePaymentGateAction ───────────────────────────────────────────────

test("update: refuses non-admins", async () => {
  getAdminUser.mock.mockImplementation(async () => null);
  const result = await updatePaymentGateAction(REL_ID, GATE_ID, IDLE_STATE, makeForm(VALID));
  assert.equal(result.status, "error");
  assert.equal(paymentGate.updateMany.mock.calls.length, 0);
});

test("update: scopes the lookup to the relationship and reports a missing gate", async () => {
  paymentGate.findFirst.mock.mockImplementation(async () => null);
  const result = await updatePaymentGateAction(REL_ID, GATE_ID, IDLE_STATE, makeForm(VALID));
  assert.equal(result.status, "error");
  assert.match(result.formError ?? "", /no longer exists/);
  assert.deepEqual(argsOf(paymentGate.findFirst).where, {
    id: GATE_ID,
    clientRelationshipId: REL_ID,
  });
  assert.equal(paymentGate.updateMany.mock.calls.length, 0);
});

test("update: keeps an archived project selectable when the gate already uses it", async () => {
  paymentGate.findFirst.mock.mockImplementation(async () => ({
    id: GATE_ID,
    projectId: "proj-1",
    stripeUrl: null,
  }));
  await assert.rejects(
    updatePaymentGateAction(
      REL_ID,
      GATE_ID,
      IDLE_STATE,
      makeForm({ ...VALID, projectId: "proj-1" }),
    ),
    /REDIRECT/,
  );
  const where = argsOf(project.findFirst).where;
  assert.equal(where.status, undefined);
});

test("update: writes the full record scoped by relationship and clears optional fields", async () => {
  await assert.rejects(
    updatePaymentGateAction(
      REL_ID,
      GATE_ID,
      IDLE_STATE,
      makeForm({ ...VALID, status: "PAID" }),
    ),
    /REDIRECT/,
  );
  const args = argsOf(paymentGate.updateMany);
  assert.deepEqual(args.where, { id: GATE_ID, clientRelationshipId: REL_ID });
  assert.equal(args.data.status, "PAID");
  assert.equal(args.data.amount, null);
  assert.equal(args.data.stripeUrl, null);
  assert.equal(args.data.projectId, null);
});

// ─── updatePaymentGateStatusAction ─────────────────────────────────────────

test("status: rejects an unknown status", async () => {
  const result = await updatePaymentGateStatusAction(
    REL_ID,
    GATE_ID,
    { status: "idle" },
    makeForm({ status: "NOPE" }),
  );
  assert.equal(result.status, "error");
  assert.equal(paymentGate.updateMany.mock.calls.length, 0);
});

test("status: will not mark ATTACHED without a Stripe URL on record", async () => {
  const result = await updatePaymentGateStatusAction(
    REL_ID,
    GATE_ID,
    { status: "idle" },
    makeForm({ status: "ATTACHED" }),
  );
  assert.equal(result.status, "error");
  assert.match(result.error ?? "", /Stripe URL/);
  assert.equal(paymentGate.updateMany.mock.calls.length, 0);
});

test("status: marks PAID scoped by relationship and revalidates the project", async () => {
  paymentGate.findFirst.mock.mockImplementation(async () => ({
    id: GATE_ID,
    projectId: "proj-9",
    stripeUrl: "https://pay.stripe.com/x",
  }));
  const result = await updatePaymentGateStatusAction(
    REL_ID,
    GATE_ID,
    { status: "idle" },
    makeForm({ status: "PAID" }),
  );
  assert.equal(result.status, "idle");
  const args = argsOf(paymentGate.updateMany);
  assert.deepEqual(args.where, { id: GATE_ID, clientRelationshipId: REL_ID });
  assert.deepEqual(args.data, { status: "PAID" });
  const revalidated = revalidatePath.mock.calls.map((c) => c.arguments[0]);
  assert.ok(revalidated.includes(`/admin/relationships/${REL_ID}/projects/proj-9`));
});
