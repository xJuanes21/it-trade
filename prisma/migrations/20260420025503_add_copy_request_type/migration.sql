-- CreateEnum
CREATE TYPE "CopyRequestType" AS ENUM ('START_COPYING', 'STOP_COPYING');

-- AlterTable
ALTER TABLE "CopyRequest" ADD COLUMN     "type" "CopyRequestType" NOT NULL DEFAULT 'START_COPYING';
