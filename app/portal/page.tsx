import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { findClientMembershipByClerkUserId } from "@/lib/auth/client-membership";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Client Portal",
};

export default async function PortalPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const membership = await findClientMembershipByClerkUserId(userId);

  if (!membership) {
    return (
      <div className="container section section--tight narrow">
        <p className="eyebrow">Client Portal</p>
        <h1>No client relationship on file</h1>
        <p className="lead">
          This account isn&apos;t linked to a client relationship yet. Email{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a> and we will get
          you connected.
        </p>
      </div>
    );
  }

  return (
    <div className="container section section--tight narrow">
      <p className="eyebrow">Client Portal</p>
      <h1>{membership.clientRelationshipName}</h1>
      <p className="lead">
        Portal access is confirmed. Contract, payment, and milestone tools
        land here in a later unit.
      </p>
    </div>
  );
}
