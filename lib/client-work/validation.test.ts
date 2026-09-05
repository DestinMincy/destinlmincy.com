import assert from "node:assert/strict";
import test from "node:test";

import {
  dateInputToDate,
  isDateInput,
  parseApplicationSiteForm,
  parseProjectForm,
} from "./validation";

function formData(values: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) {
    data.set(key, value);
  }
  return data;
}

test("application/site form trims valid values", () => {
  const result = parseApplicationSiteForm(
    formData({
      name: "  Client website  ",
      type: "WEBSITE",
      productionUrl: " https://example.com ",
      stagingUrl: "https://staging.example.com",
      repositoryUrl: "https://github.com/example/site",
      notes: " Operations notes ",
    }),
  );

  assert.deepEqual(result.errors, {});
  assert.equal(result.values.name, "Client website");
  assert.equal(result.values.productionUrl, "https://example.com");
  assert.equal(result.values.notes, "Operations notes");
});

test("application/site form rejects missing names and unsafe URLs", () => {
  const result = parseApplicationSiteForm(
    formData({
      name: "",
      type: "INVALID",
      productionUrl: "javascript:alert(1)",
      stagingUrl: "not-a-url",
      repositoryUrl: "ftp://example.com/repo",
    }),
  );

  assert.equal(result.errors.name, "Name is required.");
  assert.ok(result.errors.type);
  assert.ok(result.errors.productionUrl);
  assert.ok(result.errors.stagingUrl);
  assert.ok(result.errors.repositoryUrl);
});

test("project form accepts scoped work metadata", () => {
  const result = parseProjectForm(
    formData({
      name: "Site overhaul",
      status: "IN_PROGRESS",
      applicationSiteId: "site_123",
      summary: "Internal summary",
      clientDescription: "Client-facing description",
      startsAt: "2026-08-01",
      targetDate: "2026-09-30",
    }),
  );

  assert.deepEqual(result.errors, {});
  assert.equal(result.values.createsNewAsset, false);
  assert.equal(result.values.status, "IN_PROGRESS");
});

test("project form rejects contradictory asset choices and reversed dates", () => {
  const data = formData({
    name: "New product",
    status: "PLANNED",
    applicationSiteId: "site_123",
    createsNewAsset: "on",
    startsAt: "2026-09-30",
    targetDate: "2026-09-01",
  });
  const result = parseProjectForm(data);

  assert.ok(result.errors.applicationSiteId);
  assert.ok(result.errors.createsNewAsset);
  assert.equal(
    result.errors.targetDate,
    "Target date cannot be before the start date.",
  );

  const editResult = parseProjectForm(data, {
    allowCreatedAssetAttachment: true,
  });
  assert.equal(editResult.errors.applicationSiteId, undefined);
  assert.equal(editResult.errors.createsNewAsset, undefined);
});

test("date parsing rejects calendar overflow", () => {
  assert.equal(isDateInput("0099-01-01"), true);
  assert.equal(dateInputToDate("0099-01-01")?.toISOString(), "0099-01-01T00:00:00.000Z");
  assert.equal(isDateInput("2026-02-29"), false);
  assert.equal(isDateInput("2028-02-29"), true);
  assert.equal(dateInputToDate("2028-02-29")?.toISOString(), "2028-02-29T00:00:00.000Z");
  assert.equal(dateInputToDate("bad"), null);
});
