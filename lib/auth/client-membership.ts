import { prisma } from "@/lib/db/client";

export interface ClientMembership {
  clientUserId: string;
  clientRelationshipId: string;
  clientRelationshipName: string;
}

/**
 * Looks up the client relationship a Clerk user is attached to, if any.
 * A Clerk user with no matching `ClientUser` row has no portal access.
 */
export async function findClientMembershipByClerkUserId(
  clerkUserId: string,
): Promise<ClientMembership | null> {
  const clientUser = await prisma.clientUser.findFirst({
    where: { clerkUserId },
    orderBy: { createdAt: "asc" },
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
