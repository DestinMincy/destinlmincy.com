"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAdminUser } from "@/lib/auth/require-admin";
import {
  createProjectForRelationship,
  updateProjectForRelationship,
} from "@/lib/client-work/project-writes";
import { dateInputToDate, parseApplicationSiteForm, parseProjectForm } from "@/lib/client-work/validation";
import { prisma } from "@/lib/db/client";
import type {
  ApplicationSiteFormState,
  ArchiveActionState,
  ProjectFormState,
} from "@/lib/client-work/types";

const NOT_AUTHORIZED = "You are not authorized to do that.";
const SAVE_ERROR = "Something went wrong while saving. Try again.";

function relationshipPath(clientRelationshipId: string): string {
  return `/admin/relationships/${clientRelationshipId}`;
}

function applicationSitesPath(clientRelationshipId: string): string {
  return `${relationshipPath(clientRelationshipId)}/applications`;
}

function projectsPath(clientRelationshipId: string): string {
  return `${relationshipPath(clientRelationshipId)}/projects`;
}

function revalidateClientWork(clientRelationshipId: string) {
  revalidatePath(relationshipPath(clientRelationshipId));
  revalidatePath(applicationSitesPath(clientRelationshipId));
  revalidatePath(projectsPath(clientRelationshipId));
  revalidatePath("/portal");
}

async function relationshipExists(clientRelationshipId: string) {
  return prisma.clientRelationship.findUnique({
    where: { id: clientRelationshipId },
    select: { id: true },
  });
}

export async function createApplicationSiteAction(
  clientRelationshipId: string,
  _prevState: ApplicationSiteFormState,
  formData: FormData,
): Promise<ApplicationSiteFormState> {
  const admin = await getAdminUser();
  const { values, errors } = parseApplicationSiteForm(formData);

  if (!admin) {
    return { status: "error", values, errors: {}, formError: NOT_AUTHORIZED };
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", values, errors };
  }

  try {
    if (!(await relationshipExists(clientRelationshipId))) {
      return {
        status: "error",
        values,
        errors: {},
        formError: "That relationship no longer exists.",
      };
    }

    await prisma.applicationSite.create({
      data: {
        clientRelationshipId,
        name: values.name,
        type: values.type,
        productionUrl: values.productionUrl || null,
        stagingUrl: values.stagingUrl || null,
        repositoryUrl: values.repositoryUrl || null,
        notes: values.notes || null,
      },
      select: { id: true },
    });
  } catch (error: unknown) {
    console.error("Failed to create application/site", error);
    return { status: "error", values, errors: {}, formError: SAVE_ERROR };
  }

  revalidateClientWork(clientRelationshipId);
  redirect(applicationSitesPath(clientRelationshipId));
}

export async function updateApplicationSiteAction(
  clientRelationshipId: string,
  applicationSiteId: string,
  _prevState: ApplicationSiteFormState,
  formData: FormData,
): Promise<ApplicationSiteFormState> {
  const admin = await getAdminUser();
  const { values, errors } = parseApplicationSiteForm(formData);

  if (!admin) {
    return { status: "error", values, errors: {}, formError: NOT_AUTHORIZED };
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", values, errors };
  }

  try {
    const result = await prisma.applicationSite.updateMany({
      where: { id: applicationSiteId, clientRelationshipId },
      data: {
        name: values.name,
        type: values.type,
        productionUrl: values.productionUrl || null,
        stagingUrl: values.stagingUrl || null,
        repositoryUrl: values.repositoryUrl || null,
        notes: values.notes || null,
      },
    });

    if (result.count === 0) {
      return {
        status: "error",
        values,
        errors: {},
        formError: "That application or site no longer exists.",
      };
    }
  } catch (error: unknown) {
    console.error("Failed to update application/site", error);
    return { status: "error", values, errors: {}, formError: SAVE_ERROR };
  }

  revalidateClientWork(clientRelationshipId);
  redirect(applicationSitesPath(clientRelationshipId));
}

