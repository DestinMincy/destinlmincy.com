import type { PaymentGateType } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/db/client";

export interface ListPaymentGatesFilters {
  projectId?: string;
}

export async function listPaymentGates(
  relationshipId: string,
  filters?: ListPaymentGatesFilters,
) {
  return prisma.paymentGate.findMany({
    where: {
      clientRelationshipId: relationshipId,
      ...(filters?.projectId ? { projectId: filters.projectId } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      project: { select: { id: true, name: true } },
    },
  });
}

export async function getPaymentGate(id: string, relationshipId: string) {
  return prisma.paymentGate.findFirst({
    where: { id, clientRelationshipId: relationshipId },
    include: {
      project: { select: { id: true, name: true } },
    },
  });
}

export interface CreatePaymentGateInput {
  clientRelationshipId: string;
  projectId?: string | null;
  label: string;
  paymentType?: PaymentGateType;
  /** Decimal-compatible string or number, e.g. "1500.00" */
  amount?: string | number | null;
  currency?: string;
  dueDate?: Date | null;
  requiredBeforeWork?: boolean;
  stripeUrl?: string | null;
  stripeId?: string | null;
}

export async function createPaymentGate(data: CreatePaymentGateInput) {
  return prisma.paymentGate.create({
    data: {
      clientRelationshipId: data.clientRelationshipId,
      projectId: data.projectId ?? null,
      label: data.label,
      paymentType: data.paymentType ?? "FULL_UPFRONT",
      amount: data.amount ?? null,
      currency: data.currency ?? "USD",
      dueDate: data.dueDate ?? null,
      requiredBeforeWork: data.requiredBeforeWork ?? false,
      stripeUrl: data.stripeUrl ?? null,
      stripeId: data.stripeId ?? null,
    },
    select: { id: true },
  });
}

export type UpdatePaymentGateInput = Partial<
  Omit<CreatePaymentGateInput, "clientRelationshipId">
>;

export async function updatePaymentGate(
  id: string,
  relationshipId: string,
  data: UpdatePaymentGateInput,
) {
  return prisma.paymentGate.updateMany({
    where: { id, clientRelationshipId: relationshipId },
    data,
  });
}

export type PaymentGateListItem = Awaited<
  ReturnType<typeof listPaymentGates>
>[number];

export type PaymentGateDetail = NonNullable<
  Awaited<ReturnType<typeof getPaymentGate>>
>;
