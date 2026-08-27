import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { updateApplicationSiteAction } from "@/app/admin/relationships/work-actions";
import { ApplicationSiteForm } from "@/components/admin/ApplicationSiteForm";
import { requireAdminForPage } from "@/lib/auth/require-admin";
import {
  getApplicationSite,
  getRelationshipIdentity,
} from "@/lib/client-work/queries";

export const metadata: Metadata = {
  title: "Edit application or site",
};

interface EditApplicationSitePageProps {
  params: Promise<{ id: string; applicationSiteId: string }>;
}

export default async function EditApplicationSitePage({
  params,
}: EditApplicationSitePageProps) {
  await requireAdminForPage();
  const { id, applicationSiteId } = await params;
  const [relationship, application] = await Promise.all([
    getRelationshipIdentity(id),
    getApplicationSite(id, applicationSiteId),
  ]);

  if (!relationship || !application) {
    notFound();
  }

  return (
    <div className="container section section--tight narrow admin-screen">
      <nav aria-label="Breadcrumb">
        <Link
          className="admin-breadcrumb"
          href={`/admin/relationships/${id}/applications`}
        >
          Applications and sites
        </Link>
      </nav>

      <header>
        <p className="eyebrow">Edit application or site</p>
        <h1 className="admin-title">{application.name}</h1>
      </header>

      <div className="admin-panel">
        <ApplicationSiteForm
          key={application.id}
          action={updateApplicationSiteAction.bind(
            null,
            id,
            application.id,
          )}
          initialValues={{
            name: application.name,
            type: application.type,
            productionUrl: application.productionUrl ?? "",
            stagingUrl: application.stagingUrl ?? "",
            repositoryUrl: application.repositoryUrl ?? "",
            notes: application.notes ?? "",
          }}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
}
