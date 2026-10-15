import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ProjectStatusBadge } from "@/components/admin/ClientWorkStatusBadge";
import { findClientMembershipByClerkUserId } from "@/lib/auth/client-membership";
import { listPortalProjects } from "@/lib/portal/queries";

export const metadata: Metadata = {
  title: "Projects",
};

const targetDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default async function PortalProjectsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/portal");

  const membership = await findClientMembershipByClerkUserId(userId);
  if (!membership) return null;

  const projects = await listPortalProjects(membership.clientRelationshipId);

  return (
    <div className="container section section--tight admin-screen">
      <header className="admin-head">
        <div>
          <p className="eyebrow">Projects</p>
          <h1 className="admin-title">Your projects</h1>
        </div>
      </header>

      {projects.length === 0 ? (
        <div className="admin-panel admin-empty">
          <p className="admin-empty__note">No active projects at the moment.</p>
        </div>
      ) : (
        <ul className="portal-work-list admin-panel">
          {projects.map((project) => (
            <li key={project.id}>
              <div>
                <Link
                  href={`/portal/projects/${project.id}`}
                  style={{ fontWeight: 750, textDecoration: "none", color: "var(--text)" }}
                >
                  {project.name}
                </Link>
                {project.clientDescription ? (
                  <p>{project.clientDescription}</p>
                ) : null}
                <ProjectStatusBadge
                  status={
                    project.status as Parameters<
                      typeof ProjectStatusBadge
                    >[0]["status"]
                  }
                />
              </div>
              {project.targetDate ? (
                <span style={{ whiteSpace: "nowrap" }}>
                  Target {targetDateFormatter.format(project.targetDate)}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
