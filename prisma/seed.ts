import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { getDatabaseUrl } from "../lib/db/database-url";
import { PrismaClient } from "../lib/generated/prisma/client";

const pool = new Pool({
  connectionString: getDatabaseUrl(),
});
pool.on("error", (error) => {
  console.error("Unexpected error on idle Postgres client", error);
});
const adapter = new PrismaPg(pool, {
  disposeExternalPool: true,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.clientRelationship.deleteMany({
    where: {
      slug: "dlm-demo",
    },
  });

  const relationship = await prisma.clientRelationship.create({
    data: {
      lifecycle: "ACTIVE",
      name: "DLM Demo Relationship",
      slug: "dlm-demo",
      legalName: "DLM Demo Relationship LLC",
      primaryContactName: "Example Client",
      primaryContactEmail: "client@example.test",
      primaryContactPhone: "555-0100",
      summary: "Local seed relationship for Unit 02 database verification.",
    },
  });

  const user = await prisma.clientUser.create({
    data: {
      clientRelationshipId: relationship.id,
      clerkUserId: "user_unit02_demo",
      email: "client@example.test",
      name: "Example Client",
      status: "ACTIVE",
    },
  });

  const removedUser = await prisma.clientUser.create({
    data: {
      clientRelationshipId: relationship.id,
      clerkUserId: "user_unit04_removed_demo",
      email: "former-client@example.test",
      name: "Former Client Contact",
      status: "REMOVED",
    },
  });

  const application = await prisma.applicationSite.create({
    data: {
      clientRelationshipId: relationship.id,
      name: "destinlmincy.com",
      primaryUrl: "https://destinlmincy.com",
    },
  });

  const project = await prisma.project.create({
    data: {
      applicationSiteId: application.id,
      clientRelationshipId: relationship.id,
      name: "Next.js Relationship OS Foundation",
      summary: "Seed project proving the app/site and project shell.",
    },
  });

  const template = await prisma.contractTemplate.create({
    data: {
      clientRelationshipId: relationship.id,
      name: "Seed Services Agreement",
      status: "DRAFT",
      versions: {
        create: {
          versionNumber: 1,
          snapshot: {
            blocks: [],
            note: "Shell only. Unit 06 owns contract template behavior.",
          },
        },
      },
    },
  });

  const paymentGate = await prisma.paymentGate.create({
    data: {
      clientRelationshipId: relationship.id,
      label: "Seed upfront project payment",
      projectId: project.id,
    },
  });

  const subscription = await prisma.subscriptionReference.create({
    data: {
      applicationSiteId: application.id,
      clientRelationshipId: relationship.id,
      entitlementKey: "hosting",
      serviceType: "HOSTING",
    },
  });

  const milestone = await prisma.milestone.create({
    data: {
      clientRelationshipId: relationship.id,
      projectId: project.id,
      title: "Foundation verified",
    },
  });

  const deliverable = await prisma.deliverable.create({
    data: {
      clientRelationshipId: relationship.id,
      label: "Seed project link",
      milestoneId: milestone.id,
      projectId: project.id,
      url: "https://destinlmincy.com",
    },
  });

  console.log(
    JSON.stringify(
      {
        applicationSiteId: application.id,
        clientRelationshipId: relationship.id,
        clientUserId: user.id,
        removedClientUserId: removedUser.id,
        contractTemplateId: template.id,
        deliverableId: deliverable.id,
        milestoneId: milestone.id,
        paymentGateId: paymentGate.id,
        projectId: project.id,
        subscriptionReferenceId: subscription.id,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
