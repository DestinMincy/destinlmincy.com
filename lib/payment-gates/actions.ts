"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAdminUser } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db/client";
import type {
  PaymentGateFormState,
  PaymentGateStatus,
  PaymentGateType,
} from "@/lib/payment-gates/types";
import {
  PAYMENT_GATE_STATUS_VALUES,
  PAYMENT_GATE_TYPE_VALUES,
} from "@/lib/payment-gates/types";

const NOT_AUTHORIZED = "You are not authorized to do that.";
const SAVE_ERROR = "Something went wrong while saving. Try again.";

function paymentGatesPath(clientRelationshipId: string): string {
  return `/admin/relationships/${clientRelationshipId}/payment-gates`;
}

function parsePaymentGateForm(formData: FormData): {
  values: import("@/lib/payment-gates/types").PaymentGateFormValues;
  errors: Partial<
    Record<"label" | "projectId" | "status" | "paymentType" | "amount", string>
  >;
} {
  const label = String(formData.get("label") ?? "").trim();
  const projectId = String(formData.get("projectId") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "PENDING");
  const paymentTypeRaw = String(
    formData.get("paymentType") ?? "FULL_UPFRONT",
  );
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const currency = String(formData.get("currency") ?? "USD").trim() || "USD";
  const dueDate = String(formData.get("dueDate") ?? "").trim();
  const requiredBeforeWork = formData.get("requiredBeforeWork") === "true";
  const stripeUrl = String(formData.get("stripeUrl") ?? "").trim();
  const stripeId = String(formData.get("stripeId") ?? "").trim();

  const errors: Partial<
    Record<"label" | "projectId" | "status" | "paymentType" | "amount", string>
  > = {};

  if (!label) errors.label = "Label is required.";
  if (label.length > 200)
    errors.label = "Label must be 200 characters or fewer.";

  if (amountRaw) {
    const parsed = parseFloat(amountRaw);
    if (isNaN(parsed) || parsed < 0)
      errors.amount = "Amount must be a positive number.";
  }

  const status = PAYMENT_GATE_STATUS_VALUES.includes(
    statusRaw as PaymentGateStatus,
  )
    ? (statusRaw as PaymentGateStatus)
    : "PENDING";

  const paymentType = PAYMENT_GATE_TYPE_VALUES.includes(
    paymentTypeRaw as PaymentGateType,
  )
    ? (paymentTypeRaw as PaymentGateType)
    : "FULL_UPFRONT";

  return {
    values: {
      label,
      projectId,
      status,
      paymentType,
      amount: amountRaw,
      currency,
      dueDate,
      requiredBeforeWork,
      stripeUrl,
      stripeId,
    },
    errors,
  };
}

export async function createPaymentGateAction(
  clientRelationshipId: string,
  _prevState: PaymentGateFormState,
  formData: FormData,
): Promise<PaymentGateFormState> {
  const admin = await getAdminUser();
  const { values, errors } = parsePaymentGateForm(formData);

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

    await prisma.paymentGate.create({
      data: {
        clientRelationshipId,
        label: values.label,
        status: values.status,
        paymentType: values.paymentType,
        projectId: values.projectId || null,
        amount: values.amount ? parseFloat(values.amount) : null,
        currency: values.currency,
        dueDate:
          values.dueDate ? new Date(values.dueDate + "T00:00:00Z") : null,
        requiredBeforeWork: values.requiredBeforeWork,
        stripeUrl: values.stripeUrl || null,
        stripeId: values.stripeId || null,
      },
      select: { id: true },
    });
  } catch (error: unknown) {
    console.error("Failed to create payment gate", error);
    return { status: "error", values, errors: {}, formError: SAVE_ERROR };
  }

  revalidatePath(paymentGatesPath(clientRelationshipId));
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

  const statusRaw = String(formData.get("status") ?? "");
  if (!PAYMENT_GATE_STATUS_VALUES.includes(statusRaw as PaymentGateStatus)) {
    return { status: "error", error: "Invalid status value." };
  }

  try {
    const result = await prisma.paymentGate.updateMany({
      where: { id: paymentGateId, clientRelationshipId },
      data: { status: statusRaw as PaymentGateStatus },
    });
    if (result.count === 0) {
      return { status: "error", error: "Payment gate not found." };
    }
  } catch (error: unknown) {
    console.error("Failed to update payment gate status", error);
    return { status: "error", error: SAVE_ERROR };
  }

  revalidatePath(paymentGatesPath(clientRelationshipId));
  return { status: "idle" };
}
