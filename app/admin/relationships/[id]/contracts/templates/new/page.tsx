import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CreateContractTemplateForm } from "@/components/admin/CreateContractTemplateForm";
import { createContractTemplateAction } from "@/lib/contracts/actions";
import { requireAdminForPage } from "@/lib/auth/require-admin";
import { getRelationshipIdentity } from "@/lib/client-work/queries";

export const metadata: Metadata = {
  title: "New contract template",
};

interface NewContractTemplatePageProps {
  params: Promise<{ id: string }>;
}

export default async function NewContractTemplatePage({
  params,
}: NewContractTemplatePageProps) {
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
          href={`/admin/relationships/${id}/contracts`}
        >
          Contracts
        </Link>
      </nav>

      <header>
        <p className="eyebrow">{relationship.name}</p>
        <h1 className="admin-title">New contract template</h1>
      </header>

      <div className="admin-panel">
        <CreateContractTemplateForm
          action={createContractTemplateAction.bind(null, id)}
          cancelHref={`/admin/relationships/${id}/contracts`}
        />
      </div>
    </div>
  );
}
