import "dotenv/config";

import { expect, test } from "@playwright/test";
import { Pool } from "pg";

const relationshipId = process.env.UNIT05_RELATIONSHIP_ID;
const adminImpersonationUrl = process.env.UNIT05_ADMIN_IMPERSONATION_URL;
const clientImpersonationUrl = process.env.UNIT05_CLIENT_IMPERSONATION_URL;
const clientUserId = process.env.UNIT05_CLIENT_USER_ID;
const clientEmail = process.env.UNIT05_CLIENT_EMAIL;
const databaseUrl = process.env.DATABASE_URL;
const destructiveDatabaseAccessEnabled =
  process.env.UNIT05_ALLOW_DESTRUCTIVE_E2E === "true";

function isAllowedE2EDatabaseTarget(connectionString: string | undefined) {
  if (!connectionString) {
    return false;
  }

  try {
    const url = new URL(connectionString);
    const databaseName = decodeURIComponent(url.pathname.slice(1));
    const schemaName = url.searchParams.get("schema");

    return (
      ["postgres:", "postgresql:"].includes(url.protocol) &&
      (databaseName === "destinlmincy_test" || schemaName === "unit05_e2e")
    );
  } catch {
    return false;
  }
}

const databaseTargetIsAllowed = isAllowedE2EDatabaseTarget(databaseUrl);
const pool =
  destructiveDatabaseAccessEnabled && databaseTargetIsAllowed
    ? new Pool({ connectionString: databaseUrl })
    : null;

async function clearBrowserRecords() {
  if (!relationshipId || !pool) {
    return;
  }

  await pool.query(
    'DELETE FROM "projects" WHERE "clientRelationshipId" = $1 AND "name" LIKE $2',
    [relationshipId, "Unit 05 browser%"],
  );
  await pool.query(
    'DELETE FROM "application_sites" WHERE "clientRelationshipId" = $1 AND "name" LIKE $2',
    [relationshipId, "Unit 05 browser%"],
  );
}

