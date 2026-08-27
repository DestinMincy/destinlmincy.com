import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { archiveApplicationSiteAction } from "@/app/admin/relationships/work-actions";
import { ArchiveButton } from "@/components/admin/ArchiveButton";
import { ApplicationSiteStatusBadge } from "@/components/admin/ClientWorkStatusBadge";
import { requireAdminForPage } from "@/lib/auth/require-admin";
import { clientWorkDateFormatter } from "@/lib/client-work/format";
import {
  getRelationshipIdentity,
  listApplicationSites,
} from "@/lib/client-work/queries";
import { APPLICATION_SITE_TYPE_LABELS } from "@/lib/client-work/types";

export const metadata: Metadata = {
  title: "Applications and sites",
};

interface ApplicationSitesPageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplicationSitesPage({
  params,
}: ApplicationSitesPageProps) {
  await requireAdminForPage();
  const { id } = await params;
  const [relationship, applications] = await Promise.all([
    getRelationshipIdentity(id),
    listApplicationSites(id),
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
          <p className="eyebrow">Applications and sites</p>
          <h1 className="admin-title">
            {applications.length === 1
              ? "1 application or site"
              : `${applications.length} applications and sites`}
          </h1>
        </div>
        <Link
          className="button button--primary"
          href={`/admin/relationships/${id}/applications/new`}
        >
          New application or site
        </Link>
      </header>

      {applications.length === 0 ? (
        <div className="admin-panel admin-empty">
          <h2>No applications or sites yet</h2>
          <p>
            Add the assets this relationship owns or operates. Projects can
            then attach to an existing asset.
          </p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Type</th>
                <th scope="col">Production</th>
                <th scope="col">Projects</th>
                <th scope="col">Status</th>
                <th scope="col">Updated</th>
                <th scope="col">
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {applications.map((application) => (
                <tr key={application.id}>
                  <td>
                    <Link
                      href={`/admin/relationships/${id}/applications/${application.id}/edit`}
                    >
                      {application.name}
                    </Link>
                  </td>
                  <td>{APPLICATION_SITE_TYPE_LABELS[application.type]}</td>
                  <td>
                    {application.productionUrl ? (
                      <a
                        href={application.productionUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Visit
                      </a>
                    ) : (
                      <span className="admin-table__none">None</span>
                    )}
                  </td>
                  <td>{application._count.projects}</td>
                  <td>
                    <ApplicationSiteStatusBadge status={application.status} />
                  </td>
                  <td>{clientWorkDateFormatter.format(application.updatedAt)}</td>
                  <td className="admin-table__actions">
                    {application.status === "ACTIVE" ? (
                      <ArchiveButton
                        action={archiveApplicationSiteAction.bind(
                          null,
                          id,
                          application.id,
                        )}
                        label={application.name}
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
