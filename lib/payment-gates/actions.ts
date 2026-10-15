"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAdminUser } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db/client";
import type {
  PaymentGateFieldName,
  PaymentGateFormState,
  PaymentGateFormValues,
  PaymentGateStatus,
  PaymentGateType,
} from "@/lib/payment-gates/types";
import {
  PAYMENT_GATE_STATUS_VALUES,
  PAYMENT_GATE_TYPE_VALUES,
} from "@/lib/payment-gates/types";

const NOT_AUTHORIZED = "You are not authorized to do that.";
const SAVE_ERROR = "Something went wrong while saving. Try again.";
const MAX_LABEL_LENGTH = 200;
const MAX_STRIPE_ID_LENGTH = 255;
const MAX_STRIPE_URL_LENGTH = 2048;
/** Matches the Decimal(12, 2) column: ten integer digits, two fractional. */
const MAX_AMOUNT = 9_999_999_999.99;

type FieldErrors = Partial<Record<PaymentGateFieldName, string>>;

function paymentGatesPath(clientRelationshipId: string): string {
  return `/admin/relationships/${clientRelationshipId}/payment-gates`;
}

function revalidatePaymentGates(
  clientRelationshipId: string,
  projectIds: Array<string | null | undefined>,
): void {
  revalidatePath(paymentGatesPath(clientRelationshipId));
  revalidatePath(`/admin/relationships/${clientRelationshipId}`);
  for (const projectId of new Set(projectIds)) {
    if (projectId) {
      revalidatePath(
        `/admin/relationships/${clientRelationshipId}/projects/${projectId}`,
      );
    }
  }
  revalidatePath("/portal");
  revalidatePath("/portal/payments");
}

function readString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function isPaymentGateStatus(value: string): value is PaymentGateStatus {
  return (PAYMENT_GATE_STATUS_VALUES as string[]).includes(value);
}

function isPaymentGateType(value: string): value is PaymentGateType {
  return (PAYMENT_GATE_TYPE_VALUES as string[]).includes(value);
}

function isValidDateInput(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
}

function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

interface ParsedPaymentGateForm {
  values: PaymentGateFormValues;
  errors: FieldErrors;
}

/**
 * Validates a payment gate form at the boundary. Every field that has a
 * problem gets its own message so the form can show them inline.
 */
async function parsePaymentGateForm(
  formData: FormData,
): Promise<ParsedPaymentGateForm> {
  const label = readString(formData, "label");
  const projectId = readString(formData, "projectId");
  const statusRaw = readString(formData, "status") || "PENDING";
  const paymentTypeRaw = readString(formData, "paymentType") || "FULL_UPFRONT";
  const amount = readString(formData, "amount");
  const currency = (readString(formData, "currency") || "USD").toUpperCase();
  const dueDate = readString(formData, "dueDate");
  const requiredBeforeWorkRaw = formData.get("requiredBeforeWork");
  const requiredBeforeWork =
    requiredBeforeWorkRaw === "true" ||
    requiredBeforeWorkRaw === "on" ||
    requiredBeforeWorkRaw === "1";
  const stripeUrl = readString(formData, "stripeUrl");
  const stripeId = readString(formData, "stripeId");

  const errors: FieldErrors = {};

  if (!label) {
    errors.label = "Label is required.";
  } else if (label.length > MAX_LABEL_LENGTH) {
    errors.label = `Label must be ${MAX_LABEL_LENGTH} characters or fewer.`;
  }

  if (!isPaymentGateStatus(statusRaw)) {
    errors.status = "Pick a status from the list.";
  }

  if (!isPaymentGateType(paymentTypeRaw)) {
    errors.paymentType = "Pick a payment type from the list.";
  }

  if (amount) {
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed < 0) {
      errors.amount = "Amount must be zero or a positive number.";
    } else if (parsed > MAX_AMOUNT) {
      errors.amount = "Amount is too large.";
    } else if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
      errors.amount = "Amount can have at most two decimal places.";
    }
  }

  if (!/^[A-Z]{3}$/.test(currency)) {
    errors.currency = "Currency must be a three-letter code like USD.";
  }

  if (dueDate && !isValidDateInput(dueDate)) {
    errors.dueDate = "Enter the due date as YYYY-MM-DD.";
  }

  if (stripeUrl) {
    if (stripeUrl.length > MAX_STRIPE_URL_LENGTH) {
      errors.stripeUrl = "Stripe URL is too long.";
    } else if (!isHttpsUrl(stripeUrl)) {
      errors.stripeUrl = "Stripe URL must start with https://.";
    }
  }

  if (stripeId.length > MAX_STRIPE_ID_LENGTH) {
    errors.stripeId = `Stripe ID must be ${MAX_STRIPE_ID_LENGTH} characters or fewer.`;
  }

  if (statusRaw === "ATTACHED" && !stripeUrl && !errors.stripeUrl) {
    errors.stripeUrl =
      "Add the Stripe invoice or payment link URL before marking this attached.";
  }

  return {
    values: {
      label,
      projectId,
      status: isPaymentGateStatus(statusRaw) ? statusRaw : "PENDING",
      paymentType: isPaymentGateType(paymentTypeRaw)
        ? paymentTypeRaw
        : "FULL_UPFRONT",
      amount,
      currency,
      dueDate,
      requiredBeforeWork,
      stripeUrl,
      stripeId,
    },
    errors,
  };
}

/**
 * A gate may only attach to a project in the same relationship. Archived
 * projects are not selectable unless the gate is already attached to one.
 */
