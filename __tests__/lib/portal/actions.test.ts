import assert from "node:assert/strict";
import test, { before, beforeEach, mock } from "node:test";

import {
  mockPackage,
  neutraliseServerOnly,
} from "@/__tests__/helpers/mock-package";

type AuthResult = { userId: string | null };
type ClerkUser = { firstName: string | null; lastName: string | null } | null;
type Membership = { clientRelationshipId: string } | null;

const auth = mock.fn<() => Promise<AuthResult>>();
const currentUser = mock.fn<() => Promise<ClerkUser>>();
const revalidatePath = mock.fn<(path: string) => void>();
const findClientMembershipByClerkUserId =
  mock.fn<(clerkUserId: string) => Promise<Membership>>();
const addMilestoneApproval =
  mock.fn<(input: Record<string, unknown>) => Promise<unknown>>();

neutraliseServerOnly();
mockPackage("@clerk/nextjs/server", { auth, currentUser });
mockPackage("next/cache", { revalidatePath });
mock.module("@/lib/auth/client-membership", {
  namedExports: { findClientMembershipByClerkUserId },
});
mock.module("@/lib/milestones/queries", {
  namedExports: { addMilestoneApproval },
});

type Actions = typeof import("@/lib/portal/actions");

let approveMilestone: Actions["approveMilestone"];
let requestMilestoneChanges: Actions["requestMilestoneChanges"];
let approveMilestoneAction: Actions["approveMilestoneAction"];
let requestMilestoneChangesAction: Actions["requestMilestoneChangesAction"];

const IDLE = { status: "idle" as const, errors: {} };

function noteForm(note?: string): FormData {
  const data = new FormData();
  if (note !== undefined) data.set("note", note);
  return data;
}

/** Signed in, and a member of the relationship under test. */
function signedInMember(relationshipId = "rel-1") {
  auth.mock.mockImplementation(async () => ({ userId: "user_abc" }));
  currentUser.mock.mockImplementation(async () => ({
    firstName: "Dana",
    lastName: "Client",
  }));
  findClientMembershipByClerkUserId.mock.mockImplementation(async () => ({
    clientRelationshipId: relationshipId,
  }));
}

before(async () => {
  ({
    approveMilestone,
    requestMilestoneChanges,
    approveMilestoneAction,
    requestMilestoneChangesAction,
  } = await import("@/lib/portal/actions"));
});

beforeEach(() => {
  for (const fn of [
    auth,
    currentUser,
    revalidatePath,
    findClientMembershipByClerkUserId,
    addMilestoneApproval,
  ]) {
    fn.mock.resetCalls();
  }
  auth.mock.mockImplementation(async () => ({ userId: null }));
  currentUser.mock.mockImplementation(async () => null);
  findClientMembershipByClerkUserId.mock.mockImplementation(async () => null);
  addMilestoneApproval.mock.mockImplementation(async () => ({ id: "appr-1" }));
  revalidatePath.mock.mockImplementation(() => undefined);
});

// ── approveMilestone ─────────────────────────────────────────────────────────

test("approveMilestone requires authentication", async () => {
  auth.mock.mockImplementation(async () => ({ userId: null }));

  const result = await approveMilestone("ms-1", "rel-1");

  assert.deepEqual(result, {
    status: "error",
    error: "You must be signed in.",
  });
  assert.equal(addMilestoneApproval.mock.callCount(), 0);
});

test("approveMilestone requires a client membership", async () => {
  auth.mock.mockImplementation(async () => ({ userId: "user_abc" }));
  findClientMembershipByClerkUserId.mock.mockImplementation(async () => null);

  const result = await approveMilestone("ms-1", "rel-1");

  assert.equal(result.status, "error");
  assert.equal(result.error, "You do not have access to this relationship.");
  assert.equal(addMilestoneApproval.mock.callCount(), 0);
});

test("approveMilestone rejects a member of a different relationship", async () => {
  signedInMember("rel-other");

  const result = await approveMilestone("ms-1", "rel-1");

  assert.equal(result.status, "error");
  assert.equal(result.error, "You do not have access to this relationship.");
  assert.equal(addMilestoneApproval.mock.callCount(), 0);
});

test("approveMilestone records an APPROVED approval for the actor", async () => {
  signedInMember();

  const result = await approveMilestone("ms-1", "rel-1");

  assert.deepEqual(result, { status: "success" });
  assert.equal(addMilestoneApproval.mock.callCount(), 1);

  const [input] = addMilestoneApproval.mock.calls[0].arguments as [
    Record<string, unknown>,
  ];
  assert.deepEqual(input, {
    milestoneId: "ms-1",
    clientRelationshipId: "rel-1",
    actorClerkUserId: "user_abc",
    actorName: "Dana Client",
    action: "APPROVED",
  });

  assert.equal(revalidatePath.mock.callCount(), 1);
  assert.deepEqual(revalidatePath.mock.calls[0].arguments, [
    "/portal/projects",
  ]);
});

