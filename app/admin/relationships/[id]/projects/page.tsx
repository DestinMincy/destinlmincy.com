import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { archiveProjectAction } from "@/app/admin/relationships/work-actions";
import { ArchiveButton } from "@/components/admin/ArchiveButton";
import { ProjectStatusBadge } from "@/components/admin/ClientWorkStatusBadge";
import { requireAdminForPage } from "@/lib/auth/require-admin";
import { clientWorkDateFormatter } from "@/lib/client-work/format";
import {
  getRelationshipIdentity,
  listProjects,
} from "@/lib/client-work/queries";

export const metadata: Metadata = {
  title: "Projects",
};

interface ProjectsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectsPage({ params }: ProjectsPageProps) {
  await requireAdminForPage();
  const { id } = await params;
  const [relationship, projects] = await Promise.all([
    getRelationshipIdentity(id),
    listProjects(id),
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
          <p className="eyebrow">Projects</p>
          <h1 className="admin-title">
            {projects.length === 1 ? "1 project" : `${projects.length} projects`}
          </h1>
        </div>
        <Link
          className="button button--primary"
          href={`/admin/relationships/${id}/projects/new`}
        >
          New project
        </Link>
      </header>

      {projects.length === 0 ? (
        <div className="admin-panel admin-empty">
          <h2>No projects yet</h2>
          <p>
            Add a scoped work effort for this relationship. It can attach to
            an existing application or mark the creation of a new asset.
          </p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Application or site</th>
                <th scope="col">Status</th>
                <th scope="col">Target</th>
                <th scope="col">Updated</th>
                <th scope="col">
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td>
                    <Link
                      href={`/admin/relationships/${id}/projects/${project.id}/edit`}
                    >
                      {project.name}
                    </Link>
                    {project.createsNewAsset ? (
                      <span className="admin-table__sub">Creates a new asset</span>
                    ) : null}
                  </td>
                  <td>
                    {project.applicationSite ? (
                      <>
                        {project.applicationSite.name}
                        {project.applicationSite.status === "ARCHIVED" ? (
                          <span className="admin-table__sub">Archived</span>
                        ) : null}
                      </>
                    ) : (
                      <span className="admin-table__none">None</span>
                    )}
                  </td>
                  <td>
                    <ProjectStatusBadge status={project.status} />
                  </td>
                  <td>
                    {project.targetDate ? (
                      clientWorkDateFormatter.format(project.targetDate)
                    ) : (
                      <span className="admin-table__none">None</span>
                    )}
                  </td>
                  <td>{clientWorkDateFormatter.format(project.updatedAt)}</td>
                  <td className="admin-table__actions">
                    {project.status !== "ARCHIVED" ? (
                      <ArchiveButton
                        action={archiveProjectAction.bind(null, id, project.id)}
                        label={project.name}
                      />
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
