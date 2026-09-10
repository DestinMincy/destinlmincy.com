"use server";

import { revalidatePath } from "next/cache";

import { getAdminUser } from "@/lib/auth/require-admin";
import {
  archiveApplicationSite,
  createApplicationSite,
  updateApplicationSite,
} from "@/lib/applications/queries";
import type { ApplicationSiteType } from "@/lib/generated/prisma/enums";

const NOT_AUTHORIZED = "You are not authorized to do that.";
const MAX_NAME_LENGTH = 200;

const VALID_TYPES = new Set<ApplicationSiteType>([
  "WEBSITE",
  "WEB_APPLICATION",
  "INTERNAL_TOOL",
  "OTHER",
]);

function isValidApplicationSiteType(value: string): value is ApplicationSiteType {
  return VALID_TYPES.has(value as ApplicationSiteType);
}

function applicationsPath(relationshipId: string): string {
  return `/admin/relationships/${relationshipId}/applications`;
}

export interface ApplicationFormState {
  status: "idle" | "error";
  errors: Partial<Record<"name" | "type", string>>;
  formError?: string;
}

export async function createApplication(
  relationshipId: string,
  _prevState: ApplicationFormState,
  formData: FormData,
): Promise<ApplicationFormState> {
  const admin = await getAdminUser();
  if (!admin) {
    return { status: "error", errors: {}, formError: NOT_AUTHORIZED };
  }

  const rawName = formData.get("name");
  const rawType = formData.get("type");

  const name = typeof rawName === "string" ? rawName.trim() : "";
  const type = typeof rawType === "string" ? rawType.trim() : "WEBSITE";

  const errors: ApplicationFormState["errors"] = {};

  if (!name) {
    errors.name = "Name is required.";
  } else if (name.length > MAX_NAME_LENGTH) {
    errors.name = `Name must be ${MAX_NAME_LENGTH} characters or fewer.`;
  }

  if (!isValidApplicationSiteType(type)) {
    errors.type = "Select a valid type.";
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", errors };
  }

  let applicationId: string;

  try {
    const productionUrl = formData.get("productionUrl");
    const stagingUrl = formData.get("stagingUrl");
    const repositoryUrl = formData.get("repositoryUrl");
    const notes = formData.get("notes");

    const result = await createApplicationSite({
      clientRelationshipId: relationshipId,
      name,
      type: type as ApplicationSiteType,
      productionUrl: typeof productionUrl === "string" ? productionUrl.trim() || null : null,
      stagingUrl: typeof stagingUrl === "string" ? stagingUrl.trim() || null : null,
      repositoryUrl: typeof repositoryUrl === "string" ? repositoryUrl.trim() || null : null,
      notes: typeof notes === "string" ? notes.trim() || null : null,
    });

    applicationId = result.id;
  } catch (error: unknown) {
    console.error("Failed to create application site", error);
    return {
      status: "error",
      errors: {},
      formError: "Something went wrong while saving. Try again.",
    };
  }

  revalidatePath(applicationsPath(relationshipId));
  return { status: "idle", errors: {}, ...(applicationId ? { applicationId } : {}) };
}

export async function updateApplication(
  id: string,
  relationshipId: string,
  _prevState: ApplicationFormState,
  formData: FormData,
): Promise<ApplicationFormState> {
  const admin = await getAdminUser();
  if (!admin) {
    return { status: "error", errors: {}, formError: NOT_AUTHORIZED };
  }

  const rawName = formData.get("name");
  const rawType = formData.get("type");

  const name = typeof rawName === "string" ? rawName.trim() : "";
  const type = typeof rawType === "string" ? rawType.trim() : "";

  const errors: ApplicationFormState["errors"] = {};

  if (!name) {
    errors.name = "Name is required.";
  } else if (name.length > MAX_NAME_LENGTH) {
    errors.name = `Name must be ${MAX_NAME_LENGTH} characters or fewer.`;
  }

  if (type && !isValidApplicationSiteType(type)) {
    errors.type = "Select a valid type.";
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", errors };
  }

  try {
    const productionUrl = formData.get("productionUrl");
    const stagingUrl = formData.get("stagingUrl");
    const repositoryUrl = formData.get("repositoryUrl");
    const notes = formData.get("notes");

    await updateApplicationSite(id, relationshipId, {
      name,
      ...(type && isValidApplicationSiteType(type) ? { type } : {}),
      productionUrl: typeof productionUrl === "string" ? productionUrl.trim() || null : undefined,
      stagingUrl: typeof stagingUrl === "string" ? stagingUrl.trim() || null : undefined,
      repositoryUrl: typeof repositoryUrl === "string" ? repositoryUrl.trim() || null : undefined,
      notes: typeof notes === "string" ? notes.trim() || null : undefined,
    });
  } catch (error: unknown) {
    console.error("Failed to update application site", error);
    return {
      status: "error",
      errors: {},
      formError: "Something went wrong while saving. Try again.",
    };
  }

  revalidatePath(applicationsPath(relationshipId));
  return { status: "idle", errors: {} };
}

export interface SimpleActionState {
  status: "idle" | "error";
  error?: string;
}

export async function archiveApplication(
  id: string,
  relationshipId: string,
): Promise<SimpleActionState> {
  const admin = await getAdminUser();
  if (!admin) {
    return { status: "error", error: NOT_AUTHORIZED };
  }

  try {
    const result = await archiveApplicationSite(id, relationshipId);
    if (result.count === 0) {
      return { status: "error", error: "That application site was not found or is already archived." };
    }
  } catch (error: unknown) {
    console.error("Failed to archive application site", error);
    return { status: "error", error: "Something went wrong. Try again." };
  }

  revalidatePath(applicationsPath(relationshipId));
  return { status: "idle" };
}
