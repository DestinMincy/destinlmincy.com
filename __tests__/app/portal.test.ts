import assert from "node:assert/strict";
import test, { before, beforeEach, mock } from "node:test";

import {
  mockPackage,
  neutraliseServerOnly,
} from "@/__tests__/helpers/mock-package";

class RedirectError extends Error {
  constructor(readonly destination: string) {
    super(`NEXT_REDIRECT:${destination}`);
  }
}

type Membership = {
  clientUserId: string;
  clientRelationshipId: string;
  clientRelationshipName: string;
} | null;

const auth = mock.fn(async () => ({ userId: null as string | null }));
const redirect = mock.fn((destination: string): never => {
  throw new RedirectError(destination);
});
const findClientMembershipByClerkUserId =
  mock.fn<(clerkUserId: string) => Promise<Membership>>();

const getPortalActionItems = mock.fn(async () => ({ pendingPayments: 0 }));
const listPortalContracts = mock.fn(async () => [] as unknown[]);
const listPortalPaymentGates = mock.fn(async () => [] as unknown[]);
const listPortalSubscriptions = mock.fn(async () => [] as unknown[]);
const listPortalProjects = mock.fn(async () => [] as unknown[]);

neutraliseServerOnly();
mockPackage("@clerk/nextjs/server", { auth });
mockPackage("next/navigation", { redirect, usePathname: () => "/portal" });
// The portal layout imports SignOutButton from Clerk's client entry.
mockPackage("@clerk/nextjs", {
  SignOutButton: ({ children }: { children?: unknown }) => children ?? null,
});
mock.module("@/lib/auth/client-membership", {
  namedExports: { findClientMembershipByClerkUserId },
});
mock.module("@/lib/portal/queries", {
  namedExports: {
    getPortalActionItems,
    listPortalContracts,
    listPortalPaymentGates,
    listPortalSubscriptions,
    listPortalProjects,
  },
});

type PortalPageModule = typeof import("@/app/portal/page");
type PortalLayoutModule = typeof import("@/app/portal/layout");

let PortalPage: PortalPageModule["default"];
let PortalLayout: PortalLayoutModule["default"];
let renderToStaticMarkup: (element: unknown) => string;

const MEMBER: NonNullable<Membership> = {
  clientUserId: "cu-1",
  clientRelationshipId: "rel-1",
  clientRelationshipName: "Acme Co",
};

before(async () => {
  ({ default: PortalPage } = await import("@/app/portal/page"));
  ({ default: PortalLayout } = await import("@/app/portal/layout"));
  ({ renderToStaticMarkup } = (await import(
    "react-dom/server"
  )) as unknown as { renderToStaticMarkup: (element: unknown) => string });
});

beforeEach(() => {
  for (const fn of [
    auth,
    redirect,
    findClientMembershipByClerkUserId,
    getPortalActionItems,
    listPortalContracts,
    listPortalPaymentGates,
    listPortalSubscriptions,
    listPortalProjects,
  ]) {
    fn.mock.resetCalls();
  }
  auth.mock.mockImplementation(async () => ({ userId: null }));
  findClientMembershipByClerkUserId.mock.mockImplementation(async () => null);
  getPortalActionItems.mock.mockImplementation(async () => ({
    pendingPayments: 0,
  }));
  for (const fn of [
    listPortalContracts,
    listPortalPaymentGates,
    listPortalSubscriptions,
    listPortalProjects,
  ]) {
    fn.mock.mockImplementation(async () => []);
  }
});

// ── Unauthenticated access ───────────────────────────────────────────────────

test("/portal redirects unauthenticated users to sign-in", async () => {
  auth.mock.mockImplementation(async () => ({ userId: null }));

  await assert.rejects(
    () => PortalPage(),
    (error: unknown) => {
      assert.ok(error instanceof RedirectError);
      assert.equal(error.destination, "/sign-in?redirect_url=/portal");
      return true;
    },
  );

  assert.equal(
    findClientMembershipByClerkUserId.mock.callCount(),
    0,
    "membership must not be looked up before auth passes",
  );
});

