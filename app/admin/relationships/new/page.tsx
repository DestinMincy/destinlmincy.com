import type { Metadata } from "next";
import Link from "next/link";

import { createRelationshipAction } from "@/app/admin/relationships/actions";
import { RelationshipForm } from "@/components/admin/RelationshipForm";
import { requireAdminForPage } from "@/lib/auth/require-admin";
import { EMPTY_RELATIONSHIP_FORM_VALUES } from "@/lib/relationships/types";

export const metadata: Metadata = {
  title: "New client relationship",
};

export default async function NewRelationshipPage() {
  await requireAdminForPage();

  return (
    <div className="container section section--tight narrow admin-screen">
      <nav aria-label="Breadcrumb">
        <Link className="admin-breadcrumb" href="/admin/relationships">
          Client relationships
        </Link>
      </nav>

      <header>
        <p className="eyebrow">New relationship</p>
        <h1 className="admin-title">Start a client relationship</h1>
      </header>

      <div className="admin-panel">
        <RelationshipForm
          action={createRelationshipAction}
          initialValues={EMPTY_RELATIONSHIP_FORM_VALUES}
          submitLabel="Create relationship"
        />
      </div>
    </div>
  );
}
