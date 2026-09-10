import type { Metadata } from "next";
import Link from "next/link";

import { LifecycleBadge } from "@/components/admin/LifecycleBadge";
import { requireAdminForPage } from "@/lib/auth/require-admin";
import { getAdminOverviewData } from "@/lib/client-work/hub-queries";
import { relationshipDateFormatter } from "@/lib/relationships/format";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function AdminPage() {
  await requireAdminForPage();

  const { total, active, recent } = await getAdminOverviewData();

  return (
    <div className="container section section--tight admin-screen">
      <header>
        <p className="eyebrow">Admin</p>
        <h1 className="admin-title">Operator console</h1>
        <p className="admin-head__meta">
          Manage client relationships, their applications and sites, contracts,
          payment gates, and projects.
        </p>
      </header>

      <div className="admin-grid">
        <div className="admin-panel">
          <h2 className="admin-panel__title">Client relationships</h2>
          <dl className="admin-dl">
            <div>
              <dt>Total</dt>
              <dd>{total}</dd>
            </div>
            <div>
              <dt>Active</dt>
              <dd>{active}</dd>
            </div>
          </dl>
          <div style={{ marginTop: "8px" }}>
            <Link
              className="button button--primary button--compact"
              href="/admin/relationships"
            >
              Manage relationships
            </Link>
          </div>
        </div>

        <div className="admin-panel">
          <h2 className="admin-panel__title">Workspaces</h2>
          <ul className="admin-nav-list">
            <li>
              <Link href="/admin/relationships">Client relationships</Link>
              <span className="admin-head__meta">
                Lifecycle, contacts, applications, projects, contracts, and
                payment gates.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {recent.length > 0 ? (
        <section className="admin-panel" aria-labelledby="recent-heading">
          <h2 className="admin-panel__title" id="recent-heading">
            Recent relationships
          </h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Lifecycle</th>
                  <th scope="col">Users</th>
                  <th scope="col">Updated</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((rel) => (
                  <tr key={rel.id}>
                    <td>
                      <Link href={`/admin/relationships/${rel.id}`}>
                        {rel.name}
                      </Link>
                    </td>
                    <td>
                      <LifecycleBadge lifecycle={rel.lifecycle} />
                    </td>
                    <td>{rel._count.users}</td>
                    <td>{relationshipDateFormatter.format(rel.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {total > 5 ? (
            <p
              style={{ fontSize: "0.92rem", color: "var(--text-muted)" }}
            >
              Showing 5 most recent.{" "}
              <Link href="/admin/relationships">View all {total}</Link>
            </p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
