import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdminForPage } from "@/lib/auth/require-admin";
import { clientWorkDateFormatter } from "@/lib/client-work/format";
import { getRelationshipIdentity } from "@/lib/client-work/queries";
import { listPaymentGates } from "@/lib/payment-gates/queries";
import {
  PAYMENT_GATE_STATUS_LABELS,
  PAYMENT_GATE_STATUS_TONE,
  PAYMENT_GATE_TYPE_LABELS,
  formatPaymentGateAmount,
  isPaymentGateOverdue,
} from "@/lib/payment-gates/types";

export const metadata: Metadata = {
  title: "Payment gates",
};

interface PaymentGatesPageProps {
  params: Promise<{ id: string }>;
}

export default async function PaymentGatesPage({
  params,
}: PaymentGatesPageProps) {
  await requireAdminForPage();

  const { id } = await params;
  const [relationship, paymentGates] = await Promise.all([
    getRelationshipIdentity(id),
    listPaymentGates(id),
  ]);

  if (!relationship) {
    notFound();
  }

  const now = new Date();

  return (
    <div className="container section section--tight admin-screen">
      <nav aria-label="Breadcrumb">
        <Link className="admin-breadcrumb" href={`/admin/relationships/${id}`}>
          {relationship.name}
        </Link>
      </nav>

      <header className="admin-head">
        <div>
          <p className="eyebrow">Payment gates</p>
          <h1 className="admin-title">
            {paymentGates.length === 1
              ? "1 payment gate"
              : `${paymentGates.length} payment gates`}
          </h1>
        </div>
        <Link
          className="button button--primary"
          href={`/admin/relationships/${id}/payment-gates/new`}
        >
          Add payment gate
        </Link>
      </header>

      {paymentGates.length === 0 ? (
        <div className="admin-panel admin-empty">
          <h2>No payment gates yet</h2>
          <p>
            Payment gates link Stripe invoices or payment links to project
            contract terms. Add one to track required payments.
          </p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Label</th>
                <th scope="col">Status</th>
                <th scope="col">Type</th>
                <th scope="col">Amount</th>
                <th scope="col">Due</th>
                <th scope="col">Project</th>
                <th scope="col">Stripe</th>
                <th scope="col">
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {paymentGates.map((gate) => {
                const overdue = isPaymentGateOverdue(gate, now);
                const amount = formatPaymentGateAmount(gate.amount, gate.currency);
                return (
                  <tr key={gate.id}>
                    <td>
                      <strong>{gate.label}</strong>
                      {gate.requiredBeforeWork ? (
                        <p className="admin-table__sub">Required before work</p>
                      ) : null}
                    </td>
                    <td>
                      <StatusBadge
                        status={gate.status}
                        label={PAYMENT_GATE_STATUS_LABELS[gate.status]}
                        tone={PAYMENT_GATE_STATUS_TONE[gate.status]}
                      />
                      {overdue ? (
                        <p className="admin-table__sub">Overdue</p>
                      ) : null}
                    </td>
                    <td>{PAYMENT_GATE_TYPE_LABELS[gate.paymentType]}</td>
                    <td>
                      {amount ?? <span className="admin-table__none">Not set</span>}
                    </td>
                    <td>
                      {gate.dueDate ? (
                        clientWorkDateFormatter.format(gate.dueDate)
                      ) : (
                        <span className="admin-table__none">Not set</span>
                      )}
                    </td>
                    <td>
                      {gate.project ? (
                        <Link
                          href={`/admin/relationships/${id}/projects/${gate.project.id}`}
                        >
                          {gate.project.name}
                        </Link>
                      ) : (
                        <span className="admin-table__none">None</span>
                      )}
                    </td>
                    <td>
                      {gate.stripeUrl ? (
                        <a href={gate.stripeUrl} target="_blank" rel="noreferrer">
                          {gate.stripeId || "Open link"}
                        </a>
                      ) : (
                        <span className="admin-table__none">Not attached</span>
                      )}
                    </td>
                    <td className="admin-table__actions">
                      <Link
                        className="button button--secondary button--compact"
                        href={`/admin/relationships/${id}/payment-gates/${gate.id}/edit`}
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
