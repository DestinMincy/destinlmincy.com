import { prisma } from "@/lib/db/client";
import type { ContractStatus } from "@/lib/generated/prisma/enums";

// ── Contract Templates ──────────────────────────────────────────────────────

export async function listContractTemplates(relationshipId: string) {
  return prisma.contractTemplate.findMany({
    where: {
      clientRelationshipId: relationshipId,
      status: { not: "ARCHIVED" },
    },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { versions: true } },
      versions: {
        orderBy: { versionNumber: "desc" },
        take: 1,
        select: {
          id: true,
          versionNumber: true,
          publishedAt: true,
          createdAt: true,
        },
      },
    },
  });
}

export async function getContractTemplate(
  id: string,
  relationshipId: string,
) {
  return prisma.contractTemplate.findFirst({
    where: { id, clientRelationshipId: relationshipId },
    include: {
      versions: { orderBy: { versionNumber: "desc" } },
    },
  });
}

export async function getContractTemplateVersion(id: string) {
  return prisma.contractTemplateVersion.findUnique({ where: { id } });
}

export async function createContractTemplate(data: {
  name: string;
  clientRelationshipId: string;
}) {
  return prisma.contractTemplate.create({
    data: {
      name: data.name,
      clientRelationshipId: data.clientRelationshipId,
      status: "DRAFT",
    },
    select: { id: true },
  });
}

/**
 * Updates the draft blocks/variables on the most recent unpublished version
 * of the template. Creates a version record if none exists yet.
 * Only operates when the template status is DRAFT.
 */
export async function updateContractTemplateDraft(
  templateId: string,
  relationshipId: string,
  data: { blocks?: unknown; variables?: unknown },
) {
  return prisma.$transaction(async (tx) => {
    const template = await tx.contractTemplate.findFirst({
      where: { id: templateId, clientRelationshipId: relationshipId },
      select: { id: true, status: true },
    });

    if (!template || template.status !== "DRAFT") {
      return null;
    }

    const draftVersion = await tx.contractTemplateVersion.findFirst({
      where: { contractTemplateId: templateId, publishedAt: null },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    if (draftVersion) {
      return tx.contractTemplateVersion.update({
        where: { id: draftVersion.id },
        data: {
          blocks: data.blocks !== undefined ? (data.blocks as object) : undefined,
          variables: data.variables !== undefined ? (data.variables as object) : undefined,
        },
        select: { id: true },
      });
    }

    const maxVersion = await tx.contractTemplateVersion.findFirst({
      where: { contractTemplateId: templateId },
      orderBy: { versionNumber: "desc" },
      select: { versionNumber: true },
    });

    return tx.contractTemplateVersion.create({
      data: {
        contractTemplateId: templateId,
        versionNumber: (maxVersion?.versionNumber ?? 0) + 1,
        blocks: data.blocks !== undefined ? (data.blocks as object) : undefined,
        variables: data.variables !== undefined ? (data.variables as object) : undefined,
      },
      select: { id: true },
    });
  });
}

/**
 * Publishes the current draft version: sets publishedAt and marks the
 * template PUBLISHED. Operates only when template status is DRAFT.
 */
export async function publishContractTemplateVersion(
  templateId: string,
  relationshipId: string,
) {
  return prisma.$transaction(async (tx) => {
    const template = await tx.contractTemplate.findFirst({
      where: { id: templateId, clientRelationshipId: relationshipId },
      select: { id: true, status: true },
    });

    if (!template || template.status !== "DRAFT") {
      return null;
    }

    const draftVersion = await tx.contractTemplateVersion.findFirst({
      where: { contractTemplateId: templateId, publishedAt: null },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    if (!draftVersion) {
      return null;
    }

    const published = await tx.contractTemplateVersion.update({
      where: { id: draftVersion.id },
      data: { publishedAt: new Date() },
      select: { id: true },
    });

    await tx.contractTemplate.update({
      where: { id: templateId },
      data: { status: "PUBLISHED" },
      select: { id: true },
    });

    return published;
  });
}

export async function archiveContractTemplate(
  id: string,
  relationshipId: string,
) {
  return prisma.contractTemplate.updateMany({
    where: { id, clientRelationshipId: relationshipId },
    data: { status: "ARCHIVED" },
  });
}

export async function getContractTemplateDraftSnapshot(
  clientRelationshipId: string,
  templateId: string,
) {
  const template = await prisma.contractTemplate.findFirst({
    where: { id: templateId, clientRelationshipId, status: "DRAFT" },
    select: { id: true, name: true },
  });

  if (!template) return null;

  const draftVersion = await prisma.contractTemplateVersion.findFirst({
    where: { contractTemplateId: templateId, publishedAt: null },
    orderBy: { versionNumber: "desc" },
    select: { id: true, versionNumber: true, snapshot: true },
  });

  return { template, draftVersion };
}

// ── Contracts ───────────────────────────────────────────────────────────────

export interface CreateContractInput {
  clientRelationshipId: string;
  projectId?: string | null;
  contractTemplateVersionId: string;
  fieldValues?: unknown;
  signerEmail?: string | null;
  signerClerkUserId?: string | null;
}

export async function createContract(data: CreateContractInput) {
  return prisma.contract.create({
    data: {
      clientRelationshipId: data.clientRelationshipId,
      projectId: data.projectId ?? null,
      contractTemplateVersionId: data.contractTemplateVersionId,
      fieldValues: data.fieldValues !== undefined ? (data.fieldValues as object) : undefined,
      status: "DRAFT",
      signerEmail: data.signerEmail ?? null,
      signerClerkUserId: data.signerClerkUserId ?? null,
    },
    select: { id: true },
  });
}

export async function listContracts(relationshipId: string) {
  return prisma.contract.findMany({
    where: { clientRelationshipId: relationshipId },
    orderBy: { updatedAt: "desc" },
    include: {
      templateVersion: { select: { id: true, versionNumber: true, publishedAt: true } },
    },
  });
}

export async function getContract(id: string, relationshipId: string) {
  return prisma.contract.findFirst({
    where: { id, clientRelationshipId: relationshipId },
    include: {
      templateVersion: true,
    },
  });
}

export interface UpdateContractStatusExtra {
  docusignEnvelopeId?: string | null;
  docusignStatus?: string | null;
  s3Key?: string | null;
  s3Bucket?: string | null;
}

export async function updateContractStatus(
  id: string,
  relationshipId: string,
  status: ContractStatus,
  extra?: UpdateContractStatusExtra,
) {
  return prisma.contract.updateMany({
    where: { id, clientRelationshipId: relationshipId },
    data: {
      status,
      ...(extra?.docusignEnvelopeId !== undefined
        ? { docusignEnvelopeId: extra.docusignEnvelopeId }
        : {}),
      ...(extra?.docusignStatus !== undefined
        ? { docusignStatus: extra.docusignStatus }
        : {}),
      ...(extra?.s3Key !== undefined ? { s3Key: extra.s3Key } : {}),
      ...(extra?.s3Bucket !== undefined ? { s3Bucket: extra.s3Bucket } : {}),
    },
  });
}

export type ContractTemplateListItem = Awaited<
  ReturnType<typeof listContractTemplates>
>[number];

export type ContractTemplateDetail = NonNullable<
  Awaited<ReturnType<typeof getContractTemplate>>
>;

export type ContractListItem = Awaited<
  ReturnType<typeof listContracts>
>[number];

export type ContractDetail = NonNullable<
  Awaited<ReturnType<typeof getContract>>
>;
