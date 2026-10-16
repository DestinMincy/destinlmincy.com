import assert from "node:assert/strict";
import test from "node:test";

import { LIFECYCLE_VALUES } from "./types";
import {
  isLifecycleValue,
  isValidEmail,
  parseRelationshipForm,
  SLUG_MAX_LENGTH,
  slugifyRelationshipName,
} from "./validation";

function formData(values: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) {
    data.set(key, value);
  }
  return data;
}

const VALID_BASE = { name: "Acme Co", lifecycle: "LEAD" };

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

test("relationship form trims valid values and returns no errors", () => {
  const result = parseRelationshipForm(
    formData({
      name: "  Acme Co  ",
      legalName: " Acme Company LLC ",
      primaryContactName: "  Jane Doe ",
      primaryContactEmail: " ops@acme.com ",
      primaryContactPhone: " 555-0100 ",
      summary: "  Hosting and maintenance client.  ",
      lifecycle: "ACTIVE",
    }),
  );

  assert.deepEqual(result.errors, {});
  assert.deepEqual(result.values, {
    name: "Acme Co",
    legalName: "Acme Company LLC",
    primaryContactName: "Jane Doe",
    primaryContactEmail: "ops@acme.com",
    primaryContactPhone: "555-0100",
    summary: "Hosting and maintenance client.",
    lifecycle: "ACTIVE",
  });
});

test("relationship form requires a name", () => {
  for (const name of ["", "   "]) {
    const result = parseRelationshipForm(formData({ ...VALID_BASE, name }));
    assert.equal(result.errors.name, "Name is required.", `name ${JSON.stringify(name)}`);
  }

  const withBlob = new FormData();
  withBlob.set("name", new Blob(["Acme Co"]));
  withBlob.set("lifecycle", "LEAD");
  const blobResult = parseRelationshipForm(withBlob);
  assert.equal(blobResult.values.name, "");
  assert.equal(blobResult.errors.name, "Name is required.");
});

test("relationship form enforces inclusive length ceilings per field", () => {
  const cases = [
    { field: "name", max: 120, message: "Keep the name under 120 characters." },
    { field: "legalName", max: 200, message: "Keep the legal name under 200 characters." },
    {
      field: "primaryContactName",
      max: 120,
      message: "Keep the contact name under 120 characters.",
    },
    {
      field: "primaryContactPhone",
      max: 40,
      message: "Keep the phone number under 40 characters.",
    },
    { field: "summary", max: 2000, message: "Keep the summary under 2000 characters." },
  ] as const;

  for (const { field, max, message } of cases) {
    const atLimit = parseRelationshipForm(
      formData({ ...VALID_BASE, [field]: "x".repeat(max) }),
    );
    assert.deepEqual(atLimit.errors, {}, `${field} at ${max}`);

    const overLimit = parseRelationshipForm(
      formData({ ...VALID_BASE, [field]: "x".repeat(max + 1) }),
    );
    assert.deepEqual(overLimit.errors, { [field]: message }, `${field} at ${max + 1}`);
  }
});

test("relationship form measures length after trimming", () => {
  const result = parseRelationshipForm(
    formData({ ...VALID_BASE, name: `   ${"n".repeat(120)}   ` }),
  );

  assert.deepEqual(result.errors, {});
  assert.equal(result.values.name, "n".repeat(120));
});

test("relationship form treats contact email as optional", () => {
  const result = parseRelationshipForm(
    formData({ ...VALID_BASE, primaryContactEmail: "" }),
  );

  assert.equal(result.errors.primaryContactEmail, undefined);
});

test("relationship form rejects malformed contact emails", () => {
  const result = parseRelationshipForm(
    formData({ ...VALID_BASE, primaryContactEmail: "not-an-email" }),
  );

  assert.equal(result.errors.primaryContactEmail, "Enter a valid email address.");
});

