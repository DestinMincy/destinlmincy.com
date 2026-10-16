import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdminForPage } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db/client";
import { EditSubscriptionForm } from "./EditSubscriptionForm";

export const metadata: Metadata = {
  title: "Edit subscription",
};

interface EditSubscriptionPageProps {
  params: Promise<{ id: string; subId: string }>;
}

export default async function EditSubscriptionPage({
  params,
}: EditSubscriptionPageProps) {
  await requireAdminForPage();

  const { id, subId } = await params;

  const subscription = await prisma.subscriptionReference.findFirst({
    where: { id: subId, clientRelationshipId: id },
  });

  if (!subscription) {
    notFound();
  }

  return (
    <div className="container section section--tight narrow admin-screen">
      <nav aria-label="Breadcrumb">
        <Link
          className="admin-breadcrumb"
          href={`/admin/relationships/${id}/subscriptions`}
        >
          Subscriptions
        </Link>
      </nav>

      <header>
        <p className="eyebrow">Edit subscription</p>
        <h1 className="admin-title">
          {subscription.serviceType === "HOSTING" ? "Hosting" : "Maintenance"}
        </h1>
      </header>

      <EditSubscriptionForm
        clientRelationshipId={id}
        subscriptionId={subId}
        defaultValues={{
          status: subscription.status,
          clerkSubscriptionId: subscription.clerkSubscriptionId ?? "",
          entitlementKey: subscription.entitlementKey ?? "",
          currentPeriodEndsAt: subscription.currentPeriodEndsAt
            ? subscription.currentPeriodEndsAt.toISOString().slice(0, 10)
            : "",
        }}
      />
    </div>
  );
}