test("approveMilestone falls back to a null actorName when Clerk has no name", async () => {
  signedInMember();
  currentUser.mock.mockImplementation(async () => ({
    firstName: null,
    lastName: null,
  }));

  await approveMilestone("ms-1", "rel-1");

  const [input] = addMilestoneApproval.mock.calls[0].arguments as [
    Record<string, unknown>,
  ];
  assert.equal(input.actorName, null);
});

test("approveMilestone surfaces a generic error when the write fails", async () => {
  signedInMember();
  addMilestoneApproval.mock.mockImplementation(async () => {
    throw new Error("db down");
  });
  const errorLog = mock.method(console, "error", () => undefined);

  const result = await approveMilestone("ms-1", "rel-1");

  errorLog.mock.restore();
  assert.deepEqual(result, {
    status: "error",
    error: "Something went wrong. Try again.",
  });
  assert.equal(revalidatePath.mock.callCount(), 0);
});

// ── requestMilestoneChanges ──────────────────────────────────────────────────

test("requestMilestoneChanges requires authentication", async () => {
  auth.mock.mockImplementation(async () => ({ userId: null }));

  const result = await requestMilestoneChanges(
    "ms-1",
    "rel-1",
    IDLE,
    noteForm("Please revise"),
  );

  assert.equal(result.status, "error");
  assert.equal(result.formError, "You must be signed in.");
  assert.equal(addMilestoneApproval.mock.callCount(), 0);
});

test("requestMilestoneChanges requires a note", async () => {
  signedInMember();

  const result = await requestMilestoneChanges("ms-1", "rel-1", IDLE, noteForm(""));

  assert.equal(result.status, "error");
  assert.equal(
    result.errors.note,
    "A note explaining the requested changes is required.",
  );
  assert.equal(addMilestoneApproval.mock.callCount(), 0);
});

test("requestMilestoneChanges rejects a whitespace-only note", async () => {
  signedInMember();

  const result = await requestMilestoneChanges(
    "ms-1",
    "rel-1",
    IDLE,
    noteForm("   \n  "),
  );

  assert.equal(result.status, "error");
  assert.ok(result.errors.note);
  assert.equal(addMilestoneApproval.mock.callCount(), 0);
});

test("requestMilestoneChanges requires a note field to be present at all", async () => {
  signedInMember();

  const result = await requestMilestoneChanges("ms-1", "rel-1", IDLE, noteForm());

  assert.equal(result.status, "error");
  assert.ok(result.errors.note);
});

test("requestMilestoneChanges records CHANGES_REQUESTED with the trimmed note", async () => {
  signedInMember();

  const result = await requestMilestoneChanges(
    "ms-1",
    "rel-1",
    IDLE,
    noteForm("  The header spacing is off.  "),
  );

  assert.deepEqual(result, { status: "success", errors: {} });

  const [input] = addMilestoneApproval.mock.calls[0].arguments as [
    Record<string, unknown>,
  ];
  assert.deepEqual(input, {
    milestoneId: "ms-1",
    clientRelationshipId: "rel-1",
    actorClerkUserId: "user_abc",
    actorName: "Dana Client",
    action: "CHANGES_REQUESTED",
    note: "The header spacing is off.",
  });
  assert.equal(revalidatePath.mock.callCount(), 1);
});

test("requestMilestoneChanges rejects a member of a different relationship", async () => {
  signedInMember("rel-other");

  const result = await requestMilestoneChanges(
    "ms-1",
    "rel-1",
    IDLE,
    noteForm("Please revise"),
  );

  assert.equal(result.status, "error");
  assert.equal(result.formError, "You do not have access to this relationship.");
  assert.equal(addMilestoneApproval.mock.callCount(), 0);
});

// ── Client-facing adapters ───────────────────────────────────────────────────

test("approveMilestoneAction maps success to { success: true }", async () => {
  signedInMember();

  assert.deepEqual(await approveMilestoneAction("ms-1", "rel-1"), {
    success: true,
  });
});

test("approveMilestoneAction maps failure to { success: false, error }", async () => {
  auth.mock.mockImplementation(async () => ({ userId: null }));

  assert.deepEqual(await approveMilestoneAction("ms-1", "rel-1"), {
    success: false,
    error: "You must be signed in.",
  });
});

test("requestMilestoneChangesAction surfaces the missing-note error", async () => {
  signedInMember();

  assert.deepEqual(
    await requestMilestoneChangesAction("ms-1", "rel-1", ""),
    {
      success: false,
      error: "A note explaining the requested changes is required.",
    },
  );
});

test("requestMilestoneChangesAction passes the note through on success", async () => {
  signedInMember();

  assert.deepEqual(
    await requestMilestoneChangesAction("ms-1", "rel-1", "Fix the spacing"),
    { success: true },
  );

  const [input] = addMilestoneApproval.mock.calls[0].arguments as [
    Record<string, unknown>,
  ];
  assert.equal(input.note, "Fix the spacing");
});
