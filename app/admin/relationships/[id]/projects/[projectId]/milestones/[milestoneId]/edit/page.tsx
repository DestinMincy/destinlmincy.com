import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MilestoneForm } from "@/components/admin/MilestoneForm";
import { requireAdminForPage } from "@/lib/auth/require-admin";
import { getProject, getRelationshipIdentity } from "@/lib/client-work/queries";
import { updateMilestoneAction } from "@/lib/milestones/actions";
import { getMilestone } from "@/lib/milestones/queries";
import { listPaymentGates } from "@/lib/payments/queries";

export const metadata: Metadata = {
  title: "Edit milestone",
};

interface EditMilestonePageProps {
  params: Promise<{
    id: string;
    projectId: string;
    milestoneId: string;
  }>;
}

export default async function EditMilestonePage({
  params,
}: EditMilestonePageProps) {
  await requireAdminForPage();

  const { id, projectId, milestoneId } = await params;
  const [relationship, project, milestone, allPaymentGates] = await Promise.all(
    [
      getRelationshipIdentity(id),
      getProject(id, projectId),
      getMilestone(milestoneId, id),
      listPaymentGates(id),
    ],
  );

  if (!relationship || !project || !milestone) {
    notFound();
  }

  const paymentGates = allPaymentGates.map((g) => ({
    id: g.id,
    label: g.label,
  }));

  const initialValues = {
    title: milestone.title,
    status: milestone.status,
    targetDate: milestone.targetDate
      ? milestone.targetDate.toISOString().split("T")[0]
      : "",
    approvalRequired: milestone.approvalRequired,
    clientFacingUpdate: milestone.clientFacingUpdate ?? "",
    paymentDependencyId: milestone.paymentDependencyId ?? "",
  };

  return (
    <div className="container section section--tight narrow admin-screen">
      <nav aria-label="Breadcrumb">
        <Link
          className="admin-breadcrumb"
          href={`/admin/relationships/${id}/projects/${projectId}/milestones/${milestoneId}`}
        >
          {milestone.title}
        </Link>
      </nav>

      <header>
        <p className="eyebrow">{project.name}</p>
        <h1 className="admin-title">Edit milestone</h1>
      </header>

      <div className="admin-panel">
        <MilestoneForm
          action={updateMilestoneAction.bind(null, milestoneId, id, projectId)}
          initialValues={initialValues}
          paymentGates={paymentGates}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
}
