import type {
  ClientRelationshipLifecycle,
  RelationshipFieldName,
  RelationshipFormValues,
} from "./types";
import { LIFECYCLE_VALUES } from "./types";

/** Field length ceilings enforced at the form boundary. */
const FIELD_MAX_LENGTHS = {
  name: 120,
  legalName: 200,
  primaryContactName: 120,
  primaryContactEmail: 254,
  primaryContactPhone: 40,
  summary: 2000,
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COMBINING_MARKS_PATTERN = /[\u0300-\u036f]/g;

function readField(formData: FormData, field: string): string {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

export function isValidEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email);
}

export function isLifecycleValue(
  value: string,
): value is ClientRelationshipLifecycle {
  return (LIFECYCLE_VALUES as string[]).includes(value);
}

export interface ParsedRelationshipForm {
  values: RelationshipFormValues;
  errors: Partial<Record<RelationshipFieldName, string>>;
}

/**
 * Validates a client relationship create/edit submission at the boundary.
 * Returns trimmed values plus per-field errors; callers must not persist
 * anything when `errors` has entries.
 */
export function parseRelationshipForm(
  formData: FormData,
): ParsedRelationshipForm {
  const rawLifecycle = readField(formData, "lifecycle");

  const values: RelationshipFormValues = {
    name: readField(formData, "name"),
    legalName: readField(formData, "legalName"),
    primaryContactName: readField(formData, "primaryContactName"),
    primaryContactEmail: readField(formData, "primaryContactEmail"),
    primaryContactPhone: readField(formData, "primaryContactPhone"),
    summary: readField(formData, "summary"),
    lifecycle: isLifecycleValue(rawLifecycle) ? rawLifecycle : "LEAD",
  };

  const errors: Partial<Record<RelationshipFieldName, string>> = {};

  if (!values.name) {
    errors.name = "Name is required.";
  } else if (values.name.length > FIELD_MAX_LENGTHS.name) {
    errors.name = `Keep the name under ${FIELD_MAX_LENGTHS.name} characters.`;
  }

  if (values.legalName.length > FIELD_MAX_LENGTHS.legalName) {
    errors.legalName = `Keep the legal name under ${FIELD_MAX_LENGTHS.legalName} characters.`;
  }

  if (values.primaryContactName.length > FIELD_MAX_LENGTHS.primaryContactName) {
    errors.primaryContactName = `Keep the contact name under ${FIELD_MAX_LENGTHS.primaryContactName} characters.`;
  }

  if (values.primaryContactEmail) {
    if (values.primaryContactEmail.length > FIELD_MAX_LENGTHS.primaryContactEmail) {
      errors.primaryContactEmail = "That email address is too long.";
    } else if (!isValidEmail(values.primaryContactEmail)) {
      errors.primaryContactEmail = "Enter a valid email address.";
    }
  }

  if (values.primaryContactPhone.length > FIELD_MAX_LENGTHS.primaryContactPhone) {
    errors.primaryContactPhone = `Keep the phone number under ${FIELD_MAX_LENGTHS.primaryContactPhone} characters.`;
  }

  if (values.summary.length > FIELD_MAX_LENGTHS.summary) {
    errors.summary = `Keep the summary under ${FIELD_MAX_LENGTHS.summary} characters.`;
  }

  if (!isLifecycleValue(rawLifecycle)) {
    errors.lifecycle = "Pick a lifecycle state from the list.";
  }

  return { values, errors };
}

const SLUG_MAX_LENGTH = 64;

/**
 * Derives a URL-safe slug candidate from a relationship name.
 * Uniqueness is enforced by the caller against existing rows.
 */
export function slugifyRelationshipName(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(COMBINING_MARKS_PATTERN, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/-+$/, "");

  return slug || "relationship";
}