test("the portal layout also redirects unauthenticated users", async () => {
  auth.mock.mockImplementation(async () => ({ userId: null }));

  await assert.rejects(
    () => PortalLayout({ children: null }),
    (error: unknown) => {
      assert.ok(error instanceof RedirectError);
      assert.equal(error.destination, "/sign-in?redirect_url=/portal");
      return true;
    },
  );
});

test("/portal reads no client data for an unauthenticated visitor", async () => {
  auth.mock.mockImplementation(async () => ({ userId: null }));

  await assert.rejects(() => PortalPage());

  for (const fn of [
    getPortalActionItems,
    listPortalContracts,
    listPortalPaymentGates,
    listPortalSubscriptions,
    listPortalProjects,
  ]) {
    assert.equal(fn.mock.callCount(), 0);
  }
});

// ── Signed in, but no client relationship ────────────────────────────────────

test("a signed-in user with no membership sees the no-relationship message", async () => {
  auth.mock.mockImplementation(async () => ({ userId: "user_abc" }));
  findClientMembershipByClerkUserId.mock.mockImplementation(async () => null);

  const element = await PortalLayout({ children: null });
  const html = renderToStaticMarkup(element);

  assert.match(html, /No client relationship on file/);
  assert.match(html, /not linked to a client relationship/);
  assert.match(html, /mailto:/);
  assert.doesNotMatch(
    html,
    /portal-shell/,
    "the authenticated portal shell must not render without a membership",
  );
});

test("the no-membership layout does not render the portal navigation", async () => {
  auth.mock.mockImplementation(async () => ({ userId: "user_abc" }));
  findClientMembershipByClerkUserId.mock.mockImplementation(async () => null);

  const html = renderToStaticMarkup(await PortalLayout({ children: null }));

  assert.doesNotMatch(html, /href="\/portal\/contracts"/);
  assert.doesNotMatch(html, /Sign out/);
});

test("/portal renders nothing when the user has no membership", async () => {
  auth.mock.mockImplementation(async () => ({ userId: "user_abc" }));
  findClientMembershipByClerkUserId.mock.mockImplementation(async () => null);

  const result = await PortalPage();

  assert.equal(result, null, "the layout owns the no-membership state");
  assert.equal(getPortalActionItems.mock.callCount(), 0);
  assert.equal(listPortalContracts.mock.callCount(), 0);
});

// ── Signed in with a membership ──────────────────────────────────────────────

test("/portal loads relationship-scoped data for a member", async () => {
  auth.mock.mockImplementation(async () => ({ userId: "user_abc" }));
  findClientMembershipByClerkUserId.mock.mockImplementation(async () => MEMBER);

  const element = await PortalPage();
  assert.ok(element);

  for (const fn of [
    getPortalActionItems,
    listPortalContracts,
    listPortalPaymentGates,
    listPortalSubscriptions,
    listPortalProjects,
  ]) {
    assert.equal(fn.mock.callCount(), 1);
    assert.deepEqual(fn.mock.calls[0].arguments, ["rel-1"]);
  }
});

test("/portal looks the membership up by the authenticated Clerk user id", async () => {
  auth.mock.mockImplementation(async () => ({ userId: "user_abc" }));
  findClientMembershipByClerkUserId.mock.mockImplementation(async () => MEMBER);

  await PortalPage();

  assert.deepEqual(findClientMembershipByClerkUserId.mock.calls[0].arguments, [
    "user_abc",
  ]);
});

test("/portal surfaces pending payments as an action item", async () => {
  auth.mock.mockImplementation(async () => ({ userId: "user_abc" }));
  findClientMembershipByClerkUserId.mock.mockImplementation(async () => MEMBER);
  getPortalActionItems.mock.mockImplementation(async () => ({
    pendingPayments: 2,
  }));

  const html = renderToStaticMarkup(await PortalPage());

  assert.match(html, /Needs your attention/);
  assert.match(html, /2 payments are waiting/);
});

test("/portal hides the action panel when nothing is pending", async () => {
  auth.mock.mockImplementation(async () => ({ userId: "user_abc" }));
  findClientMembershipByClerkUserId.mock.mockImplementation(async () => MEMBER);

  const html = renderToStaticMarkup(await PortalPage());

  assert.doesNotMatch(html, /Needs your attention/);
  assert.match(html, /Acme Co/);
});