test("relationship form accepts a 254-character email and rejects 255", () => {
  const atLimit = "a".repeat(242) + "@example.com";
  assert.equal(atLimit.length, 254);
  const accepted = parseRelationshipForm(
    formData({ ...VALID_BASE, primaryContactEmail: atLimit }),
  );
  assert.deepEqual(accepted.errors, {});

  const validShapeTooLong = "a".repeat(243) + "@example.com";
  const invalidShapeTooLong = "a".repeat(255);
  for (const email of [validShapeTooLong, invalidShapeTooLong]) {
    assert.equal(email.length, 255);
    const rejected = parseRelationshipForm(
      formData({ ...VALID_BASE, primaryContactEmail: email }),
    );
    assert.equal(rejected.errors.primaryContactEmail, "That email address is too long.");
  }
});

test("relationship form falls back to LEAD on invalid lifecycle", () => {
  const submissions = [
    formData({ name: "Acme Co" }),
    formData({ name: "Acme Co", lifecycle: "BOGUS" }),
    formData({ name: "Acme Co", lifecycle: "active" }),
  ];

  for (const submission of submissions) {
    const result = parseRelationshipForm(submission);
    assert.equal(result.errors.lifecycle, "Pick a lifecycle state from the list.");
    assert.equal(result.values.lifecycle, "LEAD");
  }
});

test("relationship form accepts every lifecycle value", () => {
  assert.ok(LIFECYCLE_VALUES.length > 0);

  for (const lifecycle of LIFECYCLE_VALUES) {
    const result = parseRelationshipForm(formData({ name: "Acme Co", lifecycle }));
    assert.equal(result.errors.lifecycle, undefined, lifecycle);
    assert.equal(result.values.lifecycle, lifecycle);
  }
});

test("relationship form reports every invalid field in one call", () => {
  const result = parseRelationshipForm(
    formData({ name: "", primaryContactEmail: "bad", lifecycle: "BOGUS" }),
  );

  assert.deepEqual(result.errors, {
    name: "Name is required.",
    primaryContactEmail: "Enter a valid email address.",
    lifecycle: "Pick a lifecycle state from the list.",
  });
});

test("isValidEmail checks basic email shape", () => {
  assert.equal(isValidEmail("a@b.co"), true);

  for (const email of ["", "a@b", "@b.co", "a b@c.co", "a@@b.co"]) {
    assert.equal(isValidEmail(email), false, email);
  }
});

test("isLifecycleValue matches enum values exactly", () => {
  assert.equal(isLifecycleValue("LEAD"), true);
  assert.equal(isLifecycleValue("lead"), false);
  assert.equal(isLifecycleValue(""), false);
});

test("slugifyRelationshipName builds lowercase hyphenated slugs", () => {
  const cases: [string, string][] = [
    ["Acme Co.", "acme-co"],
    ["  --Hello, World!--  ", "hello-world"],
    ["ACME", "acme"],
    ["Café Déjà Vu", "cafe-deja-vu"],
    ["ﬁnance", "finance"],
  ];

  for (const [input, expected] of cases) {
    const slug = slugifyRelationshipName(input);
    assert.equal(slug, expected, input);
    assert.match(slug, SLUG_PATTERN);
  }
});

test("slugifyRelationshipName falls back when nothing usable remains", () => {
  for (const input of ["", "!!!", "日本"]) {
    const slug = slugifyRelationshipName(input);
    assert.equal(slug, "relationship", input);
    assert.match(slug, SLUG_PATTERN);
  }
});

test("slugifyRelationshipName caps length without a trailing hyphen", () => {
  assert.equal(SLUG_MAX_LENGTH, 64);

  const long = slugifyRelationshipName("a".repeat(100));
  assert.equal(long, "a".repeat(64));
  assert.match(long, SLUG_PATTERN);

  const slicedAtHyphen = slugifyRelationshipName("a".repeat(63) + " b");
  assert.equal(slicedAtHyphen, "a".repeat(63));
  assert.match(slicedAtHyphen, SLUG_PATTERN);
});
