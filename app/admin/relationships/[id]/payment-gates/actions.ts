"use server";

import { revalidatePath } from "next/cache";

import { getAdminUser } from "@/lib/auth/require-admin";
import {
  createPaymentGate,
  updatePaymentGate,
} from "@/lib/payments/queries";
import type { PaymentGateType } from "@/lib/generated/prisma/enums";

const NOT_AUTHORIZED = "You are not authorized to do that.";
const MAX_LABEL_LENGTH = 200;

const VALID_PAYMENT_TYPES = new Set<PaymentGateType>([
  "FULL_UPFRONT",
  "DEPOSIT",
  "MILESTONE_PAYMENT",
  "OTHER",
]);

function isValidPaymentGateType(value: string): value is PaymentGateType {
  return VALID_PAYMENT_TYPES.has(value as PaymentGateType);
}

function paymentGatesPath(relationshipId: string): string {
  return `/admin/relationships/${relationshipId}/payment-gates`;
}

export interface PaymentGateFormState {
  status: "idle" | "error";
  errors: Partial<Record<"label" | "amount" | "paymentType", string>>;
  formError?: string;
}

export interface SimpleActionState {
  status: "idle" | "error";
  error?: string;
}

export async function createPaymentGateAction(
  relationshipId: string,
  _prevState: PaymentGateFormState,
  formData: FormData,
): Promise<PaymentGateFormState> {
  const admin = await getAdminUser();
  if (!admin) {
    return { status: "error", errors: {}, formError: NOT_AUTHORIZED };
  }

  const rawLabel = formData.get("label");
  const rawAmount = formData.get("amount");
  const rawPaymentType = formData.get("paymentType");

  const label = typeof rawLabel === "string" ? rawLabel.trim() : "";
  const amountStr = typeof rawAmount === "string" ? rawAmount.trim() : "";
  const paymentType =
    typeof rawPaymentType === "string" ? rawPaymentType.trim() : "FULL_UPFRONT";

  const errors: PaymentGateFormState["errors"] = {};

  if (!label) {
    errors.label = "Label is required.";
  } else if (label.length > MAX_LABEL_LENGTH) {
    errors.label = `Label must be ${MAX_LABEL_LENGTH} characters or fewer.`;
  }

  let amount: string | null = null;
  if (amountStr) {
    const parsed = parseFloat(amountStr);
    if (isNaN(parsed) || parsed < 0) {
      errors.amount = "Amount must be a positive number.";
    } else {
      amount = parsed.toFixed(2);
    }
  }

  if (!isValidPaymentGateType(paymentType)) {
    errors.paymentType = "Select a valid payment type.";
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", errors };
  }

  try {
    const projectId = formData.get("projectId");
    const currency = formData.get("currency");
    const dueDate = formData.get("dueDate");
    const requiredBeforeWork = formData.get("requiredBeforeWork");
    const stripeUrl = formData.get("stripeUrl");
    const stripeId = formData.get("stripeId");

    await createPaymentGate({
      clientRelationshipId: relationshipId,
      label,
      paymentType: paymentType as PaymentGateType,
      amount,
      currency: typeof currency === "string" ? currency.trim() || "USD" : "USD",
      projectId: typeof projectId === "string" ? projectId.trim() || null : null,
      dueDate:
        typeof dueDate === "string" && dueDate.trim()
          ? new Date(dueDate.trim())
          : null,
      requiredBeforeWork: requiredBeforeWork === "true" || requiredBeforeWork === "1",
      stripeUrl: typeof stripeUrl === "string" ? stripeUrl.trim() || null : null,
      stripeId: typeof stripeId === "string" ? stripeId.trim() || null : null,
    });
  } catch (error: unknown) {
    console.error("Failed to create payment gate", error);
    return {
      status: "error",
      errors: {},
      formError: "Something went wrong while saving. Try again.",
    };
  }

  revalidatePath(paymentGatesPath(relationshipId));
  return { status: "idle", errors: {} };
}

export async function updatePaymentGateAction(
  id: string,
  relationshipId: string,
  _prevState: PaymentGateFormState,
  formData: FormData,
): Promise<PaymentGateFormState> {
  const admin = await getAdminUser();
  if (!admin) {
    return { status: "error", errors: {}, formError: NOT_AUTHORIZED };
  }

  const rawLabel = formData.get("label");
  const rawAmount = formData.get("amount");
  const rawPaymentType = formData.get("paymentType");

  const label = typeof rawLabel === "string" ? rawLabel.trim() : "";
  const amountStr = typeof rawAmount === "string" ? rawAmount.trim() : "";
  const paymentType =
    typeof rawPaymentType === "string" ? rawPaymentType.trim() : "";

  const errors: PaymentGateFormState["errors"] = {};

  if (!label) {
    errors.label = "Label is required.";
  } else if (label.length > MAX_LABEL_LENGTH) {
    errors.label = `Label must be ${MAX_LABEL_LENGTH} characters or fewer.`;
  }

  let amount: string | null | undefined;
  if (amountStr) {
    const parsed = parseFloat(amountStr);
    if (isNaN(parsed) || parsed < 0) {
      errors.amount = "Amount must be a positive number.";
    } else {
      amount = parsed.toFixed(2);
    }
  } else if (rawAmount !== null) {
    amount = null;
  }

  if (paymentType && !isValidPaymentGateType(paymentType)) {
    errors.paymentType = "Select a valid payment type.";
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", errors };
  }

  try {
    const projectId = formData.get("projectId");
    const currency = formData.get("currency");
    const dueDate = formData.get("dueDate");
    const requiredBeforeWork = formData.get("requiredBeforeWork");
    const stripeUrl = formData.get("stripeUrl");
    const stripeId = formData.get("stripeId");

    await updatePaymentGate(id, relationshipId, {
      label,
      ...(paymentType && isValidPaymentGateType(paymentType)
        ? { paymentType }
        : {}),
      ...(amount !== undefined ? { amount } : {}),
      currency: typeof currency === "string" ? currency.trim() || "USD" : undefined,
      projectId: typeof projectId === "string" ? projectId.trim() || null : undefined,
      dueDate:
        typeof dueDate === "string" && dueDate.trim()
          ? new Date(dueDate.trim())
          : null,
      requiredBeforeWork:
        requiredBeforeWork !== null
          ? requiredBeforeWork === "true" || requiredBeforeWork === "1"
          : undefined,
      stripeUrl: typeof stripeUrl === "string" ? stripeUrl.trim() || null : undefined,
      stripeId: typeof stripeId === "string" ? stripeId.trim() || null : undefined,
    });
  } catch (error: unknown) {
    console.error("Failed to update payment gate", error);
    return {
      status: "error",
      errors: {},
      formError: "Something went wrong while saving. Try again.",
    };
  }

  revalidatePath(paymentGatesPath(relationshipId));
  return { status: "idle", errors: {} };
}
