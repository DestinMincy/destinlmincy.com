"use server";

import { revalidatePath } from "next/cache";

import { getAdminUser } from "@/lib/auth/require-admin";
import {
  createDeliverable,
  createMilestone,
  updateDeliverable,
  updateMilestone,
} from "@/lib/milestones/queries";

const NOT_AUTHORIZED = "You are not authorized to do that.";
const MAX_TITLE_LENGTH = 200;
const MAX_LABEL_LENGTH = 200;

function milestonesPath(relationshipId: string): string {
  return `/admin/relationships/${relationshipId}/milestones`;
}

export interface MilestoneFormState {
  status: "idle" | "error";
  errors: Partial<Record<"title", string>>;
  formError?: string;
}

export interface DeliverableFormState {
  status: "idle" | "error";
  errors: Partial<Record<"label" | "url", string>>;
  formError?: string;
}

export interface SimpleActionState {
  status: "idle" | "error";
  error?: string;
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function createMilestoneAction(
  relationshipId: string,
  projectId: string,
  _prevState: MilestoneFormState,
  formData: FormData,
): Promise<MilestoneFormState> {
  const admin = await getAdminUser();
  if (!admin) {
    return { status: "error", errors: {}, formError: NOT_AUTHORIZED };
  }

  const rawTitle = formData.get("title");
  const title = typeof rawTitle === "string" ? rawTitle.trim() : "";

  const errors: MilestoneFormState["errors"] = {};
  if (!title) {
    errors.title = "Title is required.";
  } else if (title.length > MAX_TITLE_LENGTH) {
    errors.title = `Title must be ${MAX_TITLE_LENGTH} characters or fewer.`;
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", errors };
  }

  try {
    const targetDate = formData.get("targetDate");
    const clientFacingUpdate = formData.get("clientFacingUpdate");
    const paymentDependencyId = formData.get("paymentDependencyId");
    const approvalRequired = formData.get("approvalRequired");

    await createMilestone({
      clientRelationshipId: relationshipId,
      projectId,
      title,
      targetDate:
        typeof targetDate === "string" && targetDate.trim()
          ? new Date(targetDate.trim())
          : null,
      clientFacingUpdate:
        typeof clientFacingUpdate === "string"
          ? clientFacingUpdate.trim() || null
          : null,
      paymentDependencyId:
        typeof paymentDependencyId === "string"
          ? paymentDependencyId.trim() || null
          : null,
      approvalRequired:
        approvalRequired === "true" || approvalRequired === "1",
    });
  } catch (error: unknown) {
    console.error("Failed to create milestone", error);
    return {
      status: "error",
      errors: {},
      formError: "Something went wrong while saving. Try again.",
    };
  }

  revalidatePath(milestonesPath(relationshipId));
  return { status: "idle", errors: {} };
}

export async function updateMilestoneAction(
  id: string,
  relationshipId: string,
  _prevState: MilestoneFormState,
  formData: FormData,
): Promise<MilestoneFormState> {
  const admin = await getAdminUser();
  if (!admin) {
    return { status: "error", errors: {}, formError: NOT_AUTHORIZED };
  }

  const rawTitle = formData.get("title");
  const title = typeof rawTitle === "string" ? rawTitle.trim() : "";

  const errors: MilestoneFormState["errors"] = {};
  if (!title) {
    errors.title = "Title is required.";
  } else if (title.length > MAX_TITLE_LENGTH) {
    errors.title = `Title must be ${MAX_TITLE_LENGTH} characters or fewer.`;
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", errors };
  }

  try {
    const targetDate = formData.get("targetDate");
    const clientFacingUpdate = formData.get("clientFacingUpdate");
    const paymentDependencyId = formData.get("paymentDependencyId");
    const approvalRequired = formData.get("approvalRequired");

    await updateMilestone(id, relationshipId, {
      title,
      targetDate:
        typeof targetDate === "string" && targetDate.trim()
          ? new Date(targetDate.trim())
          : null,
      clientFacingUpdate:
        typeof clientFacingUpdate === "string"
          ? clientFacingUpdate.trim() || null
          : undefined,
      paymentDependencyId:
        typeof paymentDependencyId === "string"
          ? paymentDependencyId.trim() || null
          : undefined,
      approvalRequired:
        approvalRequired !== null
          ? approvalRequired === "true" || approvalRequired === "1"
          : undefined,
    });
  } catch (error: unknown) {
    console.error("Failed to update milestone", error);
    return {
      status: "error",
      errors: {},
      formError: "Something went wrong while saving. Try again.",
    };
  }

  revalidatePath(milestonesPath(relationshipId));
  return { status: "idle", errors: {} };
}

export async function createDeliverableAction(
  relationshipId: string,
  _prevState: DeliverableFormState,
  formData: FormData,
): Promise<DeliverableFormState> {
  const admin = await getAdminUser();
  if (!admin) {
    return { status: "error", errors: {}, formError: NOT_AUTHORIZED };
  }

  const rawLabel = formData.get("label");
  const rawUrl = formData.get("url");

  const label = typeof rawLabel === "string" ? rawLabel.trim() : "";
  const url = typeof rawUrl === "string" ? rawUrl.trim() : "";

  const errors: DeliverableFormState["errors"] = {};

  if (!label) {
    errors.label = "Label is required.";
  } else if (label.length > MAX_LABEL_LENGTH) {
    errors.label = `Label must be ${MAX_LABEL_LENGTH} characters or fewer.`;
  }

  if (url && !isValidUrl(url)) {
    errors.url = "Enter a valid URL (must start with http:// or https://).";
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", errors };
  }

  try {
    const projectId = formData.get("projectId");
    const milestoneId = formData.get("milestoneId");
    const notes = formData.get("notes");
    const visibility = formData.get("visibility");

    await createDeliverable({
      clientRelationshipId: relationshipId,
      label,
      url: url || null,
      projectId: typeof projectId === "string" ? projectId.trim() || null : null,
      milestoneId: typeof milestoneId === "string" ? milestoneId.trim() || null : null,
      notes: typeof notes === "string" ? notes.trim() || null : null,
      visibility:
        visibility === "ADMIN_ONLY" ? "ADMIN_ONLY" : "CLIENT",
    });
  } catch (error: unknown) {
    console.error("Failed to create deliverable", error);
    return {
      status: "error",
      errors: {},
      formError: "Something went wrong while saving. Try again.",
    };
  }

  revalidatePath(milestonesPath(relationshipId));
  return { status: "idle", errors: {} };
}

export async function updateDeliverableAction(
  id: string,
  relationshipId: string,
  _prevState: DeliverableFormState,
  formData: FormData,
): Promise<DeliverableFormState> {
  const admin = await getAdminUser();
  if (!admin) {
    return { status: "error", errors: {}, formError: NOT_AUTHORIZED };
  }

  const rawLabel = formData.get("label");
  const rawUrl = formData.get("url");

  const label = typeof rawLabel === "string" ? rawLabel.trim() : "";
  const url = typeof rawUrl === "string" ? rawUrl.trim() : "";

  const errors: DeliverableFormState["errors"] = {};

  if (!label) {
    errors.label = "Label is required.";
  } else if (label.length > MAX_LABEL_LENGTH) {
    errors.label = `Label must be ${MAX_LABEL_LENGTH} characters or fewer.`;
  }

  if (url && !isValidUrl(url)) {
    errors.url = "Enter a valid URL (must start with http:// or https://).";
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", errors };
  }

  try {
    const notes = formData.get("notes");
    const visibility = formData.get("visibility");

    await updateDeliverable(id, relationshipId, {
      label,
      url: url || null,
      notes: typeof notes === "string" ? notes.trim() || null : undefined,
      visibility:
        visibility === "ADMIN_ONLY"
          ? "ADMIN_ONLY"
          : visibility === "CLIENT"
            ? "CLIENT"
            : undefined,
    });
  } catch (error: unknown) {
    console.error("Failed to update deliverable", error);
    return {
      status: "error",
      errors: {},
      formError: "Something went wrong while saving. Try again.",
    };
  }

  revalidatePath(milestonesPath(relationshipId));
  return { status: "idle", errors: {} };
}
