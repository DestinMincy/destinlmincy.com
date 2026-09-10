import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdminForPage } from "@/lib/auth/require-admin";
import { clientWorkDateFormatter } from "@/lib/client-work/format";
import { getProject, getRelationshipIdentity } from "@/lib/client-work/queries";
import { listMilestones } from "@/lib/milestones/queries";
import {
  MILESTONE_STATUS_LABELS,
  MILESTONE_STATUS_TONE,
} from "@/lib/milestones/types";

export const metadata: Metadata = {
  title: "Milestones",
};

interface MilestonesPageProps {
  params: Promise<{ id: string; projectId: string }>;
}

export default async function MilestonesPage({ params }: MilestonesPageProps) {
  await requireAdminForPage();

  const { id, projectId } = await params;
  const [relationship, project] = await Promise.all([
    getRelationshipIdentity(id),
    getProject(id, projectId),
  ]);

  if (!relationship || !project) {
    notFound();
  }

  const milestones = await listMilestones(id, projectId);

  return (
    <div className="container section section--tight admin-screen">
      <nav aria-label="Breadcrumb">
        <Link
          className="admin-breadcrumb"
          href={`/admin/relationships/${id}/projects/${projectId}`}
        >
          {project.name}
        </Link>
      </nav>

      <header className="admin-head">
        <div>
          <p className="eyebrow">Milestones</p>
          <h1 className="admin-title">
            {milestones.length === 1
              ? "1 milestone"
              : `${milestones.length} milestones`}
          </h1>
        </div>
        <Link
          className="button button--primary"
          href={`/admin/relationships/${id}/projects/${projectId}/milestones/new`}
        >
          Add milestone
        </Link>
      </header>

      {milestones.length === 0 ? (
        <div className="admin-panel admin-empty">
          <h2>No milestones yet</h2>
          <p>
            Milestones give clients operational visibility into the project.
            Add one to start tracking progress.
          </p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Title</th>
                <th scope="col">Status</th>
                <th scope="col">Target date</th>
                <th scope="col">Deliverables</th>
                <th scope="col">Updated</th>
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
                  <td>{milestone._count.deliverables}</td>
                  <td>{clientWorkDateFormatter.format(milestone.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
