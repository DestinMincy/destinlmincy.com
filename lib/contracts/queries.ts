import { prisma } from "@/lib/db/client";

export async function listContractTemplates(clientRelationshipId: string) {
  return prisma.contractTemplate.findMany({
    where: { clientRelationshipId },
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
  clientRelationshipId: string,
  templateId: string,
) {
  return prisma.contractTemplate.findFirst({
    where: { id: templateId, clientRelationshipId },
    include: {
      versions: {
        orderBy: { versionNumber: "desc" },
        select: {
          id: true,
          versionNumber: true,
          snapshot: true,
          publishedAt: true,
          createdAt: true,
        },
      },
    },
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
    select: { id: true, snapshot: true, versionNumber: true },
  });

  return { template, draftVersion };
}

export type ContractTemplateListItem = Awaited<
  ReturnType<typeof listContractTemplates>
>[number];

export type ContractTemplateDetail = NonNullable<
  Awaited<ReturnType<typeof getContractTemplate>>
>;
