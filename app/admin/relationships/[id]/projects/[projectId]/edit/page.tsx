import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { updateProjectAction } from "@/app/admin/relationships/work-actions";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { requireAdminForPage } from "@/lib/auth/require-admin";
import { dateToInputValue } from "@/lib/client-work/format";
import {
  getProject,
  getRelationshipIdentity,
  listApplicationSiteOptions,
} from "@/lib/client-work/queries";

export const metadata: Metadata = {
  title: "Edit project",
};

interface EditProjectPageProps {
  params: Promise<{ id: string; projectId: string }>;
}

export default async function EditProjectPage({
  params,
}: EditProjectPageProps) {
  await requireAdminForPage();
  const { id, projectId } = await params;
  const [relationship, project] = await Promise.all([
    getRelationshipIdentity(id),
    getProject(id, projectId),
  ]);

  if (!relationship || !project) {
    notFound();
  }

  const applicationSites = await listApplicationSiteOptions(
    id,
    project.applicationSiteId,
  );

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
        <p className="eyebrow">Edit project</p>
        <h1 className="admin-title">{project.name}</h1>
      </header>

      <div className="admin-panel">
        <ProjectForm
          key={project.id}
          action={updateProjectAction.bind(null, id, project.id)}
          applicationSites={applicationSites}
          initialValues={{
            name: project.name,
            status: project.status,
            applicationSiteId: project.applicationSiteId ?? "",
            createsNewAsset: project.createsNewAsset,
            summary: project.summary ?? "",
            clientDescription: project.clientDescription ?? "",
            startsAt: dateToInputValue(project.startsAt),
            targetDate: dateToInputValue(project.targetDate),
          }}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
}
