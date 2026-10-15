"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAdminUser } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db/client";
import { Prisma } from "@/lib/generated/prisma/client";
import type {
  CreateTemplateFormState,
  GenerateContractState,
  SaveDraftState,
  TemplateSnapshot,
} from "@/lib/contracts/types";
import { saveContractTemplateDraftSnapshot } from "@/lib/contracts/queries";
import { parseTemplateSnapshot } from "@/lib/contracts/template-validation";
import { isValidEmail } from "@/lib/relationships/validation";
import { generateContractPdf } from "@/lib/pdf/generate";
import {
  deleteFromPrivateS3,
  downloadFromPrivateS3,
  uploadToPrivateS3,
} from "@/lib/storage/s3";
import { sendEnvelopeForSigning } from "@/lib/docusign/client";
import { sendContractToDocuSign } from "@/lib/docusign/workflow";

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

  const expectedUpdatedAt = parseConcurrencyToken(formData.get("concurrencyToken"));
  if (!expectedUpdatedAt) {
    return { status: "error", error: STALE_TEMPLATE };
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(String(formData.get("snapshot") ?? ""));
  } catch {
    return { status: "error", error: "Invalid snapshot data." };
  }

  const parsed = parseTemplateSnapshot(parsedJson);
  if (!parsed.ok) {
    return { status: "error", error: parsed.error };
  }

  let result: Awaited<ReturnType<typeof saveContractTemplateDraftSnapshot>>;
  try {
    result = await saveContractTemplateDraftSnapshot(
      clientRelationshipId,
      templateId,
      parsed.snapshot,
      expectedUpdatedAt,
    );
  } catch (error: unknown) {
    console.error("Failed to save draft", error);
    return { status: "error", error: SAVE_ERROR };
  }

  if (result.status === "stale") {
    return { status: "error", error: STALE_TEMPLATE };
  }
  if (result.status === "draft-missing") {
    return {
      status: "error",
      error: "No draft version found. The template may have been published.",
    };
  }

  revalidatePath(templatePath(clientRelationshipId, templateId));
  return { status: "idle", concurrencyToken: result.concurrencyToken };
}

const STALE_TEMPLATE =
  "This template changed after you opened it. Reload the page to get the latest draft, then save again.";

/** Reads an ISO timestamp concurrency token from a form field. */
function parseConcurrencyToken(value: FormDataEntryValue | null): Date | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
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
 * Generates a contract from a published template version. A `Contract` row is
 * created only after the PDF is rendered and stored in private S3; every
 * failure before that returns an error state for the generate page instead.
 */
