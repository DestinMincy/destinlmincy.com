"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAdminUser } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db/client";
import {
  SubscriptionReferenceStatus,
  type SubscriptionServiceType,
} from "@/lib/generated/prisma/enums";

function subPath(clientRelationshipId: string) {
  return `/admin/relationships/${clientRelationshipId}/subscriptions`;
}

export interface SubscriptionFormState {
  status: "idle" | "error";
  errors: {
    serviceType?: string;
    status?: string;
    currentPeriodEndsAt?: string;
  };
  formError?: string;
}

const VALID_SERVICE_TYPES = ["HOSTING", "MAINTENANCE"];
const VALID_STATUSES = Object.values(SubscriptionReferenceStatus);

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
  const statusRaw = String(
    formData.get("status") ?? "ACTIVE",
  ).trim();
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

  if (!VALID_SERVICE_TYPES.includes(serviceType)) {
    return {
      status: "error",
      errors: { serviceType: "Service type is required." },
    };
  }

  if (!VALID_STATUSES.includes(statusRaw as SubscriptionReferenceStatus)) {
    return {
      status: "error",
      errors: { status: "Invalid subscription status." },
    };
  }
  const status = statusRaw as SubscriptionReferenceStatus;

  let currentPeriodEndsAt: Date | null = null;
  if (periodEndsAtRaw) {
    const parsed = new Date(periodEndsAtRaw);
    if (isNaN(parsed.getTime())) {
      return {
        status: "error",
        errors: { currentPeriodEndsAt: "Invalid date for period end." },
      };
    }
    currentPeriodEndsAt = parsed;
  }

  const relationship = await prisma.clientRelationship.findUnique({
    where: { id: clientRelationshipId },
    select: { id: true },
  });
  if (!relationship) {
    return {
      status: "error",
      errors: {},
      formError: "That relationship no longer exists.",
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

  const statusRaw = String(
    formData.get("status") ?? "ACTIVE",
  ).trim();
  const clerkSubscriptionId =
    String(formData.get("clerkSubscriptionId") ?? "").trim() || null;
  const entitlementKey =
    String(formData.get("entitlementKey") ?? "").trim() || null;
  const periodEndsAtRaw =
    String(formData.get("currentPeriodEndsAt") ?? "").trim();

  if (!VALID_STATUSES.includes(statusRaw as SubscriptionReferenceStatus)) {
    return {
      status: "error",
      errors: { status: "Invalid subscription status." },
    };
  }
  const status = statusRaw as SubscriptionReferenceStatus;

  let currentPeriodEndsAt: Date | null = null;
  if (periodEndsAtRaw) {
    const parsed = new Date(periodEndsAtRaw);
    if (isNaN(parsed.getTime())) {
      return {
        status: "error",
        errors: { currentPeriodEndsAt: "Invalid date for period end." },
      };
    }
    currentPeriodEndsAt = parsed;
  }

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
