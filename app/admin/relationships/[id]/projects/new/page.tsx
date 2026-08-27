import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { createProjectAction } from "@/app/admin/relationships/work-actions";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { requireAdminForPage } from "@/lib/auth/require-admin";
import {
  getRelationshipIdentity,
  listApplicationSiteOptions,
} from "@/lib/client-work/queries";
import { EMPTY_PROJECT_FORM_VALUES } from "@/lib/client-work/types";

export const metadata: Metadata = {
  title: "New project",
};

interface NewProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function NewProjectPage({ params }: NewProjectPageProps) {
  await requireAdminForPage();
  const { id } = await params;
  const [relationship, applicationSites] = await Promise.all([
    getRelationshipIdentity(id),
    listApplicationSiteOptions(id),
  ]);

  if (!relationship) {
    notFound();
  }

  return (
    <div className="container section section--tight narrow admin-screen">
      <nav aria-label="Breadcrumb">
        <Link
          className="admin-breadcrumb"
          href={`/admin/relationships/${id}/projects`}
        >
          Projects
        </Link>
      </nav>

      <header>
        <p className="eyebrow">{relationship.name}</p>
        <h1 className="admin-title">New project</h1>
      </header>

      <div className="admin-panel">
        <ProjectForm
          action={createProjectAction.bind(null, id)}
          applicationSites={applicationSites}
          initialValues={EMPTY_PROJECT_FORM_VALUES}
          submitLabel="Create project"
        />
      </div>
    </div>
  );
}
