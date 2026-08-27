import { currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

import { isAdminEmail } from "@/lib/auth/admin-allowlist";

function isVerifiedAdmin(
  user: NonNullable<Awaited<ReturnType<typeof currentUser>>>,
): boolean {
  const primaryEmail = user.primaryEmailAddress;
  return (
    primaryEmail?.verification?.status === "verified" &&
    isAdminEmail(primaryEmail.emailAddress)
  );
}

export async function getAdminUser() {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  if (!isVerifiedAdmin(user)) {
    return null;
  }

  return user;
}

export async function requireAdminForPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (!isVerifiedAdmin(user)) {
    notFound();
  }

  return user;
}
