import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdminForPage } from "@/lib/auth/require-admin";
import { clientWorkDateFormatter } from "@/lib/client-work/format";
import { getRelationshipIdentity } from "@/lib/client-work/queries";
import { prisma } from "@/lib/db/client";

export const metadata: Metadata = {
  title: "Subscriptions",
};

const SERVICE_TYPE_LABELS: Record<string, string> = {
  HOSTING: "Hosting",
  MAINTENANCE: "Maintenance",
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  PAST_DUE: "Past due",
  CANCELED: "Canceled",
  PAUSED: "Paused",
  OVERRIDDEN: "Admin override",
};

const STATUS_TONE: Record<
  string,
  "signal" | "success" | "muted" | "accent" | "neutral"
> = {
  ACTIVE: "success",
  PAST_DUE: "signal",
  CANCELED: "muted",
  PAUSED: "neutral",
  OVERRIDDEN: "accent",
};

interface SubscriptionsPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminSubscriptionsPage({
  params,
}: SubscriptionsPageProps) {
  await requireAdminForPage();

  const { id } = await params;

  const [relationship, subscriptions] = await Promise.all([
    getRelationshipIdentity(id),
    prisma.subscriptionReference.findMany({
      where: { clientRelationshipId: id },
      orderBy: { createdAt: "desc" },
      include: {
        applicationSite: { select: { name: true } },
        project: { select: { name: true } },
      },
    }),
  ]);

  if (!relationship) {
    notFound();
  }

  return (
    <div className="container section section--tight admin-screen">
      <nav aria-label="Breadcrumb">
        <Link className="admin-breadcrumb" href={`/admin/relationships/${id}`}>
          {relationship.name}
        </Link>
      </nav>

      <header className="admin-head">
        <div>
          <p className="eyebrow">Subscriptions</p>
          <h1 className="admin-title">
            {subscriptions.length === 1
              ? "1 subscription"
              : `${subscriptions.length} subscriptions`}
          </h1>
        </div>
        <Link
          className="button button--primary"
          href={`/admin/relationships/${id}/subscriptions/new`}
        >
          New subscription
        </Link>
      </header>

      <div className="admin-panel">
        <p className="admin-head__meta">
          Hosting and maintenance subscriptions track ongoing service access.
          Set status to <strong>Admin override</strong> to manually extend or
          cut off access outside of normal billing.
        </p>
      </div>

      {subscriptions.length === 0 ? (
        <div className="admin-panel admin-empty">
          <p className="admin-empty__note">
            No subscriptions yet. Add one to track hosting or maintenance
            service access.
          </p>
        </div>
      ) : (
        <div className="admin-panel">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Service</th>
                  <th scope="col">Status</th>
                  <th scope="col">Linked to</th>
                  <th scope="col">Period ends</th>
                  <th scope="col">Clerk ID</th>
                  <th scope="col">
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => (
                  <tr key={sub.id}>
                    <td>
                      {SERVICE_TYPE_LABELS[sub.serviceType] ?? sub.serviceType}
                    </td>
                    <td>
                      <StatusBadge
                        status={sub.status}
                        label={STATUS_LABELS[sub.status] ?? sub.status}
                        tone={STATUS_TONE[sub.status] ?? "neutral"}
                      />
                    </td>
                    <td>
                      {sub.applicationSite?.name
                        ? `App: ${sub.applicationSite.name}`
                        : sub.project?.name
                          ? `Project: ${sub.project.name}`
                          : "—"}
                    </td>
                    <td>
                      {sub.currentPeriodEndsAt
                        ? clientWorkDateFormatter.format(
                            sub.currentPeriodEndsAt,
                          )
                        : "—"}
                    </td>
                    <td>
                      <code style={{ fontSize: "0.8rem" }}>
                        {sub.clerkSubscriptionId ?? "—"}
                      </code>
                    </td>
                    <td className="admin-table__actions">
                      <Link
                        href={`/admin/relationships/${id}/subscriptions/${sub.id}/edit`}
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
