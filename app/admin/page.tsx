import type { Metadata } from "next";
import Link from "next/link";

import { requireAdminForPage } from "@/lib/auth/require-admin";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function AdminPage() {
  await requireAdminForPage();

  return (
    <div className="container section section--tight narrow admin-screen">
      <header>
        <p className="eyebrow">Admin</p>
        <h1 className="admin-title">Operator console</h1>
        <p className="lead">
          Manage client relationships, their applications and sites, and the
          projects attached to them.
        </p>
      </header>

      <nav className="admin-panel" aria-label="Workspaces">
        <h2 className="admin-panel__title">Workspaces</h2>
        <ul className="admin-nav-list">
          <li>
            <Link href="/admin/relationships">Client relationships</Link>
            <span className="admin-head__meta">
              Track lifecycle, portal access, applications, sites, and projects.
            </span>
          </li>
        </ul>
      </nav>
    </div>
  );
}
