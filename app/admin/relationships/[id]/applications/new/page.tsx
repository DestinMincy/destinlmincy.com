import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { createApplicationSiteAction } from "@/app/admin/relationships/work-actions";
import { ApplicationSiteForm } from "@/components/admin/ApplicationSiteForm";
import { requireAdminForPage } from "@/lib/auth/require-admin";
import { getRelationshipIdentity } from "@/lib/client-work/queries";
import { EMPTY_APPLICATION_SITE_FORM_VALUES } from "@/lib/client-work/types";

export const metadata: Metadata = {
  title: "New application or site",
};

interface NewApplicationSitePageProps {
  params: Promise<{ id: string }>;
}

export default async function NewApplicationSitePage({
  params,
}: NewApplicationSitePageProps) {
  await requireAdminForPage();
  const { id } = await params;
  const relationship = await getRelationshipIdentity(id);

  if (!relationship) {
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
        <p className="eyebrow">{relationship.name}</p>
        <h1 className="admin-title">New application or site</h1>
      </header>

      <div className="admin-panel">
        <ApplicationSiteForm
          action={createApplicationSiteAction.bind(null, id)}
          initialValues={EMPTY_APPLICATION_SITE_FORM_VALUES}
          submitLabel="Create application or site"
        />
      </div>
    </div>
  );
}
