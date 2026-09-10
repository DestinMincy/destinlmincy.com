import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdminForPage } from "@/lib/auth/require-admin";
import { getRelationshipIdentity } from "@/lib/client-work/queries";
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
        <p className="admin-head__meta">
          Contract generation requires a Contract database model. This UI is
          ready to submit once the backend agent provisions the Contract table
          and action. Fill in the fields below.
        </p>
      </div>

      <div className="admin-panel">
        <form className="admin-form" noValidate>
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
            <fieldset
              style={{
                border: "1px solid var(--border)",
                padding: "16px",
                margin: 0,
              }}
            >
              <legend
                style={{
                  padding: "0 8px",
                  fontWeight: 750,
                  fontSize: "0.9rem",
                }}
              >
                Contract variables
              </legend>
              <div style={{ display: "grid", gap: "14px", marginTop: "12px" }}>
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
              disabled
              title="Contract model not yet available"
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
