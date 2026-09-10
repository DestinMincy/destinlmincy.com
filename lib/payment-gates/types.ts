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

export const PAYMENT_GATE_STATUS_TONE: Record<
  PaymentGateStatus,
  "signal" | "success" | "muted" | "accent" | "neutral"
> = {
  PENDING: "signal",
  ATTACHED: "accent",
  PAID: "success",
  WAIVED: "muted",
};

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
