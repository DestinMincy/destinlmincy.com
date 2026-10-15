import { SignOutButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { PortalNav } from "@/components/portal/PortalNav";
import { findClientMembershipByClerkUserId } from "@/lib/auth/client-membership";
import { site } from "@/lib/site";

export default async function PortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect_url=/portal");
  }

  const membership = await findClientMembershipByClerkUserId(userId);

  if (!membership) {
    return (
      <div className="container section section--tight narrow">
        <p className="eyebrow">Client Portal</p>
        <h1>No client relationship on file</h1>
        <p className="lead">
          This account is not linked to a client relationship yet. Email{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a> and we will get
          you connected.
        </p>
      </div>
    );
  }

  return (
    <div className="portal-shell">
      <header className="portal-header">
        <div className="container portal-header__inner">
          <div className="portal-header__identity">
            <Link href="/portal" className="portal-header__brand">
              {membership.clientRelationshipName}
            </Link>
            <span className="eyebrow">Client Portal</span>
          </div>
          <div className="portal-header__actions">
            <SignOutButton>
              <button
                type="button"
                className="button button--secondary button--compact"
              >
                Sign out
              </button>
            </SignOutButton>
          </div>
        </div>
        <div className="container">
          <PortalNav />
        </div>
      </header>
      <main className="portal-main">{children}</main>
    </div>
  );
}