test.describe("Unit 05 applications, sites, and projects", () => {
  test.skip(
    !relationshipId ||
      !adminImpersonationUrl ||
      !clientImpersonationUrl ||
      !clientUserId ||
      !clientEmail ||
      !destructiveDatabaseAccessEnabled ||
      !databaseTargetIsAllowed,
    "Unit 05 disposable Clerk fixtures, destructive-test opt-in, and an allowlisted test database or schema are required.",
  );

  test.beforeAll(async () => {
    if (!relationshipId || !clientUserId || !clientEmail || !pool) {
      return;
    }

    await clearBrowserRecords();
    await pool.query(
      `INSERT INTO "client_users"
        ("id", "clientRelationshipId", "clerkUserId", "email", "name", "status", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, 'ACTIVE', NOW(), NOW())
       ON CONFLICT ("clientRelationshipId", "clerkUserId")
       DO UPDATE SET "email" = EXCLUDED."email", "name" = EXCLUDED."name", "status" = 'ACTIVE', "updatedAt" = NOW()`,
      [`unit05-e2e-${clientUserId}`, relationshipId, clientUserId, clientEmail, "Unit05 Client"],
    );
  });

  test.afterAll(async () => {
    if (relationshipId && clientUserId && pool) {
      await clearBrowserRecords();
      await pool.query(
        'DELETE FROM "client_users" WHERE "clientRelationshipId" = $1 AND "clerkUserId" = $2',
        [relationshipId, clientUserId],
      );
    }
    await pool?.end();
  });

  test("admin manages work and client sees only read-only active records", async ({
    browser,
  }) => {
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    await adminPage.goto(adminImpersonationUrl!);
    await adminPage.waitForLoadState("networkidle");
    await expect(
      adminPage.getByText("Applications and sites", { exact: true }),
    ).toBeVisible();

    await adminPage.getByRole("link", { name: "New application or site" }).click();
    await adminPage.getByLabel("Name").fill("Unit 05 browser site");
    await adminPage.getByLabel("Type").selectOption("WEB_APPLICATION");
    await adminPage.getByLabel("Production URL").fill("javascript:alert(1)");
    await adminPage.getByRole("button", { name: "Create application or site" }).click();
    await expect(
      adminPage.getByText("Enter a valid http or https production URL."),
    ).toBeVisible();

    await adminPage.getByLabel("Production URL").fill("https://unit05.example.com");
    await adminPage.getByLabel("Staging URL").fill("https://staging.unit05.example.com");
    await adminPage
      .getByLabel("Repository URL")
      .fill("https://github.com/example/unit05");
    await adminPage.getByLabel("Internal notes").fill("Browser-created test fixture.");
    await adminPage.getByRole("button", { name: "Create application or site" }).click();
    await expect(adminPage.getByRole("link", { name: "Unit 05 browser site" })).toBeVisible();

    await adminPage.getByRole("link", { name: "Unit 05 browser site" }).click();
    await adminPage.getByLabel("Name").fill("Unit 05 browser site edited");
    await adminPage.getByRole("button", { name: "Save changes" }).click();
    await expect(
      adminPage.getByRole("link", { name: "Unit 05 browser site edited" }),
    ).toBeVisible();

    await adminPage.goto(`/admin/relationships/${relationshipId}/projects/new`);
    await adminPage.getByLabel("Name").fill("Unit 05 browser project");
    await adminPage.getByLabel("Status").selectOption("IN_PROGRESS");
    const applicationSelect = adminPage.getByLabel("Existing application or site");
    const selectedApplicationId = await applicationSelect.selectOption({
      label: "Unit 05 browser site edited",
    });
    await adminPage
      .getByLabel("This project creates a new application or site")
      .check();
    await adminPage.getByRole("button", { name: "Create project" }).click();
    await expect(
      adminPage.getByText(
        "A new-asset project cannot attach to an existing application or site yet.",
      ),
    ).toBeVisible();
    await expect(applicationSelect).toHaveValue(selectedApplicationId[0]);

    await adminPage
      .getByLabel("This project creates a new application or site")
      .uncheck();
    await adminPage.getByLabel("Start date").fill("2026-08-01");
    await adminPage.getByLabel("Target date").fill("2026-09-30");
    await adminPage
      .getByLabel("Client-facing description")
      .fill("A browser-verified client project.");
    await adminPage.getByLabel("Internal summary").fill("Internal test summary.");
    await adminPage.getByRole("button", { name: "Create project" }).click();
    const createdProjectRow = adminPage.getByRole("row", {
      name: /Unit 05 browser project/,
    });
    await expect(
      createdProjectRow.getByRole("link", { name: "Unit 05 browser project" }),
    ).toBeVisible();
    await expect(createdProjectRow.getByText("Unit 05 browser site edited")).toBeVisible();

    await adminPage.getByRole("link", { name: "Unit 05 browser project" }).click();
    await adminPage.getByLabel("Status").selectOption("COMPLETED");
    await adminPage.getByRole("button", { name: "Save changes" }).click();
    await expect(
      adminPage.getByRole("row", { name: /Unit 05 browser project/ }).getByText("Completed"),
    ).toBeVisible();

    const clientContext = await browser.newContext();
    const clientPage = await clientContext.newPage();
    await clientPage.goto(clientImpersonationUrl!);
    await clientPage.waitForLoadState("networkidle");
    await expect(clientPage.getByRole("heading", { name: "DLM Demo Relationship" })).toBeVisible();
    await expect(clientPage.getByText("destinlmincy.com", { exact: true })).toBeVisible();
    await expect(clientPage.getByText("Next.js Relationship OS Foundation")).toBeVisible();
    await expect(clientPage.getByRole("link", { name: "New project" })).toHaveCount(0);

    await clientPage.goto(`/admin/relationships/${relationshipId}/projects/new`);
    await expect(
      clientPage.getByRole("heading", {
        name: "This page could not be found.",
      }),
    ).toBeVisible();

    await adminPage.goto(`/admin/relationships/${relationshipId}/projects`);
    const projectRow = adminPage.getByRole("row", { name: /Unit 05 browser project/ });
    await projectRow.getByRole("button", { name: "Archive Unit 05 browser project" }).click();
    await expect(projectRow.getByText("Archived")).toBeVisible();

    await adminPage.goto(`/admin/relationships/${relationshipId}/applications`);
    const applicationRow = adminPage.getByRole("row", {
      name: /Unit 05 browser site edited/,
    });
    await applicationRow
      .getByRole("button", { name: "Archive Unit 05 browser site edited" })
      .click();
    await expect(applicationRow.getByText("Archived")).toBeVisible();

    await clientPage.goto("/portal");
    await expect(clientPage.getByText("Unit 05 browser site edited")).toHaveCount(0);
    await expect(clientPage.getByText("Unit 05 browser project")).toHaveCount(0);

    await adminContext.close();
    await clientContext.close();
  });
});
