import { currentUser } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { isAdminEmail } from "@/lib/auth/admin-allowlist";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function AdminPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (!isAdminEmail(user.primaryEmailAddress?.emailAddress ?? null)) {
    notFound();
  }

  return (
    <div className="container section section--tight narrow">
      <p className="eyebrow">Admin</p>
      <h1>Operator console</h1>
      <p className="lead">
        Client relationships, contracts, and payment gates get a real
        workspace here in a later unit.
      </p>
    </div>
  );
}
