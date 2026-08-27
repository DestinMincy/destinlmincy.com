CREATE TYPE "ApplicationSiteType" AS ENUM ('WEBSITE', 'WEB_APPLICATION', 'INTERNAL_TOOL', 'OTHER');
CREATE TYPE "ApplicationSiteStatus" AS ENUM ('ACTIVE', 'ARCHIVED');
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'ARCHIVED');

ALTER TABLE "application_sites"
RENAME COLUMN "primaryUrl" TO "productionUrl";

ALTER TABLE "application_sites"
ADD COLUMN "type" "ApplicationSiteType" NOT NULL DEFAULT 'WEBSITE',
ADD COLUMN "status" "ApplicationSiteStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN "stagingUrl" TEXT,
ADD COLUMN "repositoryUrl" TEXT;

ALTER TABLE "projects"
ADD COLUMN "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNED',
ADD COLUMN "clientDescription" TEXT,
ADD COLUMN "createsNewAsset" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "startsAt" TIMESTAMP(3),
ADD COLUMN "targetDate" TIMESTAMP(3);
