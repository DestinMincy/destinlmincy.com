"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAdminUser } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db/client";
import type {
  DeliverableFormState,
  MilestoneFormState,
  MilestoneStatus,
} from "@/lib/milestones/types";
import { MILESTONE_STATUS_VALUES } from "@/lib/milestones/types";

const NOT_AUTHORIZED = "You are not authorized to do that.";
const SAVE_ERROR = "Something went wrong while saving. Try again.";

function milestonesPath(
  clientRelationshipId: string,
  projectId: string,
): string {
  return `/admin/relationships/${clientRelationshipId}/projects/${projectId}/milestones`;
}

function deliverablesPath(
  clientRelationshipId: string,
  projectId: string,
): string {
  return `/admin/relationships/${clientRelationshipId}/projects/${projectId}`;
}

function parseMilestoneForm(formData: FormData): {
  values: import("@/lib/milestones/types").MilestoneFormValues;
  errors: Partial<Record<"title" | "status" | "targetDate", string>>;
} {
  const title = String(formData.get("title") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "PLANNED");
  const targetDate = String(formData.get("targetDate") ?? "").trim();
  const clientFacingUpdate = String(
    formData.get("clientFacingUpdate") ?? "",
  ).trim();
  const paymentDependencyId = String(
    formData.get("paymentDependencyId") ?? "",
  ).trim();
  const approvalRequired = formData.get("approvalRequired") === "true";

  const errors: Partial<Record<"title" | "status" | "targetDate", string>> =
    {};

  if (!title) errors.title = "Title is required.";
  if (title.length > 200)
    errors.title = "Title must be 200 characters or fewer.";

  const status = MILESTONE_STATUS_VALUES.includes(statusRaw as MilestoneStatus)
    ? (statusRaw as MilestoneStatus)
    : "PLANNED";

  return {
    values: {
      title,
      status,
      targetDate,
      clientFacingUpdate,
      paymentDependencyId,
      approvalRequired,
    },
    errors,
  };
}

export async function createMilestoneAction(
  clientRelationshipId: string,
  projectId: string,
  _prevState: MilestoneFormState,
  formData: FormData,
): Promise<MilestoneFormState> {
  const admin = await getAdminUser();
  const { values, errors } = parseMilestoneForm(formData);

  if (!admin) {
    return { status: "error", values, errors: {}, formError: NOT_AUTHORIZED };
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", values, errors };
  }

  try {
    const project = await prisma.project.findFirst({
      where: { id: projectId, clientRelationshipId },
      select: { id: true },
    });
    if (!project) {
      return {
        status: "error",
        values,
        errors: {},
        formError: "That project no longer exists.",
      };
    }

    await prisma.milestone.create({
      data: {
        clientRelationshipId,
        projectId,
        title: values.title,
        status: values.status,
        targetDate: values.targetDate
          ? new Date(values.targetDate + "T00:00:00Z")
          : null,
        clientFacingUpdate: values.clientFacingUpdate || null,
        paymentDependencyId: values.paymentDependencyId || null,
        approvalRequired: values.approvalRequired,
      },
      select: { id: true },
    });
  } catch (error: unknown) {
    console.error("Failed to create milestone", error);
    return { status: "error", values, errors: {}, formError: SAVE_ERROR };
  }

  revalidatePath(milestonesPath(clientRelationshipId, projectId));
  redirect(milestonesPath(clientRelationshipId, projectId));
}

export async function updateMilestoneAction(
  milestoneId: string,
  clientRelationshipId: string,
  projectId: string,
  _prevState: MilestoneFormState,
  formData: FormData,
): Promise<MilestoneFormState> {
  const admin = await getAdminUser();
  const { values, errors } = parseMilestoneForm(formData);

  if (!admin) {
    return { status: "error", values, errors: {}, formError: NOT_AUTHORIZED };
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", values, errors };
  }

  try {
    const result = await prisma.milestone.updateMany({
      where: { id: milestoneId, clientRelationshipId },
      data: {
        title: values.title,
        status: values.status,
        targetDate: values.targetDate
          ? new Date(values.targetDate + "T00:00:00Z")
          : null,
        clientFacingUpdate: values.clientFacingUpdate || null,
        paymentDependencyId: values.paymentDependencyId || null,
        approvalRequired: values.approvalRequired,
      },
    });

    if (result.count === 0) {
      return {
        status: "error",
        values,
        errors: {},
        formError: "That milestone no longer exists.",
      };
    }
  } catch (error: unknown) {
    console.error("Failed to update milestone", error);
    return { status: "error", values, errors: {}, formError: SAVE_ERROR };
  }

  revalidatePath(milestonesPath(clientRelationshipId, projectId));
  redirect(milestonesPath(clientRelationshipId, projectId));
}

export async function createDeliverableAction(
  clientRelationshipId: string,
  projectId: string,
  milestoneId: string | null,
  _prevState: DeliverableFormState,
  formData: FormData,
): Promise<DeliverableFormState> {
  const admin = await getAdminUser();
  const label = String(formData.get("label") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();

  const errors: Partial<Record<"label" | "url", string>> = {};
  if (!label) errors.label = "Label is required.";
  if (label.length > 200)
    errors.label = "Label must be 200 characters or fewer.";

  if (!admin) {
    return {
      status: "error",
      values: { label, url },
      errors: {},
      formError: NOT_AUTHORIZED,
    };
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", values: { label, url }, errors };
  }

  try {
    await prisma.deliverable.create({
      data: {
        clientRelationshipId,
        projectId,
        milestoneId: milestoneId || null,
        label,
        url: url || null,
      },
      select: { id: true },
    });
  } catch (error: unknown) {
    console.error("Failed to create deliverable", error);
    return {
      status: "error",
      values: { label, url },
      errors: {},
      formError: SAVE_ERROR,
    };
  }

  revalidatePath(deliverablesPath(clientRelationshipId, projectId));
  redirect(deliverablesPath(clientRelationshipId, projectId));
}
