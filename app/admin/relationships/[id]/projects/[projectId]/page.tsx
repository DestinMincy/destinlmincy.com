import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectStatusBadge } from "@/components/admin/ClientWorkStatusBadge";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdminForPage } from "@/lib/auth/require-admin";
import { clientWorkDateFormatter } from "@/lib/client-work/format";
import { getProject, getRelationshipIdentity } from "@/lib/client-work/queries";
import { listDeliverables, listMilestones } from "@/lib/milestones/queries";
import { listPaymentGates } from "@/lib/payment-gates/queries";
import {
  PAYMENT_GATE_STATUS_LABELS,
  PAYMENT_GATE_STATUS_TONE,
  formatPaymentGateAmount,
  isPaymentGateOverdue,
  isPaymentGateSatisfied,
} from "@/lib/payment-gates/types";
import {
  MILESTONE_STATUS_LABELS,
  MILESTONE_STATUS_TONE,
} from "@/lib/milestones/types";

export const metadata: Metadata = {
  title: "Project",
};

interface ProjectDetailPageProps {
  params: Promise<{ id: string; projectId: string }>;
}

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  await requireAdminForPage();

  const { id, projectId } = await params;
  const [relationship, project] = await Promise.all([
    getRelationshipIdentity(id),
    getProject(id, projectId),
  ]);

  if (!relationship || !project) {
    notFound();
  }

  const [milestones, deliverables, paymentGates] = await Promise.all([
    listMilestones(id, { projectId }),
    listDeliverables(id, { projectId }),
    listPaymentGates(id, { projectId }),
  ]);

  const now = new Date();
  const blockingGates = paymentGates.filter(
    (gate) => gate.requiredBeforeWork && !isPaymentGateSatisfied(gate.status),
  );

  return (
    <div className="container section section--tight admin-screen">
      <nav aria-label="Breadcrumb">
        <Link className="admin-breadcrumb" href={`/admin/relationships/${id}/projects`}>
          Projects
        </Link>
      </nav>

      <header className="admin-head">
        <div>
          <p className="eyebrow">{relationship.name}</p>
          <h1 className="admin-title">{project.name}</h1>
        </div>
        <div className="button-row">
          <Link
            className="button button--secondary button--compact"
            href={`/admin/relationships/${id}/projects/${projectId}/edit`}
          >
            Edit project
          </Link>
        </div>
      </header>

      <div className="admin-grid">
        <div className="admin-panel">
          <h2 className="admin-panel__title">Overview</h2>
          <dl className="admin-dl">
            <div>
              <dt>Status</dt>
              <dd>
                <ProjectStatusBadge status={project.status} />
              </dd>
            </div>
            {project.applicationSite ? (
              <div>
                <dt>App / site</dt>
                <dd>
                  <Link
                    href={`/admin/relationships/${id}/applications/${project.applicationSite.id}/edit`}
                  >
                    {project.applicationSite.name}
                  </Link>
                  {project.applicationSite.status === "ARCHIVED" ? (
                    <span className="admin-table__sub">Archived</span>
                  ) : null}
                </dd>
              </div>
            ) : null}
            {project.createsNewAsset ? (
              <div>
                <dt>Asset</dt>
                <dd>Creates a new asset</dd>
              </div>
            ) : null}
            <div>
              <dt>Start</dt>
              <dd>
                {project.startsAt ? (
                  clientWorkDateFormatter.format(project.startsAt)
                ) : (
                  <span className="admin-table__none">Not set</span>
                )}
              </dd>
            </div>
            <div>
              <dt>Target</dt>
              <dd>
                {project.targetDate ? (
                  clientWorkDateFormatter.format(project.targetDate)
                ) : (
                  <span className="admin-table__none">Not set</span>
                )}
              </dd>
            </div>
            <div>
              <dt>Updated</dt>
              <dd>{clientWorkDateFormatter.format(project.updatedAt)}</dd>
            </div>
          </dl>

          {project.summary ? (
            <div className="admin-summary">
              <h3 className="admin-panel__subtitle">Internal summary</h3>
              <p>{project.summary}</p>
            </div>
          ) : null}

          {project.clientDescription ? (
            <div className="admin-summary">
              <h3 className="admin-panel__subtitle">Client description</h3>
              <p>{project.clientDescription}</p>
            </div>
          ) : null}
        </div>

        <div style={{ display: "grid", gap: "18px" }}>
          <section className="admin-panel" aria-labelledby="quick-links-heading">
            <h2 className="admin-panel__title" id="quick-links-heading">
              Actions
            </h2>
            <ul className="admin-nav-list">
              <li>
                <Link
                  href={`/admin/relationships/${id}/projects/${projectId}/milestones/new`}
                >
                  Add milestone
                </Link>
              </li>
              <li>
                <Link
                  href={`/admin/relationships/${id}/projects/${projectId}/deliverables/new`}
                >
                  Add deliverable
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </div>

      <section
        className={`admin-panel${blockingGates.length > 0 ? " admin-panel--signal" : ""}`}
        aria-labelledby="payments-heading"
      >
        <div className="admin-panel__head">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <h2 className="admin-panel__title" id="payments-heading">
              Payments
            </h2>
            <Link
              className="button button--secondary button--compact"
              href={`/admin/relationships/${id}/payment-gates/new`}
            >
              Add payment gate
            </Link>
          </div>
          {blockingGates.length > 0 ? (
            <p className="admin-head__meta">
              {blockingGates.length === 1
                ? "1 required payment is unpaid. This project cannot start until it is paid or waived."
                : `${blockingGates.length} required payments are unpaid. This project cannot start until they are paid or waived.`}
            </p>
          ) : null}
        </div>

        {paymentGates.length === 0 ? (
          <p className="admin-empty__note">No payment gates on this project.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Label</th>
                  <th scope="col">Status</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Due</th>
                  <th scope="col">Stripe</th>
                </tr>
              </thead>
              <tbody>
                {paymentGates.map((gate) => {
                  const amount = formatPaymentGateAmount(gate.amount, gate.currency);
                  return (
                    <tr key={gate.id}>
                      <td>
                        <Link
                          href={`/admin/relationships/${id}/payment-gates/${gate.id}/edit`}
                        >
                          {gate.label}
                        </Link>
                        {gate.requiredBeforeWork ? (
                          <span className="admin-table__sub">Required before work</span>
                        ) : null}
                      </td>
                      <td>
                        <StatusBadge
                          status={gate.status}
                          label={PAYMENT_GATE_STATUS_LABELS[gate.status]}
                          tone={PAYMENT_GATE_STATUS_TONE[gate.status]}
                        />
                        {isPaymentGateOverdue(gate, now) ? (
                          <span className="admin-table__sub">Overdue</span>
                        ) : null}
                      </td>
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
                        {gate.stripeUrl ? (
                          <a href={gate.stripeUrl} target="_blank" rel="noreferrer">
                            {gate.stripeId || "Open link"}
                          </a>
                        ) : (
                          <span className="admin-table__none">Not attached</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-panel" aria-labelledby="milestones-heading">
        <div className="admin-panel__head">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <h2 className="admin-panel__title" id="milestones-heading">
              Milestones
            </h2>
            <Link
              className="button button--secondary button--compact"
              href={`/admin/relationships/${id}/projects/${projectId}/milestones`}
            >
              View all milestones
            </Link>
          </div>
        </div>

        {milestones.length === 0 ? (
          <p className="admin-empty__note">No milestones yet.</p>
        ) : (
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
                {milestones.map((milestone) => (
                  <tr key={milestone.id}>
                    <td>
                      <Link
                        href={`/admin/relationships/${id}/projects/${projectId}/milestones/${milestone.id}`}
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
                      {milestone.targetDate ? (
                        clientWorkDateFormatter.format(milestone.targetDate)
                      ) : (
                        <span className="admin-table__none">Not set</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-panel" aria-labelledby="deliverables-heading">
        <div className="admin-panel__head">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <h2 className="admin-panel__title" id="deliverables-heading">
              Deliverables
            </h2>
            <Link
              className="button button--secondary button--compact"
              href={`/admin/relationships/${id}/projects/${projectId}/deliverables/new`}
            >
              Add deliverable
            </Link>
          </div>
        </div>

        {deliverables.length === 0 ? (
          <p className="admin-empty__note">No deliverables yet.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Label</th>
                  <th scope="col">URL</th>
                  <th scope="col">Added</th>
                </tr>
              </thead>
              <tbody>
                {deliverables.map((deliverable) => (
                  <tr key={deliverable.id}>
                    <td>{deliverable.label}</td>
                    <td>
                      {deliverable.url ? (
                        <a
                          href={deliverable.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open link
                        </a>
                      ) : (
                        <span className="admin-table__none">No URL</span>
                      )}
                    </td>
                    <td>
                      {clientWorkDateFormatter.format(deliverable.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
