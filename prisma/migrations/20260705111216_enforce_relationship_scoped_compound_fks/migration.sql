-- DropForeignKey
ALTER TABLE "deliverables" DROP CONSTRAINT "deliverables_milestoneId_fkey";

-- DropForeignKey
ALTER TABLE "deliverables" DROP CONSTRAINT "deliverables_projectId_fkey";

-- DropForeignKey
ALTER TABLE "milestones" DROP CONSTRAINT "milestones_projectId_fkey";

-- DropForeignKey
ALTER TABLE "payment_gates" DROP CONSTRAINT "payment_gates_projectId_fkey";

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_applicationSiteId_fkey";

-- DropForeignKey
ALTER TABLE "subscription_references" DROP CONSTRAINT "subscription_references_applicationSiteId_fkey";

-- DropForeignKey
ALTER TABLE "subscription_references" DROP CONSTRAINT "subscription_references_projectId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "application_sites_id_clientRelationshipId_key" ON "application_sites"("id", "clientRelationshipId");

-- CreateIndex
CREATE UNIQUE INDEX "milestones_id_clientRelationshipId_key" ON "milestones"("id", "clientRelationshipId");

-- CreateIndex
CREATE UNIQUE INDEX "projects_id_clientRelationshipId_key" ON "projects"("id", "clientRelationshipId");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_applicationSiteId_clientRelationshipId_fkey" FOREIGN KEY ("applicationSiteId", "clientRelationshipId") REFERENCES "application_sites"("id", "clientRelationshipId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_gates" ADD CONSTRAINT "payment_gates_projectId_clientRelationshipId_fkey" FOREIGN KEY ("projectId", "clientRelationshipId") REFERENCES "projects"("id", "clientRelationshipId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_references" ADD CONSTRAINT "subscription_references_applicationSiteId_clientRelationsh_fkey" FOREIGN KEY ("applicationSiteId", "clientRelationshipId") REFERENCES "application_sites"("id", "clientRelationshipId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_references" ADD CONSTRAINT "subscription_references_projectId_clientRelationshipId_fkey" FOREIGN KEY ("projectId", "clientRelationshipId") REFERENCES "projects"("id", "clientRelationshipId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_projectId_clientRelationshipId_fkey" FOREIGN KEY ("projectId", "clientRelationshipId") REFERENCES "projects"("id", "clientRelationshipId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_projectId_clientRelationshipId_fkey" FOREIGN KEY ("projectId", "clientRelationshipId") REFERENCES "projects"("id", "clientRelationshipId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_milestoneId_clientRelationshipId_fkey" FOREIGN KEY ("milestoneId", "clientRelationshipId") REFERENCES "milestones"("id", "clientRelationshipId") ON DELETE RESTRICT ON UPDATE CASCADE;