export async function createContractFormAction(
  clientRelationshipId: string,
  templateId: string,
  _prevState: GenerateContractState,
  formData: FormData,
): Promise<GenerateContractState> {
  const versionId = String(formData.get("versionId") ?? "").trim();
  const signerEmail = String(formData.get("signerEmail") ?? "")
    .trim()
    .toLowerCase();

  // Collect variable values (fields prefixed with "var_").
  const fields: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("var_")) {
      fields[key.slice(4)] = String(value).trim();
    }
  }
  const values = { versionId, signerEmail, fields };
  const fail = (error: string): GenerateContractState => ({
    status: "error",
    error,
    values,
  });

  const admin = await getAdminUser();
  if (!admin) return fail(NOT_AUTHORIZED);

  if (!versionId) return fail("Choose a published template version.");
  if (!signerEmail) return fail("Signer email is required.");
  if (!isValidEmail(signerEmail)) return fail("Enter a valid signer email.");

  let version: { snapshot: unknown; contractTemplate: { name: string } } | null;
  try {
    version = await prisma.contractTemplateVersion.findFirst({
      where: {
        id: versionId,
        contractTemplateId: templateId,
        contractTemplate: { clientRelationshipId },
        publishedAt: { not: null },
      },
      select: {
        snapshot: true,
        contractTemplate: { select: { name: true } },
      },
    });
  } catch (error: unknown) {
    console.error("Failed to load template version", error);
    return fail(SAVE_ERROR);
  }
  if (!version) return fail("That template version is not published.");

  const parsed = parseTemplateSnapshot(version.snapshot);
  if (!parsed.ok) {
    return fail(`This template version cannot be used: ${parsed.error}`);
  }
  const snapshot = parsed.snapshot;

  const missingRequired = snapshot.variables
    .filter((variable) => variable.required && !fields[variable.key])
    .map((variable) => variable.label || variable.key);
  if (missingRequired.length > 0) {
    return fail(`Fill in the required fields: ${missingRequired.join(", ")}.`);
  }

  if (!process.env.AWS_REGION?.trim() || !process.env.S3_PRIVATE_BUCKET?.trim()) {
    return fail(
      "PDF storage is not configured. Set AWS_REGION and S3_PRIVATE_BUCKET, then generate the contract again.",
    );
  }

  let pdfBuffer: Buffer;
  try {
    pdfBuffer = await generateContractPdf({
      templateName: version.contractTemplate.name,
      snapshot,
      fieldValues: fields,
      signerEmail,
    });
  } catch (error: unknown) {
    console.error("Contract PDF render failed", error);
    return fail("The contract PDF could not be generated. No contract was created.");
  }

  let stored: { bucket: string; key: string };
  try {
    stored = await uploadToPrivateS3(
      `contracts/${clientRelationshipId}/${randomUUID()}.pdf`,
      pdfBuffer,
      "application/pdf",
    );
  } catch (error: unknown) {
    console.error("Contract PDF upload failed", error);
    return fail(
      "The contract PDF could not be stored in S3. Check the bucket and AWS credentials. No contract was created.",
    );
  }

  try {
    await prisma.contract.create({
      data: {
        clientRelationshipId,
        contractTemplateVersionId: versionId,
        signerEmail,
        fieldValues:
          Object.keys(fields).length > 0
            ? (fields as Prisma.InputJsonValue)
            : undefined,
        status: "DRAFT",
        s3Key: stored.key,
        s3Bucket: stored.bucket,
      },
      select: { id: true },
    });
  } catch (error: unknown) {
    console.error("Failed to create contract record", error);
    // The PDF belongs to no contract now; remove it rather than orphan it.
    await deleteFromPrivateS3(stored.key).catch((cleanupError: unknown) => {
      console.error("Failed to remove orphaned contract PDF", stored.key, cleanupError);
    });
    return fail(SAVE_ERROR);
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
 * Sends a generated contract PDF to DocuSign for signing. The claim and send
 * live in `sendContractToDocuSign`; this action checks the admin and the
 * configuration, then maps the result to a message.
 */
export async function sendContractToDocuSignAction(
  clientRelationshipId: string,
  contractId: string,
  _prevState: SendToDocuSignState,
  _formData: FormData,
): Promise<SendToDocuSignState> {
  const admin = await getAdminUser();
  if (!admin) return { status: "error", error: "Not authorized." };

  const adminEmail = process.env.DOCUSIGN_ADMIN_EMAIL?.trim() ?? "";
  const adminName = process.env.DOCUSIGN_ADMIN_NAME?.trim() || "Admin";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "") ?? "";

  if (!adminEmail) {
    return { status: "error", error: "DOCUSIGN_ADMIN_EMAIL is not configured." };
  }
  if (!appUrl) {
    return { status: "error", error: "NEXT_PUBLIC_APP_URL is not configured." };
  }

  try {
    const result = await sendContractToDocuSign(clientRelationshipId, contractId, {
      createEnvelope: sendEnvelopeForSigning,
      getPdf: downloadFromPrivateS3,
      admin: { email: adminEmail, name: adminName },
      webhookUrl: `${appUrl}/api/webhooks/docusign`,
    });

    switch (result.status) {
      case "contract-missing":
        return { status: "error", error: "Contract not found." };
      case "already-sent":
        return { status: "error", error: "Contract has already been sent to DocuSign." };
      case "pdf-missing":
        return {
          status: "error",
          error:
            "No PDF on file. Check the AWS_REGION and S3_PRIVATE_BUCKET configuration and create the contract again.",
        };
      case "sent":
        break;
    }
  } catch (error: unknown) {
    console.error("Failed to send contract to DocuSign", error);
    return { status: "error", error: "Failed to send to DocuSign. Check server logs." };
  }

  revalidatePath(contractsPath(clientRelationshipId));
  return { status: "success" };
}
