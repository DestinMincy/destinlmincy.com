import { prisma } from "@/lib/db/client";

/**
 * Lists all client relationships for the admin index, newest activity
 * first, with a count of active client users per relationship.
 */
export async function listClientRelationships() {
  return prisma.clientRelationship.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      legalName: true,
      lifecycle: true,
      primaryContactName: true,
      primaryContactEmail: true,
      updatedAt: true,
      _count: {
        select: {
          users: { where: { status: "ACTIVE" } },
        },
      },
    },
  });
}

/**
 * Loads one client relationship with its client users (active first)
 * for the admin detail view. Returns null when the id does not exist.
 */
export async function getClientRelationshipWithUsers(id: string) {
  return prisma.clientRelationship.findUnique({
    where: { id },
    include: {
      users: {
        orderBy: [{ status: "asc" }, { createdAt: "asc" }],
      },
    },
  });
}

export type ClientRelationshipListItem = Awaited<
  ReturnType<typeof listClientRelationships>
>[number];

export type ClientRelationshipDetail = NonNullable<
  Awaited<ReturnType<typeof getClientRelationshipWithUsers>>
>;
