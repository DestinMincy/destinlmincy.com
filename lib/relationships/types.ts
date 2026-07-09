import type {
  ClientRelationshipLifecycle,
  ClientUserStatus,
} from "@/lib/generated/prisma/enums";
import { ClientRelationshipLifecycle as Lifecycle } from "@/lib/generated/prisma/enums";

export type { ClientRelationshipLifecycle, ClientUserStatus };

/** Lifecycle values in the order they naturally progress. */
export const LIFECYCLE_VALUES: ClientRelationshipLifecycle[] = Object.values(Lifecycle);

/** Human-readable labels for each lifecycle state, used in badges and selects. */
export const LIFECYCLE_LABELS: Record<ClientRelationshipLifecycle, string> = {
  LEAD: "Lead",
  DISCOVERY: "Discovery",
  PROPOSAL: "Proposal",
  CONTRACTED: "Contracted",
  AWAITING_PAYMENT: "Awaiting payment",
  ACTIVE: "Active",
  PAUSED: "Paused",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
};

/**
 * Semantic status-dot tone per lifecycle state. Maps to CSS custom
 * properties only (no hardcoded colors), matching the token system.
 */
export const LIFECYCLE_TONE: Record<ClientRelationshipLifecycle, "neutral" | "signal" | "success" | "muted" | "accent"> = {
  LEAD: "neutral",
  DISCOVERY: "neutral",
  PROPOSAL: "neutral",
  CONTRACTED: "signal",
  AWAITING_PAYMENT: "signal",
  ACTIVE: "success",
  PAUSED: "muted",
  COMPLETED: "accent",
  ARCHIVED: "muted",
};

export interface RelationshipFormValues {
  name: string;
  legalName: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  summary: string;
  lifecycle: ClientRelationshipLifecycle;
}

export const EMPTY_RELATIONSHIP_FORM_VALUES: RelationshipFormValues = {
  name: "",
  legalName: "",
  primaryContactName: "",
  primaryContactEmail: "",
  primaryContactPhone: "",
  summary: "",
  lifecycle: "LEAD",
};

export type RelationshipFieldName = keyof RelationshipFormValues;

export interface RelationshipFormState {
  status: "idle" | "error";
  values: RelationshipFormValues;
  errors: Partial<Record<RelationshipFieldName, string>>;
  formError?: string;
}

export const IDLE_RELATIONSHIP_FORM_STATE: RelationshipFormState = {
  status: "idle",
  values: EMPTY_RELATIONSHIP_FORM_VALUES,
  errors: {},
};

export interface AttachClientUserFormState {
  status: "idle" | "error";
  email: string;
  errors: {
    email?: string;
  };
  formError?: string;
}

export const IDLE_ATTACH_CLIENT_USER_STATE: AttachClientUserFormState = {
  status: "idle",
  email: "",
  errors: {},
};

/** Minimal state for single-purpose actions (lifecycle update, removal). */
export interface SimpleActionState {
  status: "idle" | "error";
  error?: string;
}

export const IDLE_SIMPLE_ACTION_STATE: SimpleActionState = {
  status: "idle",
};