export async function archiveApplicationSiteAction(
  clientRelationshipId: string,
  applicationSiteId: string,
  _prevState: ArchiveActionState,
  _formData: FormData,
): Promise<ArchiveActionState> {
  if (!(await getAdminUser())) {
    return { status: "error", error: NOT_AUTHORIZED };
  }

  try {
    const result = await prisma.applicationSite.updateMany({
      where: {
        id: applicationSiteId,
        clientRelationshipId,
        status: "ACTIVE",
      },
      data: { status: "ARCHIVED" },
    });

    if (result.count === 0) {
      return {
        status: "error",
        error: "That application or site was already archived or does not exist.",
      };
    }
  } catch (error: unknown) {
    console.error("Failed to archive application/site", error);
    return { status: "error", error: SAVE_ERROR };
  }

  revalidateClientWork(clientRelationshipId);
  return { status: "idle" };
}

export async function createProjectAction(
  clientRelationshipId: string,
  _prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const admin = await getAdminUser();
  const { values, errors } = parseProjectForm(formData);

  if (!admin) {
    return { status: "error", values, errors: {}, formError: NOT_AUTHORIZED };
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", values, errors };
  }

  try {
    const result = await createProjectForRelationship(clientRelationshipId, {
      applicationSiteId: values.applicationSiteId,
      name: values.name,
      status: values.status,
      summary: values.summary || null,
      clientDescription: values.clientDescription || null,
      createsNewAsset: values.createsNewAsset,
      startsAt: dateInputToDate(values.startsAt),
      targetDate: dateInputToDate(values.targetDate),
    });

    if (result === "relationship-missing") {
      return {
        status: "error",
        values,
        errors: {},
        formError: "That relationship no longer exists.",
      };
    }

    if (result === "invalid-asset-selection") {
      return {
        status: "error",
        values,
        errors: {
          applicationSiteId:
            "A new-asset project cannot attach to an existing application or site yet.",
          createsNewAsset:
            "Clear the existing application or site before selecting this option.",
        },
      };
    }

    if (result === "application-not-selectable") {
      return {
        status: "error",
        values,
        errors: {
          applicationSiteId:
            "Pick an active application or site from this relationship.",
        },
      };
    }
  } catch (error: unknown) {
    console.error("Failed to create project", error);
    return { status: "error", values, errors: {}, formError: SAVE_ERROR };
  }

  revalidateClientWork(clientRelationshipId);
  redirect(projectsPath(clientRelationshipId));
}

export async function updateProjectAction(
  clientRelationshipId: string,
  projectId: string,
  _prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const admin = await getAdminUser();
  const { values, errors } = parseProjectForm(formData, {
    allowCreatedAssetAttachment: true,
  });

  if (!admin) {
    return { status: "error", values, errors: {}, formError: NOT_AUTHORIZED };
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", values, errors };
  }

  try {
    const result = await updateProjectForRelationship(
      clientRelationshipId,
      projectId,
      {
        applicationSiteId: values.applicationSiteId,
        name: values.name,
        status: values.status,
        summary: values.summary || null,
        clientDescription: values.clientDescription || null,
        createsNewAsset: values.createsNewAsset,
        startsAt: dateInputToDate(values.startsAt),
        targetDate: dateInputToDate(values.targetDate),
      },
    );

    if (result === "project-missing") {
      return {
        status: "error",
        values,
        errors: {},
        formError: "That project no longer exists.",
      };
    }

    if (result === "application-not-selectable") {
      return {
        status: "error",
        values,
        errors: {
          applicationSiteId:
            "Pick an active application or site from this relationship.",
        },
      };
    }
  } catch (error: unknown) {
    console.error("Failed to update project", error);
    return { status: "error", values, errors: {}, formError: SAVE_ERROR };
  }

  revalidateClientWork(clientRelationshipId);
  redirect(projectsPath(clientRelationshipId));
}

export async function archiveProjectAction(
  clientRelationshipId: string,
  projectId: string,
  _prevState: ArchiveActionState,
  _formData: FormData,
): Promise<ArchiveActionState> {
  if (!(await getAdminUser())) {
    return { status: "error", error: NOT_AUTHORIZED };
  }

  try {
    const result = await prisma.project.updateMany({
      where: {
        id: projectId,
        clientRelationshipId,
        status: { not: "ARCHIVED" },
      },
      data: { status: "ARCHIVED" },
    });

    if (result.count === 0) {
      return {
        status: "error",
        error: "That project was already archived or does not exist.",
      };
    }
  } catch (error: unknown) {
    console.error("Failed to archive project", error);
    return { status: "error", error: SAVE_ERROR };
  }

  revalidateClientWork(clientRelationshipId);
  return { status: "idle" };
}
