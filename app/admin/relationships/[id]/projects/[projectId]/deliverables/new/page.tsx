import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DeliverableForm } from "@/components/admin/DeliverableForm";
import { requireAdminForPage } from "@/lib/auth/require-admin";
import { getProject, getRelationshipIdentity } from "@/lib/client-work/queries";
import { createDeliverableAction } from "@/lib/milestones/actions";
import { EMPTY_DELIVERABLE_FORM_VALUES } from "@/lib/milestones/types";

export const metadata: Metadata = {
  title: "New deliverable",
};

interface NewDeliverablePageProps {
  params: Promise<{ id: string; projectId: string }>;
  searchParams: Promise<{ milestoneId?: string }>;
}

export default async function NewDeliverablePage({
  params,
  searchParams,
}: NewDeliverablePageProps) {
  await requireAdminForPage();

  const { id, projectId } = await params;
  const { milestoneId } = await searchParams;

  const [relationship, project] = await Promise.all([
    getRelationshipIdentity(id),
    getProject(id, projectId),
  ]);

  if (!relationship || !project) {
    notFound();
  }

  const cancelHref =
    milestoneId
      ? `/admin/relationships/${id}/projects/${projectId}/milestones/${milestoneId}`
      : `/admin/relationships/${id}/projects/${projectId}`;

  return (
    <div className="container section section--tight narrow admin-screen">
      <nav aria-label="Breadcrumb">
        <Link className="admin-breadcrumb" href={cancelHref}>
          {milestoneId ? "Milestone" : project.name}
        </Link>
      </nav>

      <header>
        <p className="eyebrow">{project.name}</p>
        <h1 className="admin-title">New deliverable</h1>
      </header>

      <div className="admin-panel">
        <DeliverableForm
          action={createDeliverableAction.bind(
            null,
            id,
            projectId,
            milestoneId ?? null,
          )}
          initialValues={EMPTY_DELIVERABLE_FORM_VALUES}
          cancelHref={cancelHref}
          submitLabel="Add deliverable"
        />
      </div>
    </div>
  );
}
