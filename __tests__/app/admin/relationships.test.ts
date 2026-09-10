import assert from "node:assert/strict";
import test, { before, beforeEach, mock } from "node:test";

import {
  mockPackage,
  neutraliseServerOnly,
} from "@/__tests__/helpers/mock-package";

// The allowlist is parsed once and cached for the process lifetime, so it has
// to be in place before `@/lib/auth/admin-allowlist` is ever loaded.
process.env.ADMIN_EMAILS = "admin@destinlmincy.com, Second.Admin@Example.com";

class RedirectError extends Error {
  constructor(readonly destination: string) {
    super(`NEXT_REDIRECT:${destination}`);
  }
}

class NotFoundError extends Error {
  constructor() {
    super("NEXT_NOT_FOUND");
  }
}

type ClerkUser = {
  primaryEmailAddress: {
    emailAddress: string;
    verification: { status: string } | null;
  } | null;
} | null;

const currentUser = mock.fn<() => Promise<ClerkUser>>();
const auth = mock.fn(async () => ({ userId: null as string | null }));

const redirect = mock.fn((destination: string): never => {
  throw new RedirectError(destination);
});
const notFound = mock.fn((): never => {
  throw new NotFoundError();
});

const listClientRelationships = mock.fn(async () => [] as unknown[]);

neutraliseServerOnly();
mockPackage("@clerk/nextjs/server", { auth, currentUser });
mockPackage("next/navigation", { redirect, notFound });
mock.module("@/lib/relationships/queries", {
  namedExports: { listClientRelationships },
});

type Page = typeof import("@/app/admin/relationships/page");

let RelationshipsPage: Page["default"];

before(async () => {
  ({ default: RelationshipsPage } = await import(
    "@/app/admin/relationships/page"
  ));
});

beforeEach(() => {
  for (const fn of [currentUser, auth, redirect, notFound, listClientRelationships]) {
    fn.mock.resetCalls();
  }
  currentUser.mock.mockImplementation(async () => null);
  listClientRelationships.mock.mockImplementation(async () => []);
});

function verifiedUser(emailAddress: string): ClerkUser {
  return {
    primaryEmailAddress: {
      emailAddress,
      verification: { status: "verified" },
    },
  };
}

test("/admin/relationships redirects unauthenticated users to sign-in", async () => {
  currentUser.mock.mockImplementation(async () => null);

  await assert.rejects(
    () => RelationshipsPage(),
    (error: unknown) => {
      assert.ok(error instanceof RedirectError);
      assert.equal(error.destination, "/sign-in");
      return true;
    },
  );

  assert.equal(redirect.mock.callCount(), 1);
  assert.equal(notFound.mock.callCount(), 0);
  assert.equal(
    listClientRelationships.mock.callCount(),
    0,
    "no relationship data should be read before auth passes",
  );
});

test("/admin/relationships returns 404 for authenticated non-admin users", async () => {
  currentUser.mock.mockImplementation(async () =>
    verifiedUser("someone.else@example.com"),
  );

  await assert.rejects(
    () => RelationshipsPage(),
    (error: unknown) => error instanceof NotFoundError,
  );

  assert.equal(notFound.mock.callCount(), 1);
  assert.equal(redirect.mock.callCount(), 0);
  assert.equal(listClientRelationships.mock.callCount(), 0);
});

test("/admin/relationships returns 404 when the admin email is unverified", async () => {
  currentUser.mock.mockImplementation(async () => ({
    primaryEmailAddress: {
      emailAddress: "admin@destinlmincy.com",
      verification: { status: "unverified" },
    },
  }));

  await assert.rejects(
    () => RelationshipsPage(),
    (error: unknown) => error instanceof NotFoundError,
  );

  assert.equal(notFound.mock.callCount(), 1);
});

test("/admin/relationships returns 404 when the user has no primary email", async () => {
  currentUser.mock.mockImplementation(async () => ({
    primaryEmailAddress: null,
  }));

  await assert.rejects(
    () => RelationshipsPage(),
    (error: unknown) => error instanceof NotFoundError,
  );
});

test("/admin/relationships renders for a verified allowlisted admin", async () => {
  currentUser.mock.mockImplementation(async () =>
    verifiedUser("admin@destinlmincy.com"),
  );

  const element = await RelationshipsPage();

  assert.ok(element, "the page should render an element");
  assert.equal(redirect.mock.callCount(), 0);
  assert.equal(notFound.mock.callCount(), 0);
  assert.equal(listClientRelationships.mock.callCount(), 1);
});

test("the allowlist match is case-insensitive and whitespace tolerant", async () => {
  currentUser.mock.mockImplementation(async () =>
    verifiedUser("second.admin@example.com"),
  );

  const element = await RelationshipsPage();

  assert.ok(element);
  assert.equal(notFound.mock.callCount(), 0);
});
