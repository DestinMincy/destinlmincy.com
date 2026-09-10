import type { MilestoneStatus } from "@/lib/generated/prisma/enums";
import { MilestoneStatus as Status } from "@/lib/generated/prisma/enums";

export type { MilestoneStatus };

export const MILESTONE_STATUS_VALUES: MilestoneStatus[] = Object.values(Status);

export const MILESTONE_STATUS_LABELS: Record<MilestoneStatus, string> = {
  PLANNED: "Planned",
  IN_PROGRESS: "In progress",
  BLOCKED: "Blocked",
  COMPLETE: "Complete",
};

export const MILESTONE_STATUS_TONE: Record<
  MilestoneStatus,
  "signal" | "success" | "muted" | "accent" | "neutral"
> = {
  PLANNED: "neutral",
  IN_PROGRESS: "signal",
  BLOCKED: "muted",
  COMPLETE: "success",
};

export interface MilestoneFormValues {
  title: string;
  status: MilestoneStatus;
  targetDate: string;
}

export type MilestoneFieldName = keyof MilestoneFormValues;

export interface MilestoneFormState {
  status: "idle" | "error";
  values: MilestoneFormValues;
  errors: Partial<Record<MilestoneFieldName, string>>;
  formError?: string;
}

export const EMPTY_MILESTONE_FORM_VALUES: MilestoneFormValues = {
  title: "",
  status: "PLANNED",
  targetDate: "",
} as const;

export interface DeliverableFormValues {
  label: string;
  url: string;
}

export type DeliverableFieldName = keyof DeliverableFormValues;

export interface DeliverableFormState {
  status: "idle" | "error";
  values: DeliverableFormValues;
  errors: Partial<Record<DeliverableFieldName, string>>;
  formError?: string;
}

export const EMPTY_DELIVERABLE_FORM_VALUES: DeliverableFormValues = {
  label: "",
  url: "",
} as const;
