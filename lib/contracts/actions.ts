"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAdminUser } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db/client";
import { Prisma } from "@/lib/generated/prisma/client";
import type {
  CreateTemplateFormState,
  SaveDraftState,
  TemplateSnapshot,
} from "@/lib/contracts/types";
import { generateContractPdf } from "@/lib/pdf/generate";
import { uploadToPrivateS3, getPrivateDownloadUrl } from "@/lib/storage/s3";
import { downloadSignedPdf, sendEnvelopeForSigning } from "@/lib/docusign/client";

const NOT_AUTHORIZED = "You are not authorized to do that.";
const SAVE_ERROR = "Something went wrong while saving. Try again.";

function contractsPath(clientRelationshipId: string): string {
  return `/admin/relationships/${clientRelationshipId}/contracts`;
}

function templatePath(
  clientRelationshipId: string,
  templateId: string,
): string {
  return `/admin/relationships/${clientRelationshipId}/contracts/templates/${templateId}`;
}

export async function createContractTemplateAction(
  clientRelationshipId: string,
  _prevState: CreateTemplateFormState,
  formData: FormData,
): Promise<CreateTemplateFormState> {
  const admin = await getAdminUser();
  if (!admin) {
    return {
      status: "error",
      values: { name: "" },
      errors: {},
      formError: NOT_AUTHORIZED,
    };
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return {
      status: "error",
      values: { name },
      errors: { name: "Template name is required." },
    };
  }
  if (name.length > 200) {
    return {
      status: "error",
      values: { name },
      errors: { name: "Template name must be 200 characters or fewer." },
    };
  }

  let templateId: string;
  try {
    const relationship = await prisma.clientRelationship.findUnique({
      where: { id: clientRelationshipId },
      select: { id: true },
    });
    if (!relationship) {
      return {
        status: "error",
        values: { name },
        errors: {},
        formError: "That relationship no longer exists.",
      };
    }

    const template = await prisma.contractTemplate.create({
      data: {
        clientRelationshipId,
        name,
        status: "DRAFT",
      },
      select: { id: true },
    });

    // Create the initial draft version with an empty snapshot.
    await prisma.contractTemplateVersion.create({
      data: {
        contractTemplateId: template.id,
        versionNumber: 1,
        snapshot: ({ blocks: [], variables: [] } satisfies TemplateSnapshot) as unknown as Prisma.InputJsonValue,
        publishedAt: null,
      },
    });

    templateId = template.id;
  } catch (error: unknown) {
    console.error("Failed to create contract template", error);
    return {
      status: "error",
      values: { name },
      errors: {},
      formError: SAVE_ERROR,
    };
  }

  revalidatePath(contractsPath(clientRelationshipId));
  redirect(templatePath(clientRelationshipId, templateId));
}

export async function saveContractTemplateDraftAction(
  clientRelationshipId: string,
  templateId: string,
  _prevState: SaveDraftState,
  formData: FormData,
): Promise<SaveDraftState> {
  const admin = await getAdminUser();
  if (!admin) {
    return { status: "error", error: NOT_AUTHORIZED };
  }

  const snapshotRaw = String(formData.get("snapshot") ?? "{}");
  let snapshot: TemplateSnapshot;
  try {
    snapshot = JSON.parse(snapshotRaw) as TemplateSnapshot;
  } catch {
    return { status: "error", error: "Invalid snapshot data." };
  }

  try {
    // Update the existing draft version (unpublished) for this template.
    const updated = await prisma.contractTemplateVersion.updateMany({
      where: {
        contractTemplateId: templateId,
        contractTemplate: { clientRelationshipId },
        publishedAt: null,
      },
      data: { snapshot: snapshot as unknown as Prisma.InputJsonValue },
    });

    if (updated.count === 0) {
      return {
        status: "error",
        error: "No draft version found. The template may have been published.",
      };
    }
  } catch (error: unknown) {
    console.error("Failed to save draft", error);
    return { status: "error", error: SAVE_ERROR };
  }

  revalidatePath(templatePath(clientRelationshipId, templateId));
  return { status: "idle" };
}

export interface PublishVersionState {
  status: "idle" | "error";
  error?: string;
}

export async function publishContractTemplateVersionAction(
  clientRelationshipId: string,
  templateId: string,
  _prevState: PublishVersionState,
  _formData: FormData,
): Promise<PublishVersionState> {
  const admin = await getAdminUser();
  if (!admin) {
    return { status: "error", error: NOT_AUTHORIZED };
  }

  try {
    // Publish the current draft version.
    const published = await prisma.contractTemplateVersion.updateMany({
      where: {
        contractTemplateId: templateId,
        contractTemplate: { clientRelationshipId },
        publishedAt: null,
      },
      data: { publishedAt: new Date() },
    });

    if (published.count === 0) {
      return {
        status: "error",
        error: "No unpublished draft version found.",
      };
    }

    // Advance template status to PUBLISHED.
    await prisma.contractTemplate.updateMany({
      where: { id: templateId, clientRelationshipId },
      data: { status: "PUBLISHED" },
    });
  } catch (error: unknown) {
    console.error("Failed to publish version", error);
    return { status: "error", error: SAVE_ERROR };
  }

  revalidatePath(contractsPath(clientRelationshipId));
  revalidatePath(templatePath(clientRelationshipId, templateId));
  return { status: "idle" };
}

