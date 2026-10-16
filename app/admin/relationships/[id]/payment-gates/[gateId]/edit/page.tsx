import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PaymentGateForm } from "@/components/admin/PaymentGateForm";
import { requireAdminForPage } from "@/lib/auth/require-admin";
import { dateToInputValue } from "@/lib/client-work/format";
import { getRelationshipIdentity, listProjects } from "@/lib/client-work/queries";
import { updatePaymentGateAction } from "@/lib/payment-gates/actions";
import { getPaymentGate } from "@/lib/payment-gates/queries";

export const metadata: Metadata = {
  title: "Edit payment gate",
};

interface EditPaymentGatePageProps {
  params: Promise<{ id: string; gateId: string }>;
}

export default async function EditPaymentGatePage({
  params,
}: EditPaymentGatePageProps) {
  await requireAdminForPage();

  const { id, gateId } = await params;
  const [relationship, gate, projects] = await Promise.all([
    getRelationshipIdentity(id),
    getPaymentGate(id, gateId),
    listProjects(id),
  ]);

  if (!relationship || !gate) {
    notFound();
  }

  // Archived projects stay selectable only when the gate already points at one.
  const projectOptions = projects
    .filter((p) => p.status !== "ARCHIVED" || p.id === gate.projectId)
    .map((p) => ({ id: p.id, name: p.name }));

  return (
    <div className="container section section--tight narrow admin-screen">
      <nav aria-label="Breadcrumb">
        <Link
          className="admin-breadcrumb"
          href={`/admin/relationships/${id}/payment-gates`}
        >
          Payment gates
        </Link>
      </nav>

      <header>
        <p className="eyebrow">{relationship.name}</p>
        <h1 className="admin-title">{gate.label}</h1>
      </header>

      <div className="admin-panel">
        <PaymentGateForm
          action={updatePaymentGateAction.bind(null, id, gateId)}
          initialValues={{
            label: gate.label,
            projectId: gate.projectId ?? "",
            status: gate.status,
            paymentType: gate.paymentType,
            amount: gate.amount ? gate.amount.toString() : "",
            currency: gate.currency,
            dueDate: dateToInputValue(gate.dueDate),
            requiredBeforeWork: gate.requiredBeforeWork,
            stripeUrl: gate.stripeUrl ?? "",
            stripeId: gate.stripeId ?? "",
          }}
          projects={projectOptions}
          submitLabel="Save payment gate"
        />
      </div>
    </div>
  );
}
