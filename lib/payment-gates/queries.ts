import { prisma } from "@/lib/db/client";

export async function listPaymentGates(clientRelationshipId: string) {
  return prisma.paymentGate.findMany({
    where: { clientRelationshipId },
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

export type PaymentGateListItem = Awaited<
  ReturnType<typeof listPaymentGates>
>[number];
