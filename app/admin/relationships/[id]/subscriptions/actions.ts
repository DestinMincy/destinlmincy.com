"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAdminUser } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db/client";
import type {
  SubscriptionReferenceStatus,
  SubscriptionServiceType,
} from "@/lib/generated/prisma/enums";

function subPath(clientRelationshipId: string) {
  return `/admin/relationships/${clientRelationshipId}/subscriptions`;
}

export interface SubscriptionFormState {
  status: "idle" | "error";
  errors: {
    serviceType?: string;
    status?: string;
  };
  formError?: string;
}

export async function createSubscriptionAction(
  clientRelationshipId: string,
  _prevState: SubscriptionFormState,
  formData: FormData,
): Promise<SubscriptionFormState> {
  const admin = await getAdminUser();
  if (!admin) {
    return { status: "error", errors: {}, formError: "Not authorized." };
  }

  const serviceType = String(
    formData.get("serviceType") ?? "",
  ).trim() as SubscriptionServiceType;
  const status = String(
    formData.get("status") ?? "ACTIVE",
  ).trim() as SubscriptionReferenceStatus;
  const clerkSubscriptionId =
    String(formData.get("clerkSubscriptionId") ?? "").trim() || null;
  const entitlementKey =
    String(formData.get("entitlementKey") ?? "").trim() || null;
  const applicationSiteId =
    String(formData.get("applicationSiteId") ?? "").trim() || null;
  const projectId =
    String(formData.get("projectId") ?? "").trim() || null;
  const periodEndsAtRaw =
    String(formData.get("currentPeriodEndsAt") ?? "").trim();
  const currentPeriodEndsAt = periodEndsAtRaw
    ? new Date(periodEndsAtRaw)
    : null;
  const validServiceTypes = ["HOSTING", "MAINTENANCE"];
  if (!validServiceTypes.includes(serviceType)) {
    return {
      status: "error",
      errors: { serviceType: "Service type is required." },
    };
  }

  try {
    await prisma.subscriptionReference.create({
      data: {
        clientRelationshipId,
        serviceType,
        status,
        clerkSubscriptionId,
        entitlementKey,
        applicationSiteId,
        projectId,
        currentPeriodEndsAt,
      },
    });
  } catch (error: unknown) {
    console.error("Failed to create subscription", error);
    return {
      status: "error",
      errors: {},
      formError: "Something went wrong. Try again.",
    };
  }

  revalidatePath(subPath(clientRelationshipId));
  redirect(subPath(clientRelationshipId));
}

export async function updateSubscriptionAction(
  clientRelationshipId: string,
  subscriptionId: string,
  _prevState: SubscriptionFormState,
  formData: FormData,
): Promise<SubscriptionFormState> {
  const admin = await getAdminUser();
  if (!admin) {
    return { status: "error", errors: {}, formError: "Not authorized." };
  }

  const status = String(
    formData.get("status") ?? "ACTIVE",
  ).trim() as SubscriptionReferenceStatus;
  const clerkSubscriptionId =
    String(formData.get("clerkSubscriptionId") ?? "").trim() || null;
  const entitlementKey =
    String(formData.get("entitlementKey") ?? "").trim() || null;
  const periodEndsAtRaw =
    String(formData.get("currentPeriodEndsAt") ?? "").trim();
  const currentPeriodEndsAt = periodEndsAtRaw
    ? new Date(periodEndsAtRaw)
    : null;
  try {
    const result = await prisma.subscriptionReference.updateMany({
      where: { id: subscriptionId, clientRelationshipId },
      data: {
        status,
        clerkSubscriptionId,
        entitlementKey,
        currentPeriodEndsAt,
      },
    });

    if (result.count === 0) {
      return {
        status: "error",
        errors: {},
        formError: "Subscription not found.",
      };
    }
  } catch (error: unknown) {
    console.error("Failed to update subscription", error);
    return {
      status: "error",
      errors: {},
      formError: "Something went wrong. Try again.",
    };
  }

  revalidatePath(subPath(clientRelationshipId));
  redirect(subPath(clientRelationshipId));
}
