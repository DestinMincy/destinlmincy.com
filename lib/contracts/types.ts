import type { ContractTemplateStatus } from "@/lib/generated/prisma/enums";
import { ContractTemplateStatus as TemplateStatus } from "@/lib/generated/prisma/enums";

export type { ContractTemplateStatus };

export const CONTRACT_TEMPLATE_STATUS_VALUES: ContractTemplateStatus[] =
  Object.values(TemplateStatus);

export const CONTRACT_TEMPLATE_STATUS_LABELS: Record<
  ContractTemplateStatus,
  string
> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

export const CONTRACT_TEMPLATE_STATUS_TONE: Record<
  ContractTemplateStatus,
  "signal" | "success" | "muted" | "accent" | "neutral"
> = {
  DRAFT: "signal",
  PUBLISHED: "success",
  ARCHIVED: "muted",
};

/** Block types available in the v1 contract template editor. */
export type BlockType =
  | "heading"
  | "paragraph"
  | "clause"
  | "variable"
  | "signature";

export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  heading: "Heading",
  paragraph: "Paragraph",
  clause: "Clause",
  variable: "Variable",
  signature: "Signature placeholder",
};

export const BLOCK_TYPE_VALUES: BlockType[] = [
  "heading",
  "paragraph",
  "clause",
  "variable",
  "signature",
];

export interface TemplateBlock {
  id: string;
  type: BlockType;
  content: string;
  order: number;
}

export interface TemplateVariable {
  key: string;
  label: string;
  required: boolean;
}

export interface TemplateSnapshot {
  blocks: TemplateBlock[];
  variables: TemplateVariable[];
}

export interface TemplateEditorFormValues {
  name: string;
  blocks: TemplateBlock[];
  variables: TemplateVariable[];
}

export interface TemplateEditorState {
  status: "idle" | "saving" | "error";
  error?: string;
}

export interface CreateTemplateFormState {
  status: "idle" | "error";
  values: { name: string };
  errors: { name?: string };
  formError?: string;
}

export const EMPTY_CREATE_TEMPLATE_VALUES = { name: "" } as const;

/** State type for the save-draft server action (also used by the editor component). */
export interface SaveDraftState {
  status: "idle" | "error";
  error?: string;
}
