import { prisma } from "@/lib/db/client";

// ------------------------------------------------------------------
// Contracts
// ------------------------------------------------------------------

export interface PortalContract {
  id: string;
  templateName: string;
  status: string;
  createdAt: Date;
}

export async function listPortalContracts(
  clientRelationshipId: string,
): Promise<PortalContract[]> {
  const rows = await prisma.contract.findMany({
    where: { clientRelationshipId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      createdAt: true,
      templateVersion: {
        select: {
          contractTemplate: {
            select: { name: true },
          },
        },
      },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    templateName: r.templateVersion?.contractTemplate?.name ?? "Unknown",
    status: r.status,
    createdAt: r.createdAt,
  }));
}

// ------------------------------------------------------------------
// Payment Gates
// ------------------------------------------------------------------

export interface PortalPaymentGate {
  id: string;
  label: string;
  status: string;
  createdAt: Date;
}

export async function listPortalPaymentGates(
  clientRelationshipId: string,
): Promise<PortalPaymentGate[]> {
  const rows = await prisma.paymentGate.findMany({
    where: { clientRelationshipId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      label: true,
      status: true,
      createdAt: true,
    },
  });
  return rows.map((r) => ({
    id: r.id,
    label: r.label,
    status: r.status,
    createdAt: r.createdAt,
  }));
}

// ------------------------------------------------------------------
// Subscriptions
// ------------------------------------------------------------------

export interface PortalSubscription {
  id: string;
  serviceType: string;
  status: string;
  currentPeriodEndsAt: Date | null;
  entitlementKey: string | null;
}

export async function listPortalSubscriptions(
  clientRelationshipId: string,
): Promise<PortalSubscription[]> {
  const rows = await prisma.subscriptionReference.findMany({
    where: { clientRelationshipId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      serviceType: true,
      status: true,
      currentPeriodEndsAt: true,
      entitlementKey: true,
    },
  });
  return rows;
}

// ------------------------------------------------------------------
// Projects (client-visible, not archived)
// ------------------------------------------------------------------

export interface PortalProject {
  id: string;
  name: string;
  status: string;
  targetDate: Date | null;
  clientDescription: string | null;
}

export async function listPortalProjects(
  clientRelationshipId: string,
): Promise<PortalProject[]> {
  const rows = await prisma.project.findMany({
    where: {
      clientRelationshipId,
      status: { not: "ARCHIVED" },
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      status: true,
      targetDate: true,
      clientDescription: true,
    },
  });
  return rows;
}

// ------------------------------------------------------------------
// Single project with milestones + deliverables
// ------------------------------------------------------------------

export interface PortalApproval {
  id: string;
  actorName: string | null;
  action: string;
  note: string | null;
  createdAt: Date;
}

export interface PortalMilestone {
  id: string;
  title: string;
  status: string;
  targetDate: Date | null;
  approvalRequired: boolean;
  clientFacingUpdate: string | null;
  approvals: PortalApproval[];
  deliverables: PortalDeliverable[];
}

export interface PortalDeliverable {
  id: string;
  label: string;
  url: string | null;
}

export interface PortalProjectDetail extends PortalProject {
  milestones: PortalMilestone[];
  deliverables: PortalDeliverable[];
}

export async function getPortalProjectDetail(
  projectId: string,
  clientRelationshipId: string,
): Promise<PortalProjectDetail | null> {
  const project = await prisma.project.findFirst({
    where: { id: projectId, clientRelationshipId },
    select: {
      id: true,
      name: true,
      status: true,
      targetDate: true,
      clientDescription: true,
      milestones: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          title: true,
          status: true,
          targetDate: true,
          approvalRequired: true,
          clientFacingUpdate: true,
          approvals: {
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              actorName: true,
              action: true,
              note: true,
              createdAt: true,
            },
          },
          deliverables: {
            where: { visibility: "CLIENT" },
            select: {
              id: true,
              label: true,
              url: true,
            },
          },
        },
      },
      deliverables: {
        where: { visibility: "CLIENT" },
        select: {
          id: true,
          label: true,
          url: true,
        },
      },
    },
  });

  if (!project) return null;

  return project;
}

// ------------------------------------------------------------------
// Overview action items (pending items the client should act on)
// ------------------------------------------------------------------

export interface PortalActionItems {
  pendingPayments: number;
}

export async function getPortalActionItems(
  clientRelationshipId: string,
): Promise<PortalActionItems> {
  const pendingPayments = await prisma.paymentGate.count({
    where: { clientRelationshipId, status: "PENDING" },
  });
  return { pendingPayments };
}
