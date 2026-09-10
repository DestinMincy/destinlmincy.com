import type { PaymentGateStatus } from "@/lib/generated/prisma/enums";
import { PaymentGateStatus as GateStatus } from "@/lib/generated/prisma/enums";

export type { PaymentGateStatus };

export const PAYMENT_GATE_STATUS_VALUES: PaymentGateStatus[] =
  Object.values(GateStatus);

export const PAYMENT_GATE_STATUS_LABELS: Record<PaymentGateStatus, string> = {
  PENDING: "Pending",
  ATTACHED: "Attached",
  PAID: "Paid",
  WAIVED: "Waived",
};

export const PAYMENT_GATE_STATUS_TONE: Record<
  PaymentGateStatus,
  "signal" | "success" | "muted" | "accent" | "neutral"
> = {
  PENDING: "signal",
  ATTACHED: "accent",
  PAID: "success",
  WAIVED: "muted",
};

/** Payment type labels used in the form. Stored as a plain string until the
 * schema migration adds a `paymentType` enum column. */
export const PAYMENT_TYPE_OPTIONS = [
  { value: "full_upfront", label: "Full upfront" },
  { value: "deposit", label: "Deposit" },
  { value: "milestone_payment", label: "Milestone payment" },
  { value: "other", label: "Other" },
] as const;

export interface PaymentGateFormValues {
  label: string;
  projectId: string;
  status: PaymentGateStatus;
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
} as const;
