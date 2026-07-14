import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  attachClientUserAction,
  removeClientUserAction,
  updateLifecycleAction,
} from "@/app/admin/relationships/actions";
import { AttachClientUserForm } from "@/components/admin/AttachClientUserForm";
import { LifecycleControl } from "@/components/admin/LifecycleControl";
import { RemoveMembershipButton } from "@/components/admin/RemoveMembershipButton";
import { requireAdminForPage } from "@/lib/auth/require-admin";
import { getClientRelationshipWithUsers } from "@/lib/relationships/queries";

export const metadata: Metadata = {
  title: "Client relationship",
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
});

interface RelationshipDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RelationshipDetailPage({
  params,
}: RelationshipDetailPageProps) {
  await requireAdminForPage();

  const { id } = await params;
  const relationship = await getClientRelationshipWithUsers(id);

  if (!relationship) {
    notFound();
  }

  const activeUsers = relationship.users.filter(
    (user) => user.status === "ACTIVE",
  );
  const removedUsers = relationship.users.filter(
    (user) => user.status === "REMOVED",
  );

  return (
    <div className="container section section--tight admin-screen">
      <nav aria-label="Breadcrumb">
        <Link className="admin-breadcrumb" href="/admin/relationships">
          Client relationships
        </Link>
      </nav>

      <header className="admin-head">
        <div>
          <p className="eyebrow">Relationship</p>
          <h1 className="admin-title">{relationship.name}</h1>
          {relationship.legalName ? (
            <p className="admin-head__meta">{relationship.legalName}</p>
          ) : null}
        </div>
        <Link
          className="button button--secondary button--compact"
          href={`/admin/relationships/${relationship.id}/edit`}
        >
          Edit details
        </Link>
      </header>

      <div className="admin-grid">
        <div className="admin-panel">
          <h2 className="admin-panel__title">Status</h2>
          <LifecycleControl
            action={updateLifecycleAction.bind(null, relationship.id)}
            current={relationship.lifecycle}
          />
          {relationship.summary ? (
            <div className="admin-summary">
              <h3 className="admin-panel__subtitle">Notes</h3>
              <p>{relationship.summary}</p>
            </div>
          ) : null}
        </div>

        <div className="admin-panel">
          <h2 className="admin-panel__title">Contact</h2>
          <dl className="admin-dl">
            <div>
              <dt>Name</dt>
              <dd>
                {relationship.primaryContactName || (
                  <span className="admin-table__none">None</span>
                )}
              </dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>
                {relationship.primaryContactEmail ? (
                  <a href={`mailto:${relationship.primaryContactEmail}`}>
                    {relationship.primaryContactEmail}
                  </a>
                ) : (
                  <span className="admin-table__none">None</span>
                )}
              </dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>
                {relationship.primaryContactPhone || (
                  <span className="admin-table__none">None</span>
                )}
              </dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>{dateFormatter.format(relationship.createdAt)}</dd>
            </div>
            <div>
              <dt>Updated</dt>
              <dd>{dateFormatter.format(relationship.updatedAt)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <section className="admin-panel" aria-labelledby="client-users-heading">
        <div className="admin-panel__head">
          <h2 className="admin-panel__title" id="client-users-heading">
            Client users
          </h2>
          <p className="admin-head__meta">
            People with portal access to this relationship.
          </p>
        </div>

        {activeUsers.length === 0 ? (
          <p className="admin-empty__note">
            No client users attached yet. Attach an account below to grant
            portal access.
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Email</th>
                  <th scope="col">Name</th>
                  <th scope="col">Added</th>
                  <th scope="col">
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {activeUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td>
                      {user.name || (
                        <span className="admin-table__none">None</span>
                      )}
                    </td>
                    <td>{dateFormatter.format(user.createdAt)}</td>
                    <td className="admin-table__actions">
                      <RemoveMembershipButton
                        action={removeClientUserAction.bind(
                          null,
                          relationship.id,
                          user.id,
                        )}
                        label={
                          user.name
                            ? `${user.name} (${user.email})`
                            : user.email
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {removedUsers.length > 0 ? (
          <p className="admin-empty__note">
            Removed:{" "}
            {removedUsers.map((user) => user.email).join(", ")}. Re-attach an
            email to restore access.
          </p>
        ) : null}

        <AttachClientUserForm
          action={attachClientUserAction.bind(null, relationship.id)}
        />
      </section>
    </div>
  );
}
