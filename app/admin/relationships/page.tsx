import type { Metadata } from "next";
import Link from "next/link";

import { LifecycleBadge } from "@/components/admin/LifecycleBadge";
import { requireAdminForPage } from "@/lib/auth/require-admin";
import { listClientRelationships } from "@/lib/relationships/queries";
import { relationshipDateFormatter } from "@/lib/relationships/format";

export const metadata: Metadata = {
  title: "Client relationships",
};

export default async function RelationshipsPage() {
  await requireAdminForPage();

  const relationships = await listClientRelationships();

  return (
    <div className="container section section--tight admin-screen">
      <nav aria-label="Breadcrumb">
        <Link className="admin-breadcrumb" href="/admin">
          Admin
        </Link>
      </nav>

      <header className="admin-head">
        <div>
          <p className="eyebrow">Client relationships</p>
          <h1 className="admin-title">
            {relationships.length === 1
              ? "1 relationship"
              : `${relationships.length} relationships`}
          </h1>
        </div>
        <Link className="button button--primary" href="/admin/relationships/new">
          New relationship
        </Link>
      </header>

      {relationships.length === 0 ? (
        <div className="admin-panel admin-empty">
          <h2>No relationships yet</h2>
          <p>
            Every engagement starts here. Create the first client
            relationship to track its lifecycle, contacts, and users.
          </p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Lifecycle</th>
                <th scope="col">Primary contact</th>
                <th scope="col">Users</th>
                <th scope="col">Updated</th>
              </tr>
            </thead>
            <tbody>
              {relationships.map((relationship) => (
                <tr key={relationship.id}>
                  <td>
                    <Link href={`/admin/relationships/${relationship.id}`}>
                      {relationship.name}
                    </Link>
                    {relationship.legalName ? (
                      <span className="admin-table__sub">
                        {relationship.legalName}
                      </span>
                    ) : null}
                  </td>
                  <td>
                    <LifecycleBadge lifecycle={relationship.lifecycle} />
                  </td>
                  <td>
                    {relationship.primaryContactName ? (
                      <>
                        {relationship.primaryContactName}
                        {relationship.primaryContactEmail ? (
                          <span className="admin-table__sub">
                            {relationship.primaryContactEmail}
                          </span>
                        ) : null}
                      </>
                    ) : relationship.primaryContactEmail ? (
                      relationship.primaryContactEmail
                    ) : (
                      <span className="admin-table__none">None</span>
                    )}
                  </td>
                  <td>{relationship._count.users}</td>
                  <td>{relationshipDateFormatter.format(relationship.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
