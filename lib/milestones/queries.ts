import { prisma } from "@/lib/db/client";

export async function listMilestones(
  clientRelationshipId: string,
  projectId: string,
) {
  return prisma.milestone.findMany({
    where: { clientRelationshipId, projectId },
    orderBy: [{ targetDate: "asc" }, { createdAt: "asc" }],
    include: {
      _count: { select: { deliverables: true } },
    },
  });
}

export async function getMilestone(
  clientRelationshipId: string,
  projectId: string,
  milestoneId: string,
) {
  return prisma.milestone.findFirst({
    where: { id: milestoneId, clientRelationshipId, projectId },
    include: {
      deliverables: {
        orderBy: { createdAt: "asc" },
        select: { id: true, label: true, url: true, createdAt: true },
      },
    },
  });
}

export async function listDeliverables(
  clientRelationshipId: string,
  projectId: string,
) {
  return prisma.deliverable.findMany({
    where: { clientRelationshipId, projectId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      label: true,
      url: true,
      milestoneId: true,
      createdAt: true,
    },
  });
}

export type MilestoneListItem = Awaited<
  ReturnType<typeof listMilestones>
>[number];

export type MilestoneDetail = NonNullable<
  Awaited<ReturnType<typeof getMilestone>>
>;
