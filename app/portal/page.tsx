import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { findClientMembershipByClerkUserId } from "@/lib/auth/client-membership";
import { clientWorkDateFormatter } from "@/lib/client-work/format";
import { getClientVisibleWork } from "@/lib/client-work/queries";
import {
  APPLICATION_SITE_TYPE_LABELS,
  PROJECT_STATUS_LABELS,
} from "@/lib/client-work/types";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Client Portal",
};

export default async function PortalPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const membership = await findClientMembershipByClerkUserId(userId);

  if (!membership) {
    return (
      <div className="container section section--tight narrow">
        <p className="eyebrow">Client Portal</p>
        <h1>No client relationship on file</h1>
        <p className="lead">
          This account isn&apos;t linked to a client relationship yet. Email{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a> and we will get
          you connected.
        </p>
      </div>
    );
  }

  const { applications, projects } = await getClientVisibleWork(
    membership.clientRelationshipId,
  );

  return (
    <div className="container section section--tight admin-screen">
      <p className="eyebrow">Client Portal</p>
      <h1>{membership.clientRelationshipName}</h1>
      <p className="lead">Your active applications, sites, and project work.</p>

      <section className="admin-panel" aria-labelledby="portal-applications-heading">
        <h2 className="admin-panel__title" id="portal-applications-heading">
          Applications and sites
        </h2>
        {applications.length === 0 ? (
          <p className="admin-empty__note">No active applications or sites.</p>
        ) : (
          <ul className="portal-work-list">
            {applications.map((application) => (
              <li key={application.id}>
                <div>
                  <strong>{application.name}</strong>
                  <span>{APPLICATION_SITE_TYPE_LABELS[application.type]}</span>
                </div>
                {application.productionUrl ? (
                  <a
                    href={application.productionUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open site
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="admin-panel" aria-labelledby="portal-projects-heading">
        <h2 className="admin-panel__title" id="portal-projects-heading">
          Projects
        </h2>
        {projects.length === 0 ? (
          <p className="admin-empty__note">No active projects.</p>
        ) : (
          <ul className="portal-work-list">
            {projects.map((project) => (
              <li key={project.id}>
                <div>
                  <strong>{project.name}</strong>
                  <span>
                    {PROJECT_STATUS_LABELS[project.status]}
                    {project.applicationSite
                      ? ` | ${project.applicationSite.name}`
                      : project.createsNewAsset
                        ? " | New asset"
                        : ""}
                  </span>
                  {project.clientDescription ? (
                    <p>{project.clientDescription}</p>
                  ) : null}
                </div>
                {project.targetDate ? (
                  <span>
                    Target {clientWorkDateFormatter.format(project.targetDate)}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
