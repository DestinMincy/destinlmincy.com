import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdminForPage } from "@/lib/auth/require-admin";
import { clientWorkDateFormatter } from "@/lib/client-work/format";
import { getRelationshipIdentity } from "@/lib/client-work/queries";
import { listContractTemplates } from "@/lib/contracts/queries";
import {
  CONTRACT_TEMPLATE_STATUS_LABELS,
  CONTRACT_TEMPLATE_STATUS_TONE,
} from "@/lib/contracts/types";

export const metadata: Metadata = {
  title: "Contracts",
};

interface ContractsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ContractsPage({ params }: ContractsPageProps) {
  await requireAdminForPage();

  const { id } = await params;
  const [relationship, templates] = await Promise.all([
    getRelationshipIdentity(id),
    listContractTemplates(id),
  ]);

  if (!relationship) {
    notFound();
  }

  return (
    <div className="container section section--tight admin-screen">
      <nav aria-label="Breadcrumb">
        <Link className="admin-breadcrumb" href={`/admin/relationships/${id}`}>
          {relationship.name}
        </Link>
      </nav>

      <header className="admin-head">
        <div>
          <p className="eyebrow">Contracts</p>
          <h1 className="admin-title">
            {templates.length === 1
              ? "1 template"
              : `${templates.length} templates`}
          </h1>
        </div>
        <Link
          className="button button--primary"
          href={`/admin/relationships/${id}/contracts/templates/new`}
        >
          New template
        </Link>
      </header>

      <section className="admin-panel" aria-labelledby="templates-heading">
        <div className="admin-panel__head">
          <h2 className="admin-panel__title" id="templates-heading">
            Contract templates
          </h2>
          <p className="admin-head__meta">
            Draft and publish reusable contract blocks. Published versions are
            immutable.
          </p>
        </div>

        {templates.length === 0 ? (
          <p className="admin-empty__note">
            No contract templates yet. Create one to start building your
            contract library.
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Status</th>
                  <th scope="col">Versions</th>
                  <th scope="col">Updated</th>
                  <th scope="col">
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {templates.map((template) => (
                  <tr key={template.id}>
                    <td>
                      <Link
                        href={`/admin/relationships/${id}/contracts/templates/${template.id}`}
                      >
                        {template.name}
                      </Link>
                    </td>
                    <td>
                      <StatusBadge
                        status={template.status}
                        label={CONTRACT_TEMPLATE_STATUS_LABELS[template.status]}
                        tone={CONTRACT_TEMPLATE_STATUS_TONE[template.status]}
                      />
                    </td>
                    <td>{template._count.versions}</td>
                    <td>{clientWorkDateFormatter.format(template.updatedAt)}</td>
                    <td className="admin-table__actions">
                      <Link
                        href={`/admin/relationships/${id}/contracts/templates/${template.id}`}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-panel admin-empty" aria-labelledby="generated-heading">
        <h2 className="admin-panel__title" id="generated-heading">
          Generated contracts
        </h2>
        <p>
          Generated contracts will appear here once the contract generation
          feature is implemented. Use a published template to create a contract
          from its detail page.
        </p>
      </section>
    </div>
  );
}
