-- CreateEnum
CREATE TYPE "ClientUserStatus" AS ENUM ('ACTIVE', 'REMOVED');

-- AlterTable
ALTER TABLE "client_relationships" ADD COLUMN     "legalName" TEXT,
ADD COLUMN     "primaryContactEmail" TEXT,
ADD COLUMN     "primaryContactName" TEXT,
ADD COLUMN     "primaryContactPhone" TEXT;

-- AlterTable
ALTER TABLE "client_users" ADD COLUMN     "status" "ClientUserStatus" NOT NULL DEFAULT 'ACTIVE';
