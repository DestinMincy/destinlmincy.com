"use server";

import { revalidatePath } from "next/cache";

import { getAdminUser } from "@/lib/auth/require-admin";
import {
  archiveContractTemplate,
  createContract,
  createContractTemplate,
  publishContractTemplateVersion,
  updateContractStatus,
  updateContractTemplateDraft,
} from "@/lib/contracts/queries";

const NOT_AUTHORIZED = "You are not authorized to do that.";
const MAX_NAME_LENGTH = 200;

function contractsPath(relationshipId: string): string {
  return `/admin/relationships/${relationshipId}/contracts`;
}

export interface ContractTemplateFormState {
  status: "idle" | "error";
  errors: Partial<Record<"name", string>>;
  formError?: string;
}

export interface ContractDraftFormState {
  status: "idle" | "error";
  errors: Partial<Record<"blocks" | "variables", string>>;
  formError?: string;
}

export interface ContractFormState {
  status: "idle" | "error";
  errors: Partial<Record<"signerEmail", string>>;
  formError?: string;
}

export interface SimpleActionState {
  status: "idle" | "error";
  success?: boolean;
  error?: string;
}

export interface SendDocuSignState {
  success: boolean;
  error?: string;
}

// ── Contract Templates ──────────────────────────────────────────────────────

export async function createContractTemplateAction(
  relationshipId: string,
  _prevState: ContractTemplateFormState,
  formData: FormData,
): Promise<ContractTemplateFormState> {
  const admin = await getAdminUser();
  if (!admin) {
    return { status: "error", errors: {}, formError: NOT_AUTHORIZED };
  }

  const rawName = formData.get("name");
  const name = typeof rawName === "string" ? rawName.trim() : "";

  const errors: ContractTemplateFormState["errors"] = {};
  if (!name) {
    errors.name = "Name is required.";
  } else if (name.length > MAX_NAME_LENGTH) {
    errors.name = `Name must be ${MAX_NAME_LENGTH} characters or fewer.`;
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", errors };
  }

  try {
    await createContractTemplate({ name, clientRelationshipId: relationshipId });
  } catch (error: unknown) {
    console.error("Failed to create contract template", error);
    return {
      status: "error",
      errors: {},
      formError: "Something went wrong while saving. Try again.",
    };
  }

  revalidatePath(contractsPath(relationshipId));
  return { status: "idle", errors: {} };
}

