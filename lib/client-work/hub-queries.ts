import { prisma } from "@/lib/db/client";

/** Loads the full relationship hub data needed for the admin hub page:
 * identity, section counts, and action items derived from what the current
 * schema supports.
 */
export async function getRelationshipHubData(clientRelationshipId: string) {
  const now = new Date();

  const relationship = await prisma.clientRelationship.findUnique({
    where: { id: clientRelationshipId },
    select: {
      id: true,
      name: true,
      lifecycle: true,
      summary: true,
      legalName: true,
      primaryContactName: true,
      primaryContactEmail: true,
      primaryContactPhone: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          users: { where: { status: "ACTIVE" } },
          applications: { where: { status: "ACTIVE" } },
          projects: { where: { status: { not: "ARCHIVED" } } },
          contractTemplates: true,
          paymentGates: true,
          milestones: true,
        },
      },
    },
  });

  if (!relationship) return null;

  // Action items: pending payment gates blocking work.
  const pendingPaymentGates = await prisma.paymentGate.findMany({
    where: { clientRelationshipId, status: "PENDING" },
    orderBy: { createdAt: "asc" },
    select: { id: true, label: true, projectId: true },
  });

  // Action items: overdue milestones (PLANNED or IN_PROGRESS, past target date).
  const overdueMilestones = await prisma.milestone.findMany({
    where: {
      clientRelationshipId,
      status: { in: ["PLANNED", "IN_PROGRESS"] },
      targetDate: { lt: now },
    },
    orderBy: { targetDate: "asc" },
    select: { id: true, title: true, status: true, targetDate: true, projectId: true },
  });

  // Project status breakdown for the summary panel.
  const projectStatusCounts = await prisma.project.groupBy({
    by: ["status"],
    where: {
      clientRelationshipId,
      status: { not: "ARCHIVED" },
    },
    _count: { _all: true },
  });

  return {
    relationship,
    pendingPaymentGates,
    overdueMilestones,
    projectStatusCounts,
  };
}

export type RelationshipHubData = NonNullable<
  Awaited<ReturnType<typeof getRelationshipHubData>>
>;

/** Loads lightweight summary data for all relationships (admin list overview). */
export async function getAdminOverviewData() {
  const [total, active, recent] = await Promise.all([
    prisma.clientRelationship.count(),
    prisma.clientRelationship.count({
      where: { lifecycle: "ACTIVE" },
    }),
    prisma.clientRelationship.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        lifecycle: true,
        updatedAt: true,
        _count: {
          select: { users: { where: { status: "ACTIVE" } } },
        },
      },
    }),
  ]);

  return { total, active, recent };
}
