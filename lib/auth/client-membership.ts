import { prisma } from "@/lib/db/client";

export interface ClientMembership {
  clientUserId: string;
  clientRelationshipId: string;
  clientRelationshipName: string;
}

/**
 * Looks up the client relationship a Clerk user is attached to, if any.
 * A Clerk user with no matching, active `ClientUser` row has no portal
 * access: a removed/deactivated membership (`status: "REMOVED"`) is
 * excluded here, which is what actually revokes portal access when an
 * admin deactivates a client user.
 *
 * The domain model intentionally allows one Clerk user to belong to
 * multiple client relationships (no unique constraint on `clerkUserId`).
 * Portal v1 surfaces a single relationship, so this helper returns the
 * oldest active membership deterministically; multi-relationship
 * selection UX belongs to the client portal unit.
 */
export async function findClientMembershipByClerkUserId(
  clerkUserId: string,
): Promise<ClientMembership | null> {
  const clientUser = await prisma.clientUser.findFirst({
    where: { clerkUserId, status: "ACTIVE" },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: {
      id: true,
      clientRelationshipId: true,
      clientRelationship: { select: { name: true } },
    },
  });

  if (!clientUser) {
    return null;
  }

  return {
    clientUserId: clientUser.id,
    clientRelationshipId: clientUser.clientRelationshipId,
    clientRelationshipName: clientUser.clientRelationship.name,
  };
}
