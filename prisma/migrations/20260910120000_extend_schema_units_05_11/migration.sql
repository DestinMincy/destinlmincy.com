-- Extend ProjectStatus enum with new values
ALTER TYPE "ProjectStatus" ADD VALUE IF NOT EXISTS 'ACTIVE';
ALTER TYPE "ProjectStatus" ADD VALUE IF NOT EXISTS 'ON_HOLD';
ALTER TYPE "ProjectStatus" ADD VALUE IF NOT EXISTS 'COMPLETE';

-- New enums
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'GENERATED', 'SENT_FOR_SIGNING', 'CLIENT_SIGNED', 'COMPLETE', 'VOIDED');
CREATE TYPE "PaymentGateType" AS ENUM ('FULL_UPFRONT', 'DEPOSIT', 'MILESTONE_PAYMENT', 'OTHER');
CREATE TYPE "MilestoneApprovalAction" AS ENUM ('APPROVED', 'CHANGES_REQUESTED');
CREATE TYPE "DeliverableType" AS ENUM ('LINK', 'DOCUMENT', 'VIDEO', 'OTHER');
CREATE TYPE "DeliverableVisibility" AS ENUM ('CLIENT', 'ADMIN_ONLY');

-- Extend application_sites
ALTER TABLE "application_sites"
ADD COLUMN "archivedAt" TIMESTAMP(3);

-- Extend projects
ALTER TABLE "projects"
ADD COLUMN "startDate" TIMESTAMP(3),
ADD COLUMN "clientFacingDescription" TEXT,
ADD COLUMN "archivedAt" TIMESTAMP(3);

-- Extend contract_template_versions
ALTER TABLE "contract_template_versions"
ADD COLUMN "blocks" JSONB,
ADD COLUMN "variables" JSONB,
ADD COLUMN "archivedAt" TIMESTAMP(3);

-- Extend payment_gates
ALTER TABLE "payment_gates"
ADD COLUMN "paymentType" "PaymentGateType" NOT NULL DEFAULT 'FULL_UPFRONT',
ADD COLUMN "amount" DECIMAL(12,2),
ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN "dueDate" TIMESTAMP(3),
ADD COLUMN "requiredBeforeWork" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "stripeUrl" TEXT,
ADD COLUMN "stripeId" TEXT;

-- Extend milestones
ALTER TABLE "milestones"
ADD COLUMN "clientFacingUpdate" TEXT,
ADD COLUMN "paymentDependencyId" TEXT,
ADD COLUMN "approvalRequired" BOOLEAN NOT NULL DEFAULT false;

-- Extend deliverables
ALTER TABLE "deliverables"
ADD COLUMN "type" "DeliverableType" NOT NULL DEFAULT 'LINK',
ADD COLUMN "notes" TEXT,
ADD COLUMN "visibility" "DeliverableVisibility" NOT NULL DEFAULT 'CLIENT';

-- New model: contracts
CREATE TABLE "contracts" (
    "id" TEXT NOT NULL,
    "clientRelationshipId" TEXT NOT NULL,
    "projectId" TEXT,
    "contractTemplateVersionId" TEXT,
    "fieldValues" JSONB,
    "status" "ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "signerClerkUserId" TEXT,
    "signerEmail" TEXT,
    "docusignEnvelopeId" TEXT,
    "docusignStatus" TEXT,
    "s3Key" TEXT,
    "s3Bucket" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "contracts_id_clientRelationshipId_key" ON "contracts"("id", "clientRelationshipId");
CREATE INDEX "contracts_clientRelationshipId_idx" ON "contracts"("clientRelationshipId");
CREATE INDEX "contracts_contractTemplateVersionId_idx" ON "contracts"("contractTemplateVersionId");

ALTER TABLE "contracts" ADD CONSTRAINT "contracts_clientRelationshipId_fkey" FOREIGN KEY ("clientRelationshipId") REFERENCES "client_relationships"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_contractTemplateVersionId_fkey" FOREIGN KEY ("contractTemplateVersionId") REFERENCES "contract_template_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- New model: milestone_approvals
CREATE TABLE "milestone_approvals" (
    "id" TEXT NOT NULL,
    "milestoneId" TEXT NOT NULL,
    "clientRelationshipId" TEXT NOT NULL,
    "actorClerkUserId" TEXT NOT NULL,
    "actorName" TEXT,
    "action" "MilestoneApprovalAction" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "milestone_approvals_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "milestone_approvals_milestoneId_idx" ON "milestone_approvals"("milestoneId");

ALTER TABLE "milestone_approvals" ADD CONSTRAINT "milestone_approvals_milestoneId_clientRelationshipId_fkey" FOREIGN KEY ("milestoneId", "clientRelationshipId") REFERENCES "milestones"("id", "clientRelationshipId") ON DELETE CASCADE ON UPDATE CASCADE;