export interface ArchiveTemplateState {
  status: "idle" | "error";
  error?: string;
}

export async function archiveContractTemplateAction(
  clientRelationshipId: string,
  templateId: string,
  _prevState: ArchiveTemplateState,
  _formData: FormData,
): Promise<ArchiveTemplateState> {
  const admin = await getAdminUser();
  if (!admin) {
    return { status: "error", error: NOT_AUTHORIZED };
  }

  try {
    const result = await prisma.contractTemplate.updateMany({
      where: {
        id: templateId,
        clientRelationshipId,
        status: { not: "ARCHIVED" },
      },
      data: { status: "ARCHIVED" },
    });

    if (result.count === 0) {
      return {
        status: "error",
        error: "That template was already archived or does not exist.",
      };
    }
  } catch (error: unknown) {
    console.error("Failed to archive template", error);
    return { status: "error", error: SAVE_ERROR };
  }

  revalidatePath(contractsPath(clientRelationshipId));
  return { status: "idle" };
}

/**
 * Starts a new draft version after a template has been published.
 * Copies snapshot/blocks/variables from the last published version as a
 * starting point, sets the template status back to DRAFT, and redirects to
 * the template detail page so the editor can be opened.
 */
export async function startNewDraftVersionAction(
  clientRelationshipId: string,
  templateId: string,
  _formData: FormData,
): Promise<void> {
  const admin = await getAdminUser();
  if (!admin) return;

  try {
    await prisma.$transaction(async (tx) => {
      const template = await tx.contractTemplate.findFirst({
        where: { id: templateId, clientRelationshipId },
        select: { id: true, status: true },
      });

      if (!template || template.status !== "PUBLISHED") return;

      // Check there is no existing unpublished draft already.
      const existingDraft = await tx.contractTemplateVersion.findFirst({
        where: { contractTemplateId: templateId, publishedAt: null },
        select: { id: true },
      });
      if (existingDraft) return;

      // Find the highest version number and copy the last published version.
      const lastPublished = await tx.contractTemplateVersion.findFirst({
        where: {
          contractTemplateId: templateId,
          publishedAt: { not: null },
        },
        orderBy: { versionNumber: "desc" },
        select: {
          versionNumber: true,
          snapshot: true,
          blocks: true,
          variables: true,
        },
      });

      const nextVersion = (lastPublished?.versionNumber ?? 0) + 1;

      await tx.contractTemplateVersion.create({
        data: {
          contractTemplateId: templateId,
          versionNumber: nextVersion,
          snapshot: lastPublished?.snapshot !== null && lastPublished?.snapshot !== undefined
            ? (lastPublished.snapshot as Prisma.InputJsonValue)
            : undefined,
          blocks: lastPublished?.blocks !== null && lastPublished?.blocks !== undefined
            ? (lastPublished.blocks as Prisma.InputJsonValue)
            : undefined,
          variables: lastPublished?.variables !== null && lastPublished?.variables !== undefined
            ? (lastPublished.variables as Prisma.InputJsonValue)
            : undefined,
          publishedAt: null,
        },
      });

      await tx.contractTemplate.update({
        where: { id: templateId },
        data: { status: "DRAFT" },
      });
    });
  } catch (error: unknown) {
    console.error("Failed to start new draft version", error);
    return;
  }

  revalidatePath(contractsPath(clientRelationshipId));
  revalidatePath(templatePath(clientRelationshipId, templateId));
}

/**
 * Form-safe server action for generating a Contract from a published template
 * version. Reads versionId, signerEmail, and contract variable fields from
 * formData, then creates the Contract record and redirects to the contracts
 * list.
 *
 * TODO: PDF generation deferred to Unit 07 implementation.
 */
