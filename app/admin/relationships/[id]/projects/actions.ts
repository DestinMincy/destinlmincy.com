"use server";

import { revalidatePath } from "next/cache";

import { getAdminUser } from "@/lib/auth/require-admin";
import {
  archiveProject,
  createProject,
  updateProject,
} from "@/lib/projects/queries";

const NOT_AUTHORIZED = "You are not authorized to do that.";
const MAX_NAME_LENGTH = 200;

function projectsPath(relationshipId: string): string {
  return `/admin/relationships/${relationshipId}/projects`;
}

export interface ProjectActionFormState {
  status: "idle" | "error";
  errors: Partial<Record<"name", string>>;
  formError?: string;
}

export interface SimpleActionState {
  status: "idle" | "error";
  error?: string;
}

export async function createProjectAction(
  relationshipId: string,
  _prevState: ProjectActionFormState,
  formData: FormData,
): Promise<ProjectActionFormState> {
  const admin = await getAdminUser();
  if (!admin) {
    return { status: "error", errors: {}, formError: NOT_AUTHORIZED };
  }

  const rawName = formData.get("name");
  const name = typeof rawName === "string" ? rawName.trim() : "";

  const errors: ProjectActionFormState["errors"] = {};
  if (!name) {
    errors.name = "Name is required.";
  } else if (name.length > MAX_NAME_LENGTH) {
    errors.name = `Name must be ${MAX_NAME_LENGTH} characters or fewer.`;
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", errors };
  }

  try {
    const applicationSiteId = formData.get("applicationSiteId");
    const summary = formData.get("summary");
    const clientFacingDescription = formData.get("clientFacingDescription");
    const startDate = formData.get("startDate");
    const targetDate = formData.get("targetDate");

    await createProject({
      clientRelationshipId: relationshipId,
      name,
      applicationSiteId: typeof applicationSiteId === "string" ? applicationSiteId.trim() || null : null,
      summary: typeof summary === "string" ? summary.trim() || null : null,
      clientFacingDescription:
        typeof clientFacingDescription === "string"
          ? clientFacingDescription.trim() || null
          : null,
      startDate:
        typeof startDate === "string" && startDate.trim()
          ? new Date(startDate.trim())
          : null,
      targetDate:
        typeof targetDate === "string" && targetDate.trim()
          ? new Date(targetDate.trim())
          : null,
    });
  } catch (error: unknown) {
    console.error("Failed to create project", error);
    return {
      status: "error",
      errors: {},
      formError: "Something went wrong while saving. Try again.",
    };
  }

  revalidatePath(projectsPath(relationshipId));
  return { status: "idle", errors: {} };
}

export async function updateProjectAction(
  id: string,
  relationshipId: string,
  _prevState: ProjectActionFormState,
  formData: FormData,
): Promise<ProjectActionFormState> {
  const admin = await getAdminUser();
  if (!admin) {
    return { status: "error", errors: {}, formError: NOT_AUTHORIZED };
  }

  const rawName = formData.get("name");
  const name = typeof rawName === "string" ? rawName.trim() : "";

  const errors: ProjectActionFormState["errors"] = {};
  if (!name) {
    errors.name = "Name is required.";
  } else if (name.length > MAX_NAME_LENGTH) {
    errors.name = `Name must be ${MAX_NAME_LENGTH} characters or fewer.`;
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", errors };
  }

  try {
    const applicationSiteId = formData.get("applicationSiteId");
    const summary = formData.get("summary");
    const clientFacingDescription = formData.get("clientFacingDescription");
    const startDate = formData.get("startDate");
    const targetDate = formData.get("targetDate");

    await updateProject(id, relationshipId, {
      name,
      applicationSiteId: typeof applicationSiteId === "string" ? applicationSiteId.trim() || null : undefined,
      summary: typeof summary === "string" ? summary.trim() || null : undefined,
      clientFacingDescription:
        typeof clientFacingDescription === "string"
          ? clientFacingDescription.trim() || null
          : undefined,
      startDate:
        typeof startDate === "string" && startDate.trim()
          ? new Date(startDate.trim())
          : null,
      targetDate:
        typeof targetDate === "string" && targetDate.trim()
          ? new Date(targetDate.trim())
          : null,
    });
  } catch (error: unknown) {
    console.error("Failed to update project", error);
    return {
      status: "error",
      errors: {},
      formError: "Something went wrong while saving. Try again.",
    };
  }

  revalidatePath(projectsPath(relationshipId));
  return { status: "idle", errors: {} };
}

export async function archiveProjectAction(
  id: string,
  relationshipId: string,
): Promise<SimpleActionState> {
  const admin = await getAdminUser();
  if (!admin) {
    return { status: "error", error: NOT_AUTHORIZED };
  }

  try {
    const result = await archiveProject(id, relationshipId);
    if (result.count === 0) {
      return { status: "error", error: "That project was not found or is already archived." };
    }
  } catch (error: unknown) {
    console.error("Failed to archive project", error);
    return { status: "error", error: "Something went wrong. Try again." };
  }

  revalidatePath(projectsPath(relationshipId));
  return { status: "idle" };
}