export async function updateContractTemplateDraftAction(
  templateId: string,
  relationshipId: string,
  _prevState: ContractDraftFormState,
  formData: FormData,
): Promise<ContractDraftFormState> {
  const admin = await getAdminUser();
  if (!admin) {
    return { status: "error", errors: {}, formError: NOT_AUTHORIZED };
  }

  const rawBlocks = formData.get("blocks");
  const rawVariables = formData.get("variables");

  const errors: ContractDraftFormState["errors"] = {};
  let blocks: unknown;
  let variables: unknown;

  if (typeof rawBlocks === "string" && rawBlocks.trim()) {
    try {
      blocks = JSON.parse(rawBlocks);
    } catch {
      errors.blocks = "Blocks must be valid JSON.";
    }
  }

  if (typeof rawVariables === "string" && rawVariables.trim()) {
    try {
      variables = JSON.parse(rawVariables);
    } catch {
      errors.variables = "Variables must be valid JSON.";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", errors };
  }

  try {
    const result = await updateContractTemplateDraft(templateId, relationshipId, {
      blocks,
      variables,
    });

    if (!result) {
      return {
        status: "error",
        errors: {},
        formError: "Template not found or is not in draft state.",
      };
    }
  } catch (error: unknown) {
    console.error("Failed to update contract template draft", error);
    return {
      status: "error",
      errors: {},
      formError: "Something went wrong while saving. Try again.",
    };
  }

  revalidatePath(contractsPath(relationshipId));
  return { status: "idle", errors: {} };
}

export async function publishContractTemplateAction(
  templateId: string,
  relationshipId: string,
): Promise<SimpleActionState> {
  const admin = await getAdminUser();
  if (!admin) {
    return { status: "error", error: NOT_AUTHORIZED };
  }

  try {
    const result = await publishContractTemplateVersion(templateId, relationshipId);
    if (!result) {
      return {
        status: "error",
        error: "Template not found, not in draft state, or has no draft content.",
      };
    }
  } catch (error: unknown) {
    console.error("Failed to publish contract template", error);
    return { status: "error", error: "Something went wrong. Try again." };
  }

  revalidatePath(contractsPath(relationshipId));
  return { status: "idle", success: true };
}

export async function archiveContractTemplateAction(
  templateId: string,
  relationshipId: string,
): Promise<SimpleActionState> {
  const admin = await getAdminUser();
  if (!admin) {
    return { status: "error", error: NOT_AUTHORIZED };
  }

  try {
    await archiveContractTemplate(templateId, relationshipId);
  } catch (error: unknown) {
    console.error("Failed to archive contract template", error);
    return { status: "error", error: "Something went wrong. Try again." };
  }

  revalidatePath(contractsPath(relationshipId));
  return { status: "idle", success: true };
}

// ── Contracts ───────────────────────────────────────────────────────────────

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function createContractAction(
  templateVersionId: string,
  relationshipId: string,
  _prevState: ContractFormState,
  formData: FormData,
): Promise<ContractFormState> {
  const admin = await getAdminUser();
  if (!admin) {
    return { status: "error", errors: {}, formError: NOT_AUTHORIZED };
  }

  const rawSignerEmail = formData.get("signerEmail");
  const signerEmail =
    typeof rawSignerEmail === "string" ? rawSignerEmail.trim().toLowerCase() : "";

  const errors: ContractFormState["errors"] = {};
  if (!signerEmail) {
    errors.signerEmail = "Signer email is required.";
  } else if (!isValidEmail(signerEmail)) {
    errors.signerEmail = "Enter a valid email address.";
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", errors };
  }

  try {
    const rawFieldValues = formData.get("fieldValues");
    let fieldValues: unknown;
    if (typeof rawFieldValues === "string" && rawFieldValues.trim()) {
      try {
        fieldValues = JSON.parse(rawFieldValues);
      } catch {
        return {
          status: "error",
          errors: {},
          formError: "Field values must be valid JSON.",
        };
      }
    }

    const projectId = formData.get("projectId");
    const signerClerkUserId = formData.get("signerClerkUserId");

    await createContract({
      clientRelationshipId: relationshipId,
      contractTemplateVersionId: templateVersionId,
      signerEmail,
      fieldValues,
      projectId: typeof projectId === "string" ? projectId.trim() || null : null,
      signerClerkUserId:
        typeof signerClerkUserId === "string" ? signerClerkUserId.trim() || null : null,
    });
  } catch (error: unknown) {
    console.error("Failed to create contract", error);
    return {
      status: "error",
      errors: {},
      formError: "Something went wrong while saving. Try again.",
    };
  }

  revalidatePath(contractsPath(relationshipId));
  return { status: "idle", errors: {} };
}

export async function sendContractToDocuSign(
  contractId: string,
  relationshipId: string,
): Promise<SendDocuSignState> {
  const admin = await getAdminUser();
  if (!admin) {
    return { success: false, error: NOT_AUTHORIZED };
  }

  const integrationKey = process.env.DOCUSIGN_INTEGRATION_KEY;
  if (!integrationKey) {
    return {
      success: false,
      error:
        "DocuSign not configured. Set DOCUSIGN_INTEGRATION_KEY, DOCUSIGN_ACCOUNT_ID, DOCUSIGN_TEMPLATE_ID.",
    };
  }

  // TODO: Implement actual DocuSign API call using DOCUSIGN_INTEGRATION_KEY,
  // DOCUSIGN_ACCOUNT_ID, and DOCUSIGN_TEMPLATE_ID. This should:
  // 1. Retrieve the contract and its generated PDF from S3
  // 2. Create a DocuSign envelope with the signer's email
  // 3. Store the returned envelopeId on the contract
  // 4. Update contract status to SENT_FOR_SIGNING via updateContractStatus

  try {
    await updateContractStatus(contractId, relationshipId, "SENT_FOR_SIGNING");
  } catch (error: unknown) {
    console.error("Failed to update contract status for DocuSign", error);
    return { success: false, error: "Something went wrong. Try again." };
  }

  revalidatePath(contractsPath(relationshipId));
  return { success: true };
}
