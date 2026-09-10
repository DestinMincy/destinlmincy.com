import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdminForPage } from "@/lib/auth/require-admin";
import { getRelationshipIdentity } from "@/lib/client-work/queries";
import { createContractFormAction } from "@/lib/contracts/actions";
import { getContractTemplate } from "@/lib/contracts/queries";
import type { TemplateSnapshot, TemplateVariable } from "@/lib/contracts/types";

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
    getContractTemplate(id, templateId),
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

  // Extract custom variables from the latest published version snapshot.
  let customVariables: TemplateVariable[] = [];
  if (
    latestVersion?.snapshot != null &&
    typeof latestVersion.snapshot === "object" &&
    !Array.isArray(latestVersion.snapshot)
  ) {
    const snap = latestVersion.snapshot as unknown as TemplateSnapshot;
    customVariables = snap.variables ?? [];
  }

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
        {/* TODO: PDF generation deferred to Unit 07 implementation */}
        <p className="admin-head__meta">
          This creates a contract record from the published template. PDF
          generation and DocuSign signing are implemented in Unit 07 and Unit 08.
        </p>
      </div>

      <div className="admin-panel">
        <form
          className="admin-form"
          action={createContractFormAction.bind(null, id, templateId)}
          noValidate
        >
          <div className="admin-form__row">
            <div className="field">
              <label htmlFor="versionId">Version</label>
              <select id="versionId" name="versionId">
                {publishedVersions.map((version) => (
                  <option key={version.id} value={version.id}>
                    v{version.versionNumber}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="signerEmail">Signer email (required)</label>
              <input
                id="signerEmail"
                name="signerEmail"
                type="email"
                required
                placeholder="client@example.com"
              />
            </div>
          </div>

          {customVariables.length > 0 ? (
            <fieldset className="admin-panel">
              <legend className="admin-panel__title">
                Contract variables
              </legend>
              <div className="admin-form">
                {customVariables.map((variable) => (
                  <div className="field" key={variable.key}>
                    <label htmlFor={`var-${variable.key}`}>
                      {variable.label || variable.key}
                      {variable.required ? " (required)" : " (optional)"}
                    </label>
                    <input
                      id={`var-${variable.key}`}
                      name={`var_${variable.key}`}
                      type="text"
                      required={variable.required}
                    />
                  </div>
                ))}
              </div>
            </fieldset>
          ) : null}

          <div className="button-row">
            <button
              className="button button--primary"
              type="submit"
            >
              Generate contract
            </button>
            <Link
              className="button button--secondary"
              href={`/admin/relationships/${id}/contracts/templates/${templateId}`}
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
