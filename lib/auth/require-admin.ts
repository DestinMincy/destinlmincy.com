import { currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

import { isAdminEmail } from "@/lib/auth/admin-allowlist";

/**
 * Resolves the signed-in Clerk user only when their primary email is on
 * the `ADMIN_EMAILS` allowlist. Returns null for signed-out visitors and
 * signed-in non-admins alike.
 *
 * Middleware already requires a session before `/admin(.*)` renders;
 * this is the defense-in-depth check every admin page and mutation must
 * repeat server-side (Unit 03 pattern).
 */
export async function getAdminUser() {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  if (!isAdminEmail(user.primaryEmailAddress?.emailAddress ?? null)) {
    return null;
  }

  return user;
}

/**
 * Page-level admin gate matching the Unit 03 `/admin` behavior exactly:
 * signed-out visitors are sent to sign-in and signed-in non-admins get a
 * 404 so admin surfaces do not advertise their existence.
 */
export async function requireAdminForPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (!isAdminEmail(user.primaryEmailAddress?.emailAddress ?? null)) {
    notFound();
  }

  return user;
}
