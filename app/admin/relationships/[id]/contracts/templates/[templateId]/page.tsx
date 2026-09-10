import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArchiveButton } from "@/components/admin/ArchiveButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdminForPage } from "@/lib/auth/require-admin";
import { clientWorkDateFormatter } from "@/lib/client-work/format";
import { getRelationshipIdentity } from "@/lib/client-work/queries";
import {
  archiveContractTemplateAction,
  publishContractTemplateVersionFormAction,
} from "@/lib/contracts/actions";
import { getContractTemplate } from "@/lib/contracts/queries";
import {
  CONTRACT_TEMPLATE_STATUS_LABELS,
  CONTRACT_TEMPLATE_STATUS_TONE,
} from "@/lib/contracts/types";

export const metadata: Metadata = {
  title: "Contract template",
};

interface ContractTemplatePageProps {
  params: Promise<{ id: string; templateId: string }>;
}

export default async function ContractTemplatePage({
  params,
}: ContractTemplatePageProps) {
  await requireAdminForPage();

  const { id, templateId } = await params;
  const [relationship, template] = await Promise.all([
    getRelationshipIdentity(id),
    getContractTemplate(id, templateId),
  ]);

  if (!relationship || !template) {
    notFound();
  }

  const publishedVersions = template.versions.filter((v) => v.publishedAt);
  const hasDraft = template.versions.some((v) => !v.publishedAt);

  return (
    <div className="container section section--tight admin-screen">
      <nav aria-label="Breadcrumb">
        <Link
          className="admin-breadcrumb"
          href={`/admin/relationships/${id}/contracts`}
        >
          Contracts
        </Link>
      </nav>

      <header className="admin-head">
        <div>
          <p className="eyebrow">Contract template</p>
          <h1 className="admin-title">{template.name}</h1>
        </div>
        <div className="button-row">
          {template.status === "DRAFT" ? (
            <>
              <Link
                className="button button--primary"
                href={`/admin/relationships/${id}/contracts/templates/${templateId}/edit`}
              >
                Edit content
              </Link>
              {hasDraft ? (
                <form
                  action={publishContractTemplateVersionFormAction.bind(
                    null,
                    id,
                    templateId,
                  )}
                >
                  <button className="button button--secondary" type="submit">
                    Publish version
                  </button>
                </form>
              ) : null}
            </>
          ) : template.status === "PUBLISHED" ? (
            <Link
              className="button button--primary"
              href={`/admin/relationships/${id}/contracts/templates/${templateId}/generate`}
            >
              Generate contract
            </Link>
          ) : null}
        </div>
      </header>

      <div className="admin-grid">
        <div className="admin-panel">
          <h2 className="admin-panel__title">Template info</h2>
          <dl className="admin-dl">
            <div>
              <dt>Status</dt>
              <dd>
                <StatusBadge
                  status={template.status}
                  label={CONTRACT_TEMPLATE_STATUS_LABELS[template.status]}
                  tone={CONTRACT_TEMPLATE_STATUS_TONE[template.status]}
                />
              </dd>
            </div>
            <div>
              <dt>Versions</dt>
              <dd>{publishedVersions.length} published</dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>{clientWorkDateFormatter.format(template.createdAt)}</dd>
            </div>
            <div>
              <dt>Updated</dt>
              <dd>{clientWorkDateFormatter.format(template.updatedAt)}</dd>
            </div>
          </dl>

          {template.status === "ARCHIVED" ? (
            <p className="form-error" role="status">
              This template is archived and cannot be used to generate new
              contracts.
            </p>
          ) : null}
        </div>

        {template.status !== "ARCHIVED" ? (
          <div className="admin-panel">
            <h2 className="admin-panel__title">Actions</h2>
            <ul className="admin-nav-list">
              {template.status === "DRAFT" ? (
                <li>
                  <Link
                    href={`/admin/relationships/${id}/contracts/templates/${templateId}/edit`}
                  >
                    Edit draft content
                  </Link>
                  <span className="admin-head__meta">
                    Open the block editor to modify this template.
                  </span>
                </li>
              ) : null}
              {template.status === "PUBLISHED" ? (
                <li>
                  <Link
                    href={`/admin/relationships/${id}/contracts/templates/${templateId}/generate`}
                  >
                    Generate a contract
                  </Link>
                  <span className="admin-head__meta">
                    Fill in the contract fields and create a contract from the
                    latest published version.
                  </span>
                </li>
              ) : null}
            </ul>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
              <ArchiveButton
                action={archiveContractTemplateAction.bind(
                  null,
                  id,
                  templateId,
                )}
                label={template.name}
              />
            </div>
          </div>
        ) : null}
      </div>

      {publishedVersions.length > 0 ? (
        <section className="admin-panel" aria-labelledby="versions-heading">
          <h2 className="admin-panel__title" id="versions-heading">
            Published versions
          </h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Version</th>
                  <th scope="col">Published</th>
                </tr>
              </thead>
              <tbody>
                {publishedVersions.map((version) => (
                  <tr key={version.id}>
                    <td>v{version.versionNumber}</td>
                    <td>
                      {version.publishedAt
                        ? clientWorkDateFormatter.format(version.publishedAt)
                        : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
