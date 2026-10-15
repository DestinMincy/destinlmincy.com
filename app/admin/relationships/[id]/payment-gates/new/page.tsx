import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PaymentGateForm } from "@/components/admin/PaymentGateForm";
import { requireAdminForPage } from "@/lib/auth/require-admin";
import { getRelationshipIdentity, listProjects } from "@/lib/client-work/queries";
import { createPaymentGateAction } from "@/lib/payment-gates/actions";
import { EMPTY_PAYMENT_GATE_FORM_VALUES } from "@/lib/payment-gates/types";

export const metadata: Metadata = {
  title: "New payment gate",
};

interface NewPaymentGatePageProps {
  params: Promise<{ id: string }>;
}

export default async function NewPaymentGatePage({
  params,
}: NewPaymentGatePageProps) {
  await requireAdminForPage();

  const { id } = await params;
  const [relationship, projects] = await Promise.all([
    getRelationshipIdentity(id),
    listProjects(id),
  ]);

  if (!relationship) {
    notFound();
  }

  const activeProjects = projects
    .filter((p) => p.status !== "ARCHIVED")
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
        <h1 className="admin-title">New payment gate</h1>
      </header>

      <div className="admin-panel">
        <PaymentGateForm
          action={createPaymentGateAction.bind(null, id)}
          initialValues={EMPTY_PAYMENT_GATE_FORM_VALUES}
          projects={activeProjects}
          submitLabel="Add payment gate"
        />
      </div>
    </div>
  );
}