export async function createContractFormAction(
  clientRelationshipId: string,
  templateId: string,
  formData: FormData,
): Promise<void> {
  const admin = await getAdminUser();
  if (!admin) return;

  const versionId = String(formData.get("versionId") ?? "").trim();
  const signerEmail = String(formData.get("signerEmail") ?? "")
    .trim()
    .toLowerCase();

  if (!versionId || !signerEmail) return;

  // Collect variable overrides (fields prefixed with "var_").
  const fieldValues: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("var_")) {
      fieldValues[key.slice(4)] = String(value);
    }
  }

  try {
    // Verify the version belongs to this template and relationship.
    const version = await prisma.contractTemplateVersion.findFirst({
      where: {
        id: versionId,
        contractTemplateId: templateId,
        contractTemplate: { clientRelationshipId },
        publishedAt: { not: null },
      },
      include: {
        contractTemplate: { select: { name: true, clientRelationshipId: true } },
      },
    });

    if (!version) return;

    // Validate required variables before generating the PDF.
    const snapshot = version.snapshot as unknown as TemplateSnapshot | null;
    if (snapshot) {
      const missingRequired = snapshot.variables
        .filter((v) => v.required && !fieldValues[v.key])
        .map((v) => v.label || v.key);
      if (missingRequired.length > 0) {
        console.error("Missing required variables:", missingRequired);
        return;
      }
    }

    // Generate PDF.
    let s3Key: string | undefined;
    let s3Bucket: string | undefined;
    if (snapshot && process.env.AWS_REGION && process.env.S3_PRIVATE_BUCKET) {
      try {
        const pdfBuffer = await generateContractPdf({
          templateName: version.contractTemplate.name,
          snapshot,
          fieldValues,
          signerEmail,
        });
        const contractId = `contract-${Date.now()}`;
        const key = `contracts/${clientRelationshipId}/${contractId}.pdf`;
        const result = await uploadToPrivateS3(key, pdfBuffer, "application/pdf");
        s3Key = result.key;
        s3Bucket = result.bucket;
      } catch (pdfError: unknown) {
        console.error("PDF generation/upload failed, creating record without PDF:", pdfError);
      }
    }

    await prisma.contract.create({
      data: {
        clientRelationshipId,
        contractTemplateVersionId: versionId,
        signerEmail,
        fieldValues:
          Object.keys(fieldValues).length > 0
            ? (fieldValues as Prisma.InputJsonValue)
            : undefined,
        status: "DRAFT",
        s3Key,
        s3Bucket,
      },
      select: { id: true },
    });
  } catch (error: unknown) {
    console.error("Failed to generate contract", error);
    return;
  }

  revalidatePath(contractsPath(clientRelationshipId));
  redirect(contractsPath(clientRelationshipId));
}

/**
 * Simple form-safe server action for publishing a template version.
 * Used in `<form action={...}>` contexts where useActionState is not in play.
 */
export async function publishContractTemplateVersionFormAction(
  clientRelationshipId: string,
  templateId: string,
  _formData: FormData,
): Promise<void> {
  const admin = await getAdminUser();
  if (!admin) return;

  try {
    await prisma.contractTemplateVersion.updateMany({
      where: {
        contractTemplateId: templateId,
        contractTemplate: { clientRelationshipId },
        publishedAt: null,
      },
      data: { publishedAt: new Date() },
    });

    await prisma.contractTemplate.updateMany({
      where: { id: templateId, clientRelationshipId },
      data: { status: "PUBLISHED" },
    });
  } catch (error: unknown) {
    console.error("Failed to publish template version", error);
    return;
  }

  revalidatePath(contractsPath(clientRelationshipId));
  revalidatePath(templatePath(clientRelationshipId, templateId));
}

export interface SendToDocuSignState {
  status: "idle" | "error" | "success";
  error?: string;
}

/**
 * Sends a generated contract PDF to DocuSign for signing.
 * Requires the contract to have an S3-stored PDF and status DRAFT or GENERATED.
 */
export async function sendContractToDocuSignAction(
  clientRelationshipId: string,
  contractId: string,
  _prevState: SendToDocuSignState,
  _formData: FormData,
): Promise<SendToDocuSignState> {
  const admin = await getAdminUser();
  if (!admin) return { status: "error", error: "Not authorized." };

  try {
    const contract = await prisma.contract.findFirst({
      where: { id: contractId, clientRelationshipId },
      include: {
        templateVersion: {
          include: { contractTemplate: { select: { name: true } } },
        },
      },
    });

    if (!contract) return { status: "error", error: "Contract not found." };
    if (contract.docusignEnvelopeId) {
      return { status: "error", error: "Contract has already been sent to DocuSign." };
    }
    if (!contract.s3Key || !contract.s3Bucket) {
      return {
        status: "error",
        error: "No PDF on file. Regenerate the contract first.",
      };
    }

    // Download PDF from S3 via presigned URL then fetch it.
    const presignedUrl = await getPrivateDownloadUrl(contract.s3Key);
    const pdfResponse = await fetch(presignedUrl);
    if (!pdfResponse.ok) {
      return { status: "error", error: "Failed to retrieve contract PDF from storage." };
    }
    const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());

    const templateName =
      contract.templateVersion?.contractTemplate?.name ?? "Contract";

    const adminEmail = process.env.DOCUSIGN_ADMIN_EMAIL ?? "";
    const adminName = process.env.DOCUSIGN_ADMIN_NAME ?? "Admin";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    const webhookUrl = `${appUrl}/api/webhooks/docusign`;

    const { envelopeId, status } = await sendEnvelopeForSigning({
      pdfBuffer,
      documentName: templateName,
      signerEmail: contract.signerEmail ?? "",
      signerName: contract.signerEmail ?? "",
      adminEmail,
      adminName,
      webhookUrl,
    });

    await prisma.contract.update({
      where: { id: contractId },
      data: {
        docusignEnvelopeId: envelopeId,
        docusignStatus: status,
        status: "SENT_FOR_SIGNING",
      },
    });

    revalidatePath(contractsPath(clientRelationshipId));
    return { status: "success" };
  } catch (error: unknown) {
    console.error("Failed to send contract to DocuSign", error);
    return { status: "error", error: "Failed to send to DocuSign. Check server logs." };
  }
}
