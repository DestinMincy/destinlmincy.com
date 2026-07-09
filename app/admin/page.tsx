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
          Client relationships are live. Contracts, projects, and payment
          gates get their workspaces in later units.
        </p>
      </header>

      <div className="admin-panel">
        <h2 className="admin-panel__title">Workspaces</h2>
        <ul className="admin-nav-list">
          <li>
            <Link href="/admin/relationships">Client relationships</Link>
            <span className="admin-head__meta">
              Create relationships, track lifecycle, manage portal access.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
