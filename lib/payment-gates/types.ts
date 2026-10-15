import type { PaymentGateStatus, PaymentGateType } from "@/lib/generated/prisma/enums";
import {
  PaymentGateStatus as GateStatus,
  PaymentGateType as GateType,
} from "@/lib/generated/prisma/enums";

export type { PaymentGateStatus, PaymentGateType };

export const PAYMENT_GATE_STATUS_VALUES: PaymentGateStatus[] =
  Object.values(GateStatus);

export const PAYMENT_GATE_STATUS_LABELS: Record<PaymentGateStatus, string> = {
  PENDING: "Pending",
  ATTACHED: "Attached",
  PAID: "Paid",
  WAIVED: "Waived",
};

export type StatusTone = "signal" | "success" | "muted" | "accent" | "neutral";

export const PAYMENT_GATE_STATUS_TONE: Record<PaymentGateStatus, StatusTone> = {
  PENDING: "signal",
  ATTACHED: "accent",
  PAID: "success",
  WAIVED: "muted",
};

/**
 * Statuses that satisfy a payment gate. A gate marked `requiredBeforeWork`
 * blocks its project from starting until it reaches one of these.
 */
export const PAYMENT_GATE_SATISFIED_STATUSES: readonly PaymentGateStatus[] = [
  "PAID",
  "WAIVED",
];

export function isPaymentGateSatisfied(status: PaymentGateStatus): boolean {
  return PAYMENT_GATE_SATISFIED_STATUSES.includes(status);
}

/**
 * Overdue is derived, not stored: an unsatisfied gate whose due date has
 * passed. Stored status stays PENDING or ATTACHED so admin can still see
 * whether a Stripe link was ever attached.
 */
export function isPaymentGateOverdue(
  gate: { status: PaymentGateStatus; dueDate: Date | null },
  now: Date = new Date(),
): boolean {
  if (isPaymentGateSatisfied(gate.status)) return false;
  if (!gate.dueDate) return false;
  return gate.dueDate.getTime() < now.getTime();
}

export const PAYMENT_GATE_TYPE_VALUES: PaymentGateType[] =
  Object.values(GateType);

export const PAYMENT_GATE_TYPE_LABELS: Record<PaymentGateType, string> = {
  FULL_UPFRONT: "Full upfront",
  DEPOSIT: "Deposit",
  MILESTONE_PAYMENT: "Milestone payment",
  OTHER: "Other",
};

export interface PaymentGateFormValues {
  label: string;
  projectId: string;
  status: PaymentGateStatus;
  paymentType: PaymentGateType;
  amount: string;
  currency: string;
  dueDate: string;
  requiredBeforeWork: boolean;
  stripeUrl: string;
  stripeId: string;
}

export type PaymentGateFieldName = keyof PaymentGateFormValues;

export interface PaymentGateFormState {
  status: "idle" | "error";
  values: PaymentGateFormValues;
  errors: Partial<Record<PaymentGateFieldName, string>>;
  formError?: string;
}

export const EMPTY_PAYMENT_GATE_FORM_VALUES: PaymentGateFormValues = {
  label: "",
  projectId: "",
  status: "PENDING",
  paymentType: "FULL_UPFRONT",
  amount: "",
  currency: "USD",
  dueDate: "",
  requiredBeforeWork: false,
  stripeUrl: "",
  stripeId: "",
} as const;

/** Formats a stored Decimal/number amount for display, e.g. "$1,500.00". */
export function formatPaymentGateAmount(
  amount: { toString(): string } | number | string | null,
  currency: string,
): string | null {
  if (amount === null || amount === undefined) return null;
  const numeric = Number(amount.toString());
  if (!Number.isFinite(numeric)) return null;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(numeric);
  } catch {
    return `${numeric.toFixed(2)} ${currency}`;
  }
}
