import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SendToDocuSignButton } from "@/components/admin/SendToDocuSignButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdminForPage } from "@/lib/auth/require-admin";
import { clientWorkDateFormatter } from "@/lib/client-work/format";
import { getRelationshipIdentity } from "@/lib/client-work/queries";
import { listContractTemplates, listContracts } from "@/lib/contracts/queries";
import {
  CONTRACT_TEMPLATE_STATUS_LABELS,
  CONTRACT_TEMPLATE_STATUS_TONE,
} from "@/lib/contracts/types";
import { prisma } from "@/lib/db/client";

export const metadata: Metadata = {
  title: "Contracts",
};

const CONTRACT_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  GENERATED: "Generated",
  SENT_FOR_SIGNING: "Sent for signing",
  CLIENT_SIGNED: "Client signed",
  COMPLETE: "Complete",
  VOIDED: "Voided",
};

const CONTRACT_STATUS_TONE: Record<
  string,
  "signal" | "success" | "muted" | "accent" | "neutral"
> = {
  DRAFT: "neutral",
  GENERATED: "accent",
  SENT_FOR_SIGNING: "signal",
  CLIENT_SIGNED: "signal",
  COMPLETE: "success",
  VOIDED: "muted",
};

interface ContractsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ContractsPage({ params }: ContractsPageProps) {
  await requireAdminForPage();

  const { id } = await params;
  const [relationship, templates, contractsRaw] = await Promise.all([
    getRelationshipIdentity(id),
    listContractTemplates(id),
    listContracts(id),
  ]);

  if (!relationship) {
    notFound();
  }

  // Enrich contracts with template names.
  const versionIds = contractsRaw
    .map((c) => c.contractTemplateVersionId)
    .filter((v): v is string => v != null);

  const versionNames =
    versionIds.length > 0
      ? await prisma.contractTemplateVersion.findMany({
          where: { id: { in: versionIds } },
          select: {
            id: true,
            versionNumber: true,
            contractTemplate: { select: { name: true } },
          },
        })
      : [];

  const versionNameMap = new Map(
    versionNames.map((v) => [
      v.id,
      { name: v.contractTemplate.name, version: v.versionNumber },
    ]),
  );

  const contracts = contractsRaw.map((c) => ({
    ...c,
    templateInfo: c.contractTemplateVersionId
      ? versionNameMap.get(c.contractTemplateVersionId)
      : undefined,
  }));

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

      <section className="admin-panel" aria-labelledby="generated-heading">
        <div className="admin-panel__head">
          <h2 className="admin-panel__title" id="generated-heading">
            Generated contracts
          </h2>
          <p className="admin-head__meta">
            Contracts generated from published templates. Send to DocuSign for
            client and admin countersignature.
          </p>
        </div>

        {contracts.length === 0 ? (
          <p className="admin-empty__note">
            No contracts yet. Generate one from a published template.
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Template</th>
                  <th scope="col">Signer</th>
                  <th scope="col">Status</th>
                  <th scope="col">PDF</th>
                  <th scope="col">Created</th>
                  <th scope="col">
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((contract) => {
                  const canSend =
                    !contract.docusignEnvelopeId &&
                    contract.s3Key != null &&
                    contract.status !== "COMPLETE" &&
                    contract.status !== "VOIDED";
                  return (
                    <tr key={contract.id}>
                      <td>
                        {contract.templateInfo
                          ? `${contract.templateInfo.name} v${contract.templateInfo.version}`
                          : "—"}
                      </td>
                      <td>{contract.signerEmail ?? "—"}</td>
                      <td>
                        <StatusBadge
                          status={contract.status}
                          label={
                            CONTRACT_STATUS_LABELS[contract.status] ??
                            contract.status
                          }
                          tone={
                            CONTRACT_STATUS_TONE[contract.status] ?? "neutral"
                          }
                        />
                        {contract.docusignEnvelopeId ? (
                          <span
                            style={{ fontSize: "0.75rem", color: "var(--color-muted)", display: "block" }}
                          >
                            DocuSign: {contract.docusignStatus ?? "sent"}
                          </span>
                        ) : null}
                      </td>
                      <td>
                        {contract.s3Key ? (
                          <span className="status-mark status-mark--success">
                            Stored
                          </span>
                        ) : (
                          <span className="status-mark status-mark--neutral">
                            No PDF
                          </span>
                        )}
                      </td>
                      <td>
                        {clientWorkDateFormatter.format(contract.createdAt)}
                      </td>
                      <td className="admin-table__actions">
                        {canSend ? (
                          <SendToDocuSignButton
                            clientRelationshipId={id}
                            contractId={contract.id}
                          />
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
