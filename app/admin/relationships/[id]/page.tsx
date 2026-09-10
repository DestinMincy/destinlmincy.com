import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  attachClientUserAction,
  removeClientUserAction,
  updateLifecycleAction,
} from "@/app/admin/relationships/actions";
import { AttachClientUserForm } from "@/components/admin/AttachClientUserForm";
import { LifecycleControl } from "@/components/admin/LifecycleControl";
import { RemoveMembershipButton } from "@/components/admin/RemoveMembershipButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdminForPage } from "@/lib/auth/require-admin";
import { clientWorkDateFormatter } from "@/lib/client-work/format";
import { getRelationshipHubData } from "@/lib/client-work/hub-queries";
import { getClientRelationshipWithUsers } from "@/lib/relationships/queries";
import { relationshipDateFormatter } from "@/lib/relationships/format";
import {
  MILESTONE_STATUS_LABELS,
  MILESTONE_STATUS_TONE,
} from "@/lib/milestones/types";

export const metadata: Metadata = {
  title: "Client relationship",
};

interface RelationshipDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RelationshipDetailPage({
  params,
}: RelationshipDetailPageProps) {
  await requireAdminForPage();

  const { id } = await params;
  const [relationship, hubData] = await Promise.all([
    getClientRelationshipWithUsers(id),
    getRelationshipHubData(id),
  ]);

  if (!relationship || !hubData) {
    notFound();
  }

  const activeUsers = relationship.users.filter(
    (user) => user.status === "ACTIVE",
  );
  const removedUsers = relationship.users.filter(
    (user) => user.status === "REMOVED",
  );

  const {
    pendingPaymentGates,
    overdueMilestones,
    projectStatusCounts,
  } = hubData;

  const hasActionItems =
    pendingPaymentGates.length > 0 || overdueMilestones.length > 0;

  const projectDetailMap = projectStatusCounts.reduce<Record<string, number>>(
    (acc, row) => {
      acc[row.status] = row._count._all;
      return acc;
    },
    {},
  );

  const projectSummaryParts = Object.entries(projectDetailMap)
    .map(([status, count]) => `${count} ${status.toLowerCase().replace("_", " ")}`)
    .join(", ");

  return (
    <div className="container section section--tight admin-screen">
      <nav aria-label="Breadcrumb">
        <Link className="admin-breadcrumb" href="/admin/relationships">
          Client relationships
        </Link>
      </nav>

      <header className="admin-head">
        <div>
          <p className="eyebrow">Relationship</p>
          <h1 className="admin-title">{relationship.name}</h1>
          {relationship.legalName ? (
            <p className="admin-head__meta">{relationship.legalName}</p>
          ) : null}
        </div>
        <Link
          className="button button--secondary button--compact"
          href={`/admin/relationships/${relationship.id}/edit`}
        >
          Edit details
        </Link>
      </header>

      {/* Section navigation */}
      <nav
        aria-label="Sections"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          borderBottom: "1px solid var(--border)",
          paddingBottom: "16px",
        }}
      >
        {[
          { href: "#overview", label: "Overview" },
          { href: "#applications", label: "Applications" },
          { href: "#projects", label: "Projects" },
          { href: "#contracts", label: "Contracts" },
          { href: "#payment-gates", label: "Payment gates" },
          { href: "#users", label: "Users" },
        ].map(({ href, label }) => (
          <a
            key={href}
            href={href}
            style={{
              padding: "5px 12px",
              border: "1px solid var(--border)",
              background: "var(--surface-panel)",
              color: "var(--text-muted)",
              fontSize: "0.86rem",
              fontWeight: 650,
              textDecoration: "none",
            }}
          >
            {label}
          </a>
        ))}
      </nav>

      {/* Action items */}
      {hasActionItems ? (
        <section
          className="admin-panel"
          id="action-items"
          aria-labelledby="action-items-heading"
          style={{ borderColor: "var(--signal)" }}
        >
          <h2 className="admin-panel__title" id="action-items-heading">
            Action items
          </h2>

          {pendingPaymentGates.length > 0 ? (
            <div>
              <h3 className="admin-panel__subtitle">
                Pending payment gates ({pendingPaymentGates.length})
              </h3>
              <ul
                style={{
                  margin: "8px 0 0",
                  paddingLeft: "20px",
                  display: "grid",
                  gap: "4px",
                }}
              >
                {pendingPaymentGates.map((gate) => (
                  <li key={gate.id} style={{ fontSize: "0.96rem" }}>
                    <Link
                      href={`/admin/relationships/${id}/payment-gates`}
                    >
                      {gate.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {overdueMilestones.length > 0 ? (
            <div>
              <h3 className="admin-panel__subtitle">
                Overdue milestones ({overdueMilestones.length})
              </h3>
              <ul
                style={{
                  margin: "8px 0 0",
                  paddingLeft: "20px",
                  display: "grid",
                  gap: "4px",
                }}
              >
                {overdueMilestones.map((milestone) => (
                  <li key={milestone.id} style={{ fontSize: "0.96rem" }}>
                    <Link
                      href={`/admin/relationships/${id}/projects/${milestone.projectId}/milestones/${milestone.id}`}
                    >
                      {milestone.title}
                    </Link>
                    {milestone.targetDate ? (
                      <span className="admin-table__sub">
                        Target: {clientWorkDateFormatter.format(milestone.targetDate)}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* Overview */}
      <div className="admin-grid" id="overview">
        <div className="admin-panel">
          <h2 className="admin-panel__title">Status</h2>
          <LifecycleControl
            action={updateLifecycleAction.bind(null, relationship.id)}
            current={relationship.lifecycle}
          />
          {relationship.summary ? (
            <div className="admin-summary">
              <h3 className="admin-panel__subtitle">Notes</h3>
              <p>{relationship.summary}</p>
            </div>
          ) : null}
        </div>

        <div className="admin-panel">
          <h2 className="admin-panel__title">Contact</h2>
          <dl className="admin-dl">
            <div>
              <dt>Name</dt>
              <dd>
                {relationship.primaryContactName || (
                  <span className="admin-table__none">None</span>
                )}
              </dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>
                {relationship.primaryContactEmail ? (
                  <a href={`mailto:${relationship.primaryContactEmail}`}>
                    {relationship.primaryContactEmail}
                  </a>
                ) : (
                  <span className="admin-table__none">None</span>
                )}
              </dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>
                {relationship.primaryContactPhone || (
                  <span className="admin-table__none">None</span>
                )}
              </dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>{relationshipDateFormatter.format(relationship.createdAt)}</dd>
            </div>
            <div>
              <dt>Updated</dt>
              <dd>{relationshipDateFormatter.format(relationship.updatedAt)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Section summaries */}
      <section className="admin-panel" id="applications" aria-labelledby="applications-heading">
        <div className="admin-panel__head">
          <h2 className="admin-panel__title" id="applications-heading">
            Applications and sites
          </h2>
        </div>
        <div className="admin-work-links">
          <Link href={`/admin/relationships/${id}/applications`}>
            <span>Active applications and sites</span>
            <strong>{hubData.relationship._count.applications}</strong>
          </Link>
          <Link href={`/admin/relationships/${id}/applications/new`}>
            <span>Add new application or site</span>
            <strong>+</strong>
          </Link>
        </div>
      </section>

      <section className="admin-panel" id="projects" aria-labelledby="projects-heading">
        <div className="admin-panel__head">
          <h2 className="admin-panel__title" id="projects-heading">
            Projects
          </h2>
          {projectSummaryParts ? (
            <p className="admin-head__meta">{projectSummaryParts}</p>
          ) : null}
        </div>
        <div className="admin-work-links">
          <Link href={`/admin/relationships/${id}/projects`}>
            <span>Active projects</span>
            <strong>{hubData.relationship._count.projects}</strong>
          </Link>
          <Link href={`/admin/relationships/${id}/projects/new`}>
            <span>Add new project</span>
            <strong>+</strong>
          </Link>
        </div>
      </section>

      <section className="admin-panel" id="contracts" aria-labelledby="contracts-heading">
        <div className="admin-panel__head">
          <h2 className="admin-panel__title" id="contracts-heading">
            Contracts
          </h2>
        </div>
        <div className="admin-work-links">
          <Link href={`/admin/relationships/${id}/contracts`}>
            <span>Contract templates</span>
            <strong>{hubData.relationship._count.contractTemplates}</strong>
          </Link>
          <Link href={`/admin/relationships/${id}/contracts/templates/new`}>
            <span>New template</span>
            <strong>+</strong>
          </Link>
        </div>
      </section>

      <section className="admin-panel" id="payment-gates" aria-labelledby="payment-gates-heading">
        <div className="admin-panel__head">
          <h2 className="admin-panel__title" id="payment-gates-heading">
            Payment gates
          </h2>
          {pendingPaymentGates.length > 0 ? (
            <p className="admin-head__meta">
              {pendingPaymentGates.length} pending
            </p>
          ) : null}
        </div>
        <div className="admin-work-links">
          <Link href={`/admin/relationships/${id}/payment-gates`}>
            <span>All payment gates</span>
            <strong>{hubData.relationship._count.paymentGates}</strong>
          </Link>
          <Link href={`/admin/relationships/${id}/payment-gates/new`}>
            <span>Add payment gate</span>
            <strong>+</strong>
          </Link>
        </div>
      </section>

      {/* Milestones */}
      {overdueMilestones.length > 0 ? (
        <section className="admin-panel" aria-labelledby="milestones-summary-heading">
          <h2 className="admin-panel__title" id="milestones-summary-heading">
            Overdue milestones
          </h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Title</th>
                  <th scope="col">Status</th>
                  <th scope="col">Target date</th>
                </tr>
              </thead>
              <tbody>
                {overdueMilestones.map((milestone) => (
                  <tr key={milestone.id}>
                    <td>
                      <Link
                        href={`/admin/relationships/${id}/projects/${milestone.projectId}/milestones/${milestone.id}`}
                      >
                        {milestone.title}
                      </Link>
                    </td>
                    <td>
                      <StatusBadge
                        status={milestone.status}
                        label={MILESTONE_STATUS_LABELS[milestone.status]}
                        tone={MILESTONE_STATUS_TONE[milestone.status]}
                      />
                    </td>
                    <td>
                      {milestone.targetDate
                        ? clientWorkDateFormatter.format(milestone.targetDate)
                        : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {/* Client users */}
      <section
        className="admin-panel"
        id="users"
        aria-labelledby="client-users-heading"
      >
        <div className="admin-panel__head">
          <h2 className="admin-panel__title" id="client-users-heading">
            Client users
          </h2>
          <p className="admin-head__meta">
            People with portal access to this relationship.
          </p>
        </div>

        {activeUsers.length === 0 ? (
          <p className="admin-empty__note">
            No client users attached yet. Attach an account below to grant
            portal access.
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Email</th>
                  <th scope="col">Name</th>
                  <th scope="col">Added</th>
                  <th scope="col">
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {activeUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td>
                      {user.name || (
                        <span className="admin-table__none">None</span>
                      )}
                    </td>
                    <td>{relationshipDateFormatter.format(user.createdAt)}</td>
                    <td className="admin-table__actions">
                      <RemoveMembershipButton
                        action={removeClientUserAction.bind(
                          null,
                          relationship.id,
                          user.id,
                        )}
                        label={
                          user.name
                            ? `${user.name} (${user.email})`
                            : user.email
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {removedUsers.length > 0 ? (
          <p className="admin-empty__note">
            Removed:{" "}
            {removedUsers.map((user) => user.email).join(", ")}. Re-attach an
            email to restore access.
          </p>
        ) : null}

        <AttachClientUserForm
          action={attachClientUserAction.bind(null, relationship.id)}
        />
      </section>
    </div>
  );
}
