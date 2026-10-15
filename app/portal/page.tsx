import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { findClientMembershipByClerkUserId } from "@/lib/auth/client-membership";
import {
  getPortalActionItems,
  listPortalContracts,
  listPortalPaymentGates,
  listPortalProjects,
  listPortalSubscriptions,
} from "@/lib/portal/queries";

export const metadata: Metadata = {
  title: "Client Portal",
};

export default async function PortalPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect_url=/portal");
  }

  const membership = await findClientMembershipByClerkUserId(userId);

  if (!membership) {
    return null; // layout handles the no-membership state
  }

  const { clientRelationshipId, clientRelationshipName } = membership;

  const [actionItems, contracts, payments, subscriptions, projects] =
    await Promise.all([
      getPortalActionItems(clientRelationshipId),
      listPortalContracts(clientRelationshipId),
      listPortalPaymentGates(clientRelationshipId),
      listPortalSubscriptions(clientRelationshipId),
      listPortalProjects(clientRelationshipId),
    ]);

  const hasPendingPayments = actionItems.pendingPayments > 0;
  const hasActionItems = hasPendingPayments;

  return (
    <div className="container section section--tight admin-screen">
      <header className="admin-head">
        <div>
          <p className="eyebrow">Overview</p>
          <h1 className="admin-title">Welcome back</h1>
          <p className="admin-head__meta">{clientRelationshipName}</p>
        </div>
      </header>

      {hasActionItems ? (
        <section
          className="admin-panel portal-action-panel"
          aria-labelledby="portal-actions-heading"
        >
          <h2 className="admin-panel__title" id="portal-actions-heading">
            Needs your attention
          </h2>
          <ul className="portal-work-list">
            {hasPendingPayments ? (
              <li>
                <div>
                  <strong>Payment required</strong>
                  <span>
                    {actionItems.pendingPayments === 1
                      ? "1 payment is waiting"
                      : `${actionItems.pendingPayments} payments are waiting`}
                  </span>
                </div>
                <Link
                  href="/portal/payments"
                  className="button button--primary button--compact"
                >
                  View payments
                </Link>
              </li>
            ) : null}
          </ul>
        </section>
      ) : null}

      <div className="portal-stat-grid">
        <Link href="/portal/contracts" className="portal-stat">
          <span className="portal-stat__count">{contracts.length}</span>
          <span className="portal-stat__label">Contracts</span>
        </Link>
        <Link href="/portal/payments" className="portal-stat">
          <span className="portal-stat__count">{payments.length}</span>
          <span className="portal-stat__label">Payments</span>
        </Link>
        <Link href="/portal/subscriptions" className="portal-stat">
          <span className="portal-stat__count">{subscriptions.length}</span>
          <span className="portal-stat__label">Subscriptions</span>
        </Link>
        <Link href="/portal/projects" className="portal-stat">
          <span className="portal-stat__count">{projects.length}</span>
          <span className="portal-stat__label">Projects</span>
        </Link>
      </div>
    </div>
  );
}
