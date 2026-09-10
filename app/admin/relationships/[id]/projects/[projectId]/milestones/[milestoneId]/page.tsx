import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdminForPage } from "@/lib/auth/require-admin";
import { clientWorkDateFormatter } from "@/lib/client-work/format";
import { getProject, getRelationshipIdentity } from "@/lib/client-work/queries";
import { getMilestone } from "@/lib/milestones/queries";
import {
  MILESTONE_STATUS_LABELS,
  MILESTONE_STATUS_TONE,
} from "@/lib/milestones/types";

export const metadata: Metadata = {
  title: "Milestone",
};

interface MilestoneDetailPageProps {
  params: Promise<{ id: string; projectId: string; milestoneId: string }>;
}

export default async function MilestoneDetailPage({
  params,
}: MilestoneDetailPageProps) {
  await requireAdminForPage();

  const { id, projectId, milestoneId } = await params;
  const [relationship, project] = await Promise.all([
    getRelationshipIdentity(id),
    getProject(id, projectId),
  ]);

  if (!relationship || !project) {
    notFound();
  }

  const milestone = await getMilestone(id, projectId, milestoneId);

  if (!milestone) {
    notFound();
  }

  return (
    <div className="container section section--tight admin-screen">
      <nav aria-label="Breadcrumb">
        <Link
          className="admin-breadcrumb"
          href={`/admin/relationships/${id}/projects/${projectId}/milestones`}
        >
          Milestones
        </Link>
      </nav>

      <header className="admin-head">
        <div>
          <p className="eyebrow">{project.name}</p>
          <h1 className="admin-title">{milestone.title}</h1>
        </div>
        <div className="button-row">
          <Link
            className="button button--secondary button--compact"
            href={`/admin/relationships/${id}/projects/${projectId}/deliverables/new`}
          >
            Add deliverable
          </Link>
        </div>
      </header>

      <div className="admin-grid">
        <div className="admin-panel">
          <h2 className="admin-panel__title">Details</h2>
          <dl className="admin-dl">
            <div>
              <dt>Status</dt>
              <dd>
                <StatusBadge
                  status={milestone.status}
                  label={MILESTONE_STATUS_LABELS[milestone.status]}
                  tone={MILESTONE_STATUS_TONE[milestone.status]}
                />
              </dd>
            </div>
            <div>
              <dt>Target</dt>
              <dd>
                {milestone.targetDate ? (
                  clientWorkDateFormatter.format(milestone.targetDate)
                ) : (
                  <span className="admin-table__none">Not set</span>
                )}
              </dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>{clientWorkDateFormatter.format(milestone.createdAt)}</dd>
            </div>
            <div>
              <dt>Updated</dt>
              <dd>{clientWorkDateFormatter.format(milestone.updatedAt)}</dd>
            </div>
          </dl>
        </div>

        <div className="admin-panel">
          <h2 className="admin-panel__title">Project</h2>
          <dl className="admin-dl">
            <div>
              <dt>Project</dt>
              <dd>
                <Link
                  href={`/admin/relationships/${id}/projects/${projectId}`}
                >
                  {project.name}
                </Link>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <section
        className="admin-panel"
        aria-labelledby="deliverables-heading"
      >
        <div className="admin-panel__head">
          <h2 className="admin-panel__title" id="deliverables-heading">
            Deliverables
          </h2>
        </div>

        {milestone.deliverables.length === 0 ? (
          <p className="admin-empty__note">No deliverables on this milestone.</p>
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
                {milestone.deliverables.map((deliverable) => (
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

      <section
        className="admin-panel admin-empty"
        aria-labelledby="approvals-heading"
      >
        <h2 className="admin-panel__title" id="approvals-heading">
          Approval history
        </h2>
        <p>
          Approval tracking requires an approval history model. This section
          will show client approvals and change requests once the backend
          implements the MilestoneApproval table.
        </p>
      </section>
    </div>
  );
}
