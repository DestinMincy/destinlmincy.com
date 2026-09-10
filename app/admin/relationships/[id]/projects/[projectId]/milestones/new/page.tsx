import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MilestoneForm } from "@/components/admin/MilestoneForm";
import { requireAdminForPage } from "@/lib/auth/require-admin";
import { getProject, getRelationshipIdentity } from "@/lib/client-work/queries";
import { createMilestoneAction } from "@/lib/milestones/actions";
import { EMPTY_MILESTONE_FORM_VALUES } from "@/lib/milestones/types";

export const metadata: Metadata = {
  title: "New milestone",
};

interface NewMilestonePageProps {
  params: Promise<{ id: string; projectId: string }>;
}

export default async function NewMilestonePage({
  params,
}: NewMilestonePageProps) {
  await requireAdminForPage();

  const { id, projectId } = await params;
  const [relationship, project] = await Promise.all([
    getRelationshipIdentity(id),
    getProject(id, projectId),
  ]);

  if (!relationship || !project) {
    notFound();
  }

  return (
    <div className="container section section--tight narrow admin-screen">
      <nav aria-label="Breadcrumb">
        <Link
          className="admin-breadcrumb"
          href={`/admin/relationships/${id}/projects/${projectId}/milestones`}
        >
          Milestones
        </Link>
      </nav>

      <header>
        <p className="eyebrow">{project.name}</p>
        <h1 className="admin-title">New milestone</h1>
      </header>

      <div className="admin-panel">
        <MilestoneForm
          action={createMilestoneAction.bind(null, id, projectId)}
          initialValues={EMPTY_MILESTONE_FORM_VALUES}
          submitLabel="Add milestone"
        />
      </div>
    </div>
  );
}
