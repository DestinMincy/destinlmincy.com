import type {
  ApplicationSiteFieldName,
  ApplicationSiteFormValues,
  ApplicationSiteType,
  ProjectFieldName,
  ProjectFormValues,
  ProjectStatus,
} from "./types";
import {
  APPLICATION_SITE_TYPE_VALUES,
  PROJECT_STATUS_VALUES,
} from "./types";

const NAME_MAX_LENGTH = 120;
const URL_MAX_LENGTH = 2048;
const NOTES_MAX_LENGTH = 4000;
const DESCRIPTION_MAX_LENGTH = 2000;
const RECORD_ID_MAX_LENGTH = 128;
const DATE_INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function readField(formData: FormData, field: string): string {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function isApplicationSiteType(value: string): value is ApplicationSiteType {
  return (APPLICATION_SITE_TYPE_VALUES as string[]).includes(value);
}

function isProjectStatus(value: string): value is ProjectStatus {
  return (PROJECT_STATUS_VALUES as string[]).includes(value);
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isDateInput(value: string): boolean {
  if (!DATE_INPUT_PATTERN.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function dateInputToDate(value: string): Date | null {
  return value && isDateInput(value)
    ? new Date(`${value}T00:00:00.000Z`)
    : null;
}

function validateOptionalUrl(
  value: string,
  field: ApplicationSiteFieldName,
  label: string,
  errors: Partial<Record<ApplicationSiteFieldName, string>>,
) {
  if (!value) {
    return;
  }

  if (value.length > URL_MAX_LENGTH) {
    errors[field] = `Keep the ${label} under ${URL_MAX_LENGTH} characters.`;
  } else if (!isHttpUrl(value)) {
    errors[field] = `Enter a valid http or https ${label}.`;
  }
}

export function parseApplicationSiteForm(formData: FormData): {
  values: ApplicationSiteFormValues;
  errors: Partial<Record<ApplicationSiteFieldName, string>>;
} {
  const rawType = readField(formData, "type");
  const values: ApplicationSiteFormValues = {
    name: readField(formData, "name"),
    type: isApplicationSiteType(rawType) ? rawType : "WEBSITE",
    productionUrl: readField(formData, "productionUrl"),
    stagingUrl: readField(formData, "stagingUrl"),
    repositoryUrl: readField(formData, "repositoryUrl"),
    notes: readField(formData, "notes"),
  };
  const errors: Partial<Record<ApplicationSiteFieldName, string>> = {};

  if (!values.name) {
    errors.name = "Name is required.";
  } else if (values.name.length > NAME_MAX_LENGTH) {
    errors.name = `Keep the name under ${NAME_MAX_LENGTH} characters.`;
  }

  if (!isApplicationSiteType(rawType)) {
    errors.type = "Pick an application or site type from the list.";
  }

  validateOptionalUrl(
    values.productionUrl,
    "productionUrl",
    "production URL",
    errors,
  );
  validateOptionalUrl(
    values.stagingUrl,
    "stagingUrl",
    "staging URL",
    errors,
  );
  validateOptionalUrl(
    values.repositoryUrl,
    "repositoryUrl",
    "repository URL",
    errors,
  );

  if (values.notes.length > NOTES_MAX_LENGTH) {
    errors.notes = `Keep notes under ${NOTES_MAX_LENGTH} characters.`;
  }

  return { values, errors };
}

export function parseProjectForm(
  formData: FormData,
  options: { allowCreatedAssetAttachment?: boolean } = {},
): {
  values: ProjectFormValues;
  errors: Partial<Record<ProjectFieldName, string>>;
} {
  const rawStatus = readField(formData, "status");
  const values: ProjectFormValues = {
    name: readField(formData, "name"),
    status: isProjectStatus(rawStatus) ? rawStatus : "PLANNED",
    applicationSiteId: readField(formData, "applicationSiteId"),
    createsNewAsset: formData.get("createsNewAsset") === "on",
    summary: readField(formData, "summary"),
    clientDescription: readField(formData, "clientDescription"),
    startsAt: readField(formData, "startsAt"),
    targetDate: readField(formData, "targetDate"),
  };
  const errors: Partial<Record<ProjectFieldName, string>> = {};

  if (!values.name) {
    errors.name = "Name is required.";
  } else if (values.name.length > NAME_MAX_LENGTH) {
    errors.name = `Keep the name under ${NAME_MAX_LENGTH} characters.`;
  }

  if (!isProjectStatus(rawStatus)) {
    errors.status = "Pick a project status from the list.";
  }

  if (values.applicationSiteId.length > RECORD_ID_MAX_LENGTH) {
    errors.applicationSiteId = "That application or site selection is invalid.";
  }

  if (
    values.createsNewAsset &&
    values.applicationSiteId &&
    !options.allowCreatedAssetAttachment
  ) {
    errors.applicationSiteId =
      "A new-asset project cannot attach to an existing application or site yet.";
    errors.createsNewAsset =
      "Clear the existing application or site before selecting this option.";
  }

  if (values.summary.length > DESCRIPTION_MAX_LENGTH) {
    errors.summary = `Keep the internal summary under ${DESCRIPTION_MAX_LENGTH} characters.`;
  }

  if (values.clientDescription.length > DESCRIPTION_MAX_LENGTH) {
    errors.clientDescription = `Keep the client description under ${DESCRIPTION_MAX_LENGTH} characters.`;
  }

  if (values.startsAt && !isDateInput(values.startsAt)) {
    errors.startsAt = "Enter a valid start date.";
  }

  if (values.targetDate && !isDateInput(values.targetDate)) {
    errors.targetDate = "Enter a valid target date.";
  }

  if (
    !errors.startsAt &&
    !errors.targetDate &&
    values.startsAt &&
    values.targetDate &&
    values.targetDate < values.startsAt
  ) {
    errors.targetDate = "Target date cannot be before the start date.";
  }

  return { values, errors };
}
