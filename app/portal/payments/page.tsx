import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { findClientMembershipByClerkUserId } from "@/lib/auth/client-membership";
import {
  formatPaymentGateAmount,
  isPaymentGateOverdue,
  isPaymentGateSatisfied,
  type PaymentGateStatus,
} from "@/lib/payment-gates/types";
import { listPortalPaymentGates } from "@/lib/portal/queries";

export const metadata: Metadata = {
  title: "Payments",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Payment required",
  ATTACHED: "Payment required",
  PAID: "Paid",
  WAIVED: "Waived",
};

const PAYMENT_STATUS_TONE: Record<string, string> = {
  PENDING: "signal",
  ATTACHED: "signal",
  PAID: "success",
  WAIVED: "muted",
};

const portalDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export default async function PortalPaymentsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/portal");

  const membership = await findClientMembershipByClerkUserId(userId);
  if (!membership) return null;

  const payments = await listPortalPaymentGates(membership.clientRelationshipId);
  const now = new Date();
  const openCount = payments.filter(
    (payment) => !isPaymentGateSatisfied(payment.status as PaymentGateStatus),
  ).length;

  return (
    <div className="container section section--tight admin-screen">
      <header className="admin-head">
        <div>
          <p className="eyebrow">Payments</p>
          <h1 className="admin-title">Project payments</h1>
        </div>
        {openCount > 0 ? (
          <p className="admin-head__meta">
            {openCount === 1 ? "1 payment open" : `${openCount} payments open`}
          </p>
        ) : null}
      </header>

      {payments.length === 0 ? (
        <div className="admin-panel admin-empty">
          <p className="admin-empty__note">No payment records on file yet.</p>
        </div>
      ) : (
        <div className="admin-panel">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Description</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Due</th>
                  <th scope="col">Status</th>
                  <th scope="col">
                    <span className="visually-hidden">Pay</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => {
                  const status = payment.status as PaymentGateStatus;
                  const overdue = isPaymentGateOverdue(
                    { status, dueDate: payment.dueDate },
                    now,
                  );
                  const tone = overdue
                    ? "signal"
                    : (PAYMENT_STATUS_TONE[payment.status] ?? "neutral");
                  const label = overdue
                    ? "Overdue"
                    : (PAYMENT_STATUS_LABELS[payment.status] ?? payment.status);
                  const amount = formatPaymentGateAmount(
                    payment.amount,
                    payment.currency,
                  );
                  return (
                    <tr key={payment.id}>
                      <td>
                        <strong>{payment.label}</strong>
                        {payment.projectName ? (
                          <span className="admin-table__sub">
                            {payment.projectName}
                          </span>
                        ) : null}
                        {payment.requiredBeforeWork &&
                        !isPaymentGateSatisfied(status) ? (
                          <span className="admin-table__sub">
                            Work starts after this payment clears
                          </span>
                        ) : null}
                      </td>
                      <td>
                        {amount ?? (
                          <span className="admin-table__none">See invoice</span>
                        )}
                      </td>
                      <td>
                        {payment.dueDate ? (
                          portalDateFormatter.format(payment.dueDate)
                        ) : (
                          <span className="admin-table__none">No due date</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-mark status-mark--${tone}`}>
                          {label}
                        </span>
                      </td>
                      <td className="admin-table__actions">
                        {payment.payUrl ? (
                          <a
                            className="button button--primary button--compact"
                            href={payment.payUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Pay with Stripe
                          </a>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="admin-empty__note">
            Payments run through Stripe. If a payment is listed without a link,
            the invoice is on its way by email. Contact us with any questions
            about a payment.
          </p>
        </div>
      )}
    </div>
  );
}
