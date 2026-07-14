import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { updateRelationshipAction } from "@/app/admin/relationships/actions";
import { RelationshipForm } from "@/components/admin/RelationshipForm";
import { requireAdminForPage } from "@/lib/auth/require-admin";
import { getClientRelationshipWithUsers } from "@/lib/relationships/queries";

export const metadata: Metadata = {
  title: "Edit client relationship",
};

interface EditRelationshipPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRelationshipPage({
  params,
}: EditRelationshipPageProps) {
  await requireAdminForPage();

  const { id } = await params;
  const relationship = await getClientRelationshipWithUsers(id);

  if (!relationship) {
    notFound();
  }

  return (
    <div className="container section section--tight narrow admin-screen">
      <nav aria-label="Breadcrumb">
        <Link
          className="admin-breadcrumb"
          href={`/admin/relationships/${relationship.id}`}
        >
          {relationship.name}
        </Link>
      </nav>

      <header>
        <p className="eyebrow">Edit relationship</p>
        <h1 className="admin-title">{relationship.name}</h1>
      </header>

      <div className="admin-panel">
        <RelationshipForm
          key={relationship.id}
          action={updateRelationshipAction.bind(null, relationship.id)}
          initialValues={{
            name: relationship.name,
            legalName: relationship.legalName ?? "",
            primaryContactName: relationship.primaryContactName ?? "",
            primaryContactEmail: relationship.primaryContactEmail ?? "",
            primaryContactPhone: relationship.primaryContactPhone ?? "",
            summary: relationship.summary ?? "",
            lifecycle: relationship.lifecycle,
          }}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
}
