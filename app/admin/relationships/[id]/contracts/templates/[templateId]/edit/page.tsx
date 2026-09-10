import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { ContractTemplateEditor } from "@/components/admin/ContractTemplateEditor";
import { requireAdminForPage } from "@/lib/auth/require-admin";
import { getRelationshipIdentity } from "@/lib/client-work/queries";
import { saveContractTemplateDraftAction } from "@/lib/contracts/actions";
import { getContractTemplateDraftSnapshot } from "@/lib/contracts/queries";
import type { TemplateSnapshot } from "@/lib/contracts/types";

export const metadata: Metadata = {
  title: "Edit contract template",
};

interface EditContractTemplatePageProps {
  params: Promise<{ id: string; templateId: string }>;
}

export default async function EditContractTemplatePage({
  params,
}: EditContractTemplatePageProps) {
  await requireAdminForPage();

  const { id, templateId } = await params;
  const [relationship, draft] = await Promise.all([
    getRelationshipIdentity(id),
    getContractTemplateDraftSnapshot(id, templateId),
  ]);

  if (!relationship || !draft) {
    notFound();
  }

  const snapshot: TemplateSnapshot =
    draft.draftVersion?.snapshot != null &&
    typeof draft.draftVersion.snapshot === "object" &&
    !Array.isArray(draft.draftVersion.snapshot)
      ? (draft.draftVersion.snapshot as unknown as TemplateSnapshot)
      : { blocks: [], variables: [] };

  return (
    <div className="container section section--tight admin-screen">
      <nav aria-label="Breadcrumb">
        <Link
          className="admin-breadcrumb"
          href={`/admin/relationships/${id}/contracts/templates/${templateId}`}
        >
          {draft.template.name}
        </Link>
      </nav>

      <header className="admin-head">
        <div>
          <p className="eyebrow">Edit template</p>
          <h1 className="admin-title">{draft.template.name}</h1>
        </div>
      </header>

      <ContractTemplateEditor
        initialSnapshot={snapshot}
        action={saveContractTemplateDraftAction.bind(null, id, templateId)}
      />
    </div>
  );
}