async function projectIsSelectable(
  clientRelationshipId: string,
  projectId: string,
  currentProjectId?: string | null,
): Promise<boolean> {
  if (!projectId) return true;

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      clientRelationshipId,
      ...(currentProjectId === projectId ? {} : { status: { not: "ARCHIVED" } }),
    },
    select: { id: true },
  });

  return Boolean(project);
}

function toPersistedData(values: PaymentGateFormValues) {
  return {
    label: values.label,
    status: values.status,
    paymentType: values.paymentType,
    projectId: values.projectId || null,
    amount: values.amount ? values.amount : null,
    currency: values.currency,
    dueDate: values.dueDate ? new Date(`${values.dueDate}T00:00:00Z`) : null,
    requiredBeforeWork: values.requiredBeforeWork,
    stripeUrl: values.stripeUrl || null,
    stripeId: values.stripeId || null,
  };
}

export async function createPaymentGateAction(
  clientRelationshipId: string,
  _prevState: PaymentGateFormState,
  formData: FormData,
): Promise<PaymentGateFormState> {
  const admin = await getAdminUser();
  const { values, errors } = await parsePaymentGateForm(formData);

  if (!admin) {
    return { status: "error", values, errors: {}, formError: NOT_AUTHORIZED };
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", values, errors };
  }

  try {
    const relationship = await prisma.clientRelationship.findUnique({
      where: { id: clientRelationshipId },
      select: { id: true },
    });
    if (!relationship) {
      return {
        status: "error",
        values,
        errors: {},
        formError: "That relationship no longer exists.",
      };
    }

    if (!(await projectIsSelectable(clientRelationshipId, values.projectId))) {
      return {
        status: "error",
        values,
        errors: { projectId: "Pick an active project from this relationship." },
      };
    }

    await prisma.paymentGate.create({
      data: { clientRelationshipId, ...toPersistedData(values) },
      select: { id: true },
    });
  } catch (error: unknown) {
    console.error("Failed to create payment gate", error);
    return { status: "error", values, errors: {}, formError: SAVE_ERROR };
  }

  revalidatePaymentGates(clientRelationshipId, [values.projectId]);
  redirect(paymentGatesPath(clientRelationshipId));
}

export async function updatePaymentGateAction(
  clientRelationshipId: string,
  paymentGateId: string,
  _prevState: PaymentGateFormState,
  formData: FormData,
): Promise<PaymentGateFormState> {
  const admin = await getAdminUser();
  const { values, errors } = await parsePaymentGateForm(formData);

  if (!admin) {
    return { status: "error", values, errors: {}, formError: NOT_AUTHORIZED };
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", values, errors };
  }

  let previousProjectId: string | null = null;

  try {
    const existing = await prisma.paymentGate.findFirst({
      where: { id: paymentGateId, clientRelationshipId },
      select: { id: true, projectId: true },
    });
    if (!existing) {
      return {
        status: "error",
        values,
        errors: {},
        formError: "That payment gate no longer exists.",
      };
    }
    previousProjectId = existing.projectId;

    if (
      !(await projectIsSelectable(
        clientRelationshipId,
        values.projectId,
        existing.projectId,
      ))
    ) {
      return {
        status: "error",
        values,
        errors: { projectId: "Pick an active project from this relationship." },
      };
    }

    const result = await prisma.paymentGate.updateMany({
      where: { id: paymentGateId, clientRelationshipId },
      data: toPersistedData(values),
    });
    if (result.count === 0) {
      return {
        status: "error",
        values,
        errors: {},
        formError: "That payment gate no longer exists.",
      };
    }
  } catch (error: unknown) {
    console.error("Failed to update payment gate", error);
    return { status: "error", values, errors: {}, formError: SAVE_ERROR };
  }

  revalidatePaymentGates(clientRelationshipId, [
    previousProjectId,
    values.projectId,
  ]);
  redirect(paymentGatesPath(clientRelationshipId));
}

export interface UpdatePaymentGateStatusState {
  status: "idle" | "error";
  error?: string;
}

export async function updatePaymentGateStatusAction(
  clientRelationshipId: string,
  paymentGateId: string,
  _prevState: UpdatePaymentGateStatusState,
  formData: FormData,
): Promise<UpdatePaymentGateStatusState> {
  const admin = await getAdminUser();
  if (!admin) return { status: "error", error: NOT_AUTHORIZED };

  const statusRaw = readString(formData, "status");
  if (!isPaymentGateStatus(statusRaw)) {
    return { status: "error", error: "Invalid status value." };
  }

  let projectId: string | null = null;

  try {
    const existing = await prisma.paymentGate.findFirst({
      where: { id: paymentGateId, clientRelationshipId },
      select: { projectId: true, stripeUrl: true },
    });
    if (!existing) {
      return { status: "error", error: "Payment gate not found." };
    }
    projectId = existing.projectId;

    if (statusRaw === "ATTACHED" && !existing.stripeUrl) {
      return {
        status: "error",
        error: "Add a Stripe URL before marking this gate attached.",
      };
    }

    const result = await prisma.paymentGate.updateMany({
      where: { id: paymentGateId, clientRelationshipId },
      data: { status: statusRaw },
    });
    if (result.count === 0) {
      return { status: "error", error: "Payment gate not found." };
    }
  } catch (error: unknown) {
    console.error("Failed to update payment gate status", error);
    return { status: "error", error: SAVE_ERROR };
  }

  revalidatePaymentGates(clientRelationshipId, [projectId]);
  return { status: "idle" };
}
