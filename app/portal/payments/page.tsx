import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { findClientMembershipByClerkUserId } from "@/lib/auth/client-membership";
import { listPortalPaymentGates } from "@/lib/portal/queries";

export const metadata: Metadata = {
  title: "Payments",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  ATTACHED: "Invoice sent",
  PAID: "Paid",
  WAIVED: "Waived",
};

const PAYMENT_STATUS_TONE: Record<string, string> = {
  PENDING: "signal",
  ATTACHED: "accent",
  PAID: "success",
  WAIVED: "muted",
};

const portalDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default async function PortalPaymentsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/portal");

  const membership = await findClientMembershipByClerkUserId(userId);
  if (!membership) return null;

  const payments = await listPortalPaymentGates(membership.clientRelationshipId);

  return (
    <div className="container section section--tight admin-screen">
      <header className="admin-head">
        <div>
          <p className="eyebrow">Payments</p>
          <h1 className="admin-title">Project payments</h1>
        </div>
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
                  <th scope="col">Status</th>
                  <th scope="col">Created</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => {
                  const tone =
                    PAYMENT_STATUS_TONE[payment.status] ?? "neutral";
                  const label =
                    PAYMENT_STATUS_LABELS[payment.status] ?? payment.status;
                  return (
                    <tr key={payment.id}>
                      <td>
                        <strong>{payment.label}</strong>
                      </td>
                      <td>
                        <span className={`status-mark status-mark--${tone}`}>
                          {label}
                        </span>
                      </td>
                      <td>
                        {portalDateFormatter.format(payment.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="admin-empty__note">
            Payment links are sent by email when your invoice is ready. Contact
            us if you have questions about a payment.
          </p>
        </div>
      )}
    </div>
  );
}
