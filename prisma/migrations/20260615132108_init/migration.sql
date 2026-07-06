-- CreateEnum
CREATE TYPE "ClientRelationshipLifecycle" AS ENUM ('LEAD', 'DISCOVERY', 'PROPOSAL', 'CONTRACTED', 'AWAITING_PAYMENT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ContractTemplateStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PaymentGateStatus" AS ENUM ('PENDING', 'ATTACHED', 'PAID', 'WAIVED');

-- CreateEnum
CREATE TYPE "SubscriptionServiceType" AS ENUM ('HOSTING', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "SubscriptionReferenceStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED', 'PAUSED', 'OVERRIDDEN');

-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETE');

-- CreateTable
CREATE TABLE "client_relationships" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "lifecycle" "ClientRelationshipLifecycle" NOT NULL DEFAULT 'LEAD',
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_relationships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_users" (
    "id" TEXT NOT NULL,
    "clientRelationshipId" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_sites" (
    "id" TEXT NOT NULL,
    "clientRelationshipId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "primaryUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "application_sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "clientRelationshipId" TEXT NOT NULL,
    "applicationSiteId" TEXT,
    "name" TEXT NOT NULL,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_templates" (
    "id" TEXT NOT NULL,
    "clientRelationshipId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "ContractTemplateStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contract_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_template_versions" (
    "id" TEXT NOT NULL,
    "contractTemplateId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "snapshot" JSONB,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contract_template_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_gates" (
    "id" TEXT NOT NULL,
    "clientRelationshipId" TEXT NOT NULL,
    "projectId" TEXT,
    "label" TEXT NOT NULL,
    "status" "PaymentGateStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_gates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_references" (
    "id" TEXT NOT NULL,
    "clientRelationshipId" TEXT NOT NULL,
    "applicationSiteId" TEXT,
    "projectId" TEXT,
    "serviceType" "SubscriptionServiceType" NOT NULL,
    "status" "SubscriptionReferenceStatus" NOT NULL DEFAULT 'ACTIVE',
    "clerkSubscriptionId" TEXT,
    "entitlementKey" TEXT,
    "currentPeriodEndsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "milestones" (
    "id" TEXT NOT NULL,
    "clientRelationshipId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "MilestoneStatus" NOT NULL DEFAULT 'PLANNED',
    "targetDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deliverables" (
    "id" TEXT NOT NULL,
    "clientRelationshipId" TEXT NOT NULL,
    "projectId" TEXT,
    "milestoneId" TEXT,
    "label" TEXT NOT NULL,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deliverables_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "client_relationships_slug_key" ON "client_relationships"("slug");

-- CreateIndex
CREATE INDEX "client_users_clerkUserId_idx" ON "client_users"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "client_users_clientRelationshipId_clerkUserId_key" ON "client_users"("clientRelationshipId", "clerkUserId");

-- CreateIndex
CREATE INDEX "application_sites_clientRelationshipId_idx" ON "application_sites"("clientRelationshipId");

-- CreateIndex
CREATE INDEX "projects_clientRelationshipId_idx" ON "projects"("clientRelationshipId");

-- CreateIndex
CREATE INDEX "projects_applicationSiteId_idx" ON "projects"("applicationSiteId");

-- CreateIndex
CREATE INDEX "contract_templates_clientRelationshipId_idx" ON "contract_templates"("clientRelationshipId");

-- CreateIndex
CREATE UNIQUE INDEX "contract_template_versions_contractTemplateId_versionNumber_key" ON "contract_template_versions"("contractTemplateId", "versionNumber");

-- CreateIndex
CREATE INDEX "payment_gates_clientRelationshipId_idx" ON "payment_gates"("clientRelationshipId");

-- CreateIndex
CREATE INDEX "payment_gates_projectId_idx" ON "payment_gates"("projectId");

-- CreateIndex
CREATE INDEX "subscription_references_clientRelationshipId_idx" ON "subscription_references"("clientRelationshipId");

-- CreateIndex
CREATE INDEX "subscription_references_applicationSiteId_idx" ON "subscription_references"("applicationSiteId");

-- CreateIndex
CREATE INDEX "subscription_references_projectId_idx" ON "subscription_references"("projectId");

-- CreateIndex
CREATE INDEX "subscription_references_clerkSubscriptionId_idx" ON "subscription_references"("clerkSubscriptionId");

-- CreateIndex
CREATE INDEX "milestones_clientRelationshipId_idx" ON "milestones"("clientRelationshipId");

-- CreateIndex
CREATE INDEX "milestones_projectId_idx" ON "milestones"("projectId");

-- CreateIndex
CREATE INDEX "deliverables_clientRelationshipId_idx" ON "deliverables"("clientRelationshipId");

-- CreateIndex
CREATE INDEX "deliverables_projectId_idx" ON "deliverables"("projectId");

-- CreateIndex
CREATE INDEX "deliverables_milestoneId_idx" ON "deliverables"("milestoneId");

-- AddForeignKey
ALTER TABLE "client_users" ADD CONSTRAINT "client_users_clientRelationshipId_fkey" FOREIGN KEY ("clientRelationshipId") REFERENCES "client_relationships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_sites" ADD CONSTRAINT "application_sites_clientRelationshipId_fkey" FOREIGN KEY ("clientRelationshipId") REFERENCES "client_relationships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_clientRelationshipId_fkey" FOREIGN KEY ("clientRelationshipId") REFERENCES "client_relationships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_applicationSiteId_fkey" FOREIGN KEY ("applicationSiteId") REFERENCES "application_sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_templates" ADD CONSTRAINT "contract_templates_clientRelationshipId_fkey" FOREIGN KEY ("clientRelationshipId") REFERENCES "client_relationships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_template_versions" ADD CONSTRAINT "contract_template_versions_contractTemplateId_fkey" FOREIGN KEY ("contractTemplateId") REFERENCES "contract_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_gates" ADD CONSTRAINT "payment_gates_clientRelationshipId_fkey" FOREIGN KEY ("clientRelationshipId") REFERENCES "client_relationships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_gates" ADD CONSTRAINT "payment_gates_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_references" ADD CONSTRAINT "subscription_references_clientRelationshipId_fkey" FOREIGN KEY ("clientRelationshipId") REFERENCES "client_relationships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_references" ADD CONSTRAINT "subscription_references_applicationSiteId_fkey" FOREIGN KEY ("applicationSiteId") REFERENCES "application_sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_references" ADD CONSTRAINT "subscription_references_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_clientRelationshipId_fkey" FOREIGN KEY ("clientRelationshipId") REFERENCES "client_relationships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_clientRelationshipId_fkey" FOREIGN KEY ("clientRelationshipId") REFERENCES "client_relationships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "milestones"("id") ON DELETE SET NULL ON UPDATE CASCADE;
