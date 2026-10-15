import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ProjectStatusBadge } from "@/components/admin/ClientWorkStatusBadge";
import { ApprovalForm } from "@/components/portal/ApprovalForm";
import { MilestoneStatusBadge } from "@/components/portal/MilestoneStatusBadge";
import { findClientMembershipByClerkUserId } from "@/lib/auth/client-membership";
import type { MilestoneStatus } from "@/lib/generated/prisma/enums";
import { getPortalProjectDetail } from "@/lib/portal/queries";

export const metadata: Metadata = {
  title: "Project",
};

interface ProjectDetailPageProps {
  params: Promise<{ projectId: string }>;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default async function PortalProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/portal");

  const membership = await findClientMembershipByClerkUserId(userId);
  if (!membership) return null;

  const { projectId } = await params;
  const project = await getPortalProjectDetail(
    projectId,
    membership.clientRelationshipId,
  );

  if (!project) {
    notFound();
  }

  const { clientRelationshipId } = membership;

  return (
    <div className="container section section--tight admin-screen">
      <nav aria-label="Breadcrumb">
        <Link className="admin-breadcrumb" href="/portal/projects">
          Projects
        </Link>
      </nav>

      <header className="admin-head">
        <div>
          <p className="eyebrow">Project</p>
          <h1 className="admin-title">{project.name}</h1>
          <ProjectStatusBadge
            status={
              project.status as Parameters<typeof ProjectStatusBadge>[0]["status"]
            }
          />
        </div>
      </header>

      {project.clientDescription || project.targetDate ? (
        <div className="admin-panel">
          {project.clientDescription ? (
            <p>{project.clientDescription}</p>
          ) : null}
          {project.targetDate ? (
            <p className="admin-head__meta">
              Target date: {dateFormatter.format(project.targetDate)}
            </p>
          ) : null}
        </div>
      ) : null}

      <section
        className="admin-panel admin-screen"
        aria-labelledby="milestones-heading"
      >
        <h2 className="admin-panel__title" id="milestones-heading">
          Milestones
        </h2>

        {project.milestones.length === 0 ? (
          <p className="admin-empty__note">No milestones yet.</p>
        ) : (
          <ol className="portal-milestone-list">
            {project.milestones.map((milestone, index) => (
              <li key={milestone.id} className="portal-milestone">
                <div className="portal-milestone__head">
                  <span className="portal-milestone__num">{index + 1}</span>
                  <div className="portal-milestone__meta">
                    <strong className="portal-milestone__title">
                      {milestone.title}
                    </strong>
                    <MilestoneStatusBadge
                      status={milestone.status as MilestoneStatus}
                    />
                  </div>
                  {milestone.targetDate ? (
                    <span className="portal-milestone__date">
                      {dateFormatter.format(milestone.targetDate)}
                    </span>
                  ) : null}
                </div>

                {milestone.clientFacingUpdate ? (
                  <p className="portal-milestone__update">
                    {milestone.clientFacingUpdate}
                  </p>
                ) : null}

                {milestone.deliverables.length > 0 ? (
                  <ul className="portal-deliverables">
                    {milestone.deliverables.map((d) => (
                      <li key={d.id}>
                        {d.url ? (
                          <a
                            href={d.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {d.label}
                          </a>
                        ) : (
                          <span>{d.label}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : null}

                {milestone.approvalRequired &&
                milestone.status !== "COMPLETE" ? (
                  <div className="portal-milestone__approval">
                    <p className="portal-milestone__approval-note">
                      Your approval is required to proceed.
                    </p>
                    <ApprovalForm
                      milestoneId={milestone.id}
                      clientRelationshipId={clientRelationshipId}
                    />
                  </div>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </section>

      {project.deliverables.length > 0 ? (
        <section
          className="admin-panel admin-screen"
          aria-labelledby="deliverables-heading"
        >
          <h2 className="admin-panel__title" id="deliverables-heading">
            Deliverables
          </h2>
          <ul className="portal-deliverables">
            {project.deliverables.map((d) => (
              <li key={d.id}>
                {d.url ? (
                  <a href={d.url} target="_blank" rel="noreferrer">
                    {d.label}
                  </a>
                ) : (
                  <span>{d.label}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
