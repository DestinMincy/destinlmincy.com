import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { GenerateContractForm } from "@/components/admin/GenerateContractForm";
import { requireAdminForPage } from "@/lib/auth/require-admin";
import { getRelationshipIdentity } from "@/lib/client-work/queries";
import { createContractFormAction } from "@/lib/contracts/actions";
import { getContractTemplate } from "@/lib/contracts/queries";
import { parseTemplateSnapshot } from "@/lib/contracts/template-validation";
import type { TemplateVariable } from "@/lib/contracts/types";

export const metadata: Metadata = {
  title: "Generate contract",
};

interface GenerateContractPageProps {
  params: Promise<{ id: string; templateId: string }>;
}

export default async function GenerateContractPage({
  params,
}: GenerateContractPageProps) {
  await requireAdminForPage();

  const { id, templateId } = await params;
  const [relationship, template] = await Promise.all([
    getRelationshipIdentity(id),
    getContractTemplate(templateId, id),
  ]);

  if (!relationship || !template) {
    notFound();
  }

  if (template.status !== "PUBLISHED") {
    return (
      <div className="container section section--tight narrow admin-screen">
        <nav aria-label="Breadcrumb">
          <Link
            className="admin-breadcrumb"
            href={`/admin/relationships/${id}/contracts/templates/${templateId}`}
          >
            {template.name}
          </Link>
        </nav>
        <div className="admin-panel admin-empty">
          <h1 className="admin-title">Cannot generate contract</h1>
          <p>
            Only published templates can be used to generate contracts. Publish
            a version first.
          </p>
          <Link
            className="button button--secondary"
            href={`/admin/relationships/${id}/contracts/templates/${templateId}`}
          >
            Back to template
          </Link>
        </div>
      </div>
    );
  }

  const publishedVersions = template.versions.filter((v) => v.publishedAt);
  const latestVersion = publishedVersions[0];

  // Custom variables come from the latest published version snapshot.
  const parsedSnapshot = latestVersion
    ? parseTemplateSnapshot(latestVersion.snapshot)
    : null;
  const customVariables: TemplateVariable[] = parsedSnapshot?.ok
    ? parsedSnapshot.snapshot.variables
    : [];

  return (
    <div className="container section section--tight narrow admin-screen">
      <nav aria-label="Breadcrumb">
        <Link
          className="admin-breadcrumb"
          href={`/admin/relationships/${id}/contracts/templates/${templateId}`}
        >
          {template.name}
        </Link>
      </nav>

      <header>
        <p className="eyebrow">Generate contract</p>
        <h1 className="admin-title">{template.name}</h1>
      </header>

      <div className="admin-panel">
        <p className="admin-head__meta">
          This creates a contract record from the published template, generates
          a PDF, and stores it ready for DocuSign signing.
        </p>
      </div>

      <div className="admin-panel">
        <GenerateContractForm
          action={createContractFormAction.bind(null, id, templateId)}
          versions={publishedVersions.map((version) => ({
            id: version.id,
            versionNumber: version.versionNumber,
          }))}
          variables={customVariables}
          cancelHref={`/admin/relationships/${id}/contracts/templates/${templateId}`}
        />
      </div>
    </div>
  );
}
