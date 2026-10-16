import { prisma } from "@/lib/db/client";
import { PAYMENT_GATE_SATISFIED_STATUSES } from "@/lib/payment-gates/types";

export interface ListPaymentGatesFilters {
  projectId?: string;
}

export async function listPaymentGates(
  clientRelationshipId: string,
  filters?: ListPaymentGatesFilters,
) {
  return prisma.paymentGate.findMany({
    where: {
      clientRelationshipId,
      ...(filters?.projectId ? { projectId: filters.projectId } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      project: { select: { id: true, name: true } },
    },
  });
}

export async function getPaymentGate(
  clientRelationshipId: string,
  paymentGateId: string,
) {
  return prisma.paymentGate.findFirst({
    where: { id: paymentGateId, clientRelationshipId },
    include: {
      project: { select: { id: true, name: true } },
    },
  });
}

export async function listPendingPaymentGates(clientRelationshipId: string) {
  return prisma.paymentGate.findMany({
    where: { clientRelationshipId, status: "PENDING" },
    orderBy: { createdAt: "desc" },
    select: { id: true, label: true, status: true, projectId: true },
  });
}

/**
 * Gates that stop a project from starting: flagged `requiredBeforeWork` and
 * not yet paid or waived.
 */
export async function listBlockingPaymentGates(
  clientRelationshipId: string,
  projectId: string,
) {
  return prisma.paymentGate.findMany({
    where: {
      clientRelationshipId,
      projectId,
      requiredBeforeWork: true,
      status: { notIn: [...PAYMENT_GATE_SATISFIED_STATUSES] },
    },
    orderBy: { createdAt: "asc" },
    select: { id: true, label: true, status: true, dueDate: true },
  });
}

export type PaymentGateListItem = Awaited<
  ReturnType<typeof listPaymentGates>
>[number];

export type PaymentGateDetail = NonNullable<
  Awaited<ReturnType<typeof getPaymentGate>>
>;
