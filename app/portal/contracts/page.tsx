import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { findClientMembershipByClerkUserId } from "@/lib/auth/client-membership";
import { listPortalContracts } from "@/lib/portal/queries";

export const metadata: Metadata = {
  title: "Contracts",
};

const CONTRACT_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Ready",
  ARCHIVED: "Archived",
};

const CONTRACT_STATUS_TONE: Record<string, string> = {
  DRAFT: "neutral",
  PUBLISHED: "accent",
  ARCHIVED: "muted",
};

const portalDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default async function PortalContractsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/portal");

  const membership = await findClientMembershipByClerkUserId(userId);
  if (!membership) return null;

  const contracts = await listPortalContracts(membership.clientRelationshipId);

  return (
    <div className="container section section--tight admin-screen">
      <header className="admin-head">
        <div>
          <p className="eyebrow">Contracts</p>
          <h1 className="admin-title">Your contracts</h1>
        </div>
      </header>

      {contracts.length === 0 ? (
        <div className="admin-panel admin-empty">
          <p className="admin-empty__note">No contracts on file yet.</p>
        </div>
      ) : (
        <div className="admin-panel">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Status</th>
                  <th scope="col">Created</th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((contract) => {
                  const tone =
                    CONTRACT_STATUS_TONE[contract.status] ?? "neutral";
                  const label =
                    CONTRACT_STATUS_LABELS[contract.status] ?? contract.status;
                  return (
                    <tr key={contract.id}>
                      <td>
                        <strong>{contract.templateName}</strong>
                      </td>
                      <td>
                        <span className={`status-mark status-mark--${tone}`}>
                          {label}
                        </span>
                      </td>
                      <td>
                        {portalDateFormatter.format(contract.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="admin-empty__note">
            Contracts are view-only. Contact us with any questions.
          </p>
        </div>
      )}
    </div>
  );
}
