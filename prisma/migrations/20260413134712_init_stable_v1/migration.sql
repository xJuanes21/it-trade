-- CreateEnum
CREATE TYPE "CopyRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "CredentialsApi" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CredentialsApi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CopyRequest" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "traderId" TEXT NOT NULL,
    "masterAccountId" TEXT NOT NULL,
    "slaveAccountId" TEXT NOT NULL,
    "status" "CopyRequestStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CopyRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CredentialsApi_userId_key" ON "CredentialsApi"("userId");

-- CreateIndex
CREATE INDEX "CopyRequest_followerId_idx" ON "CopyRequest"("followerId");

-- CreateIndex
CREATE INDEX "CopyRequest_traderId_idx" ON "CopyRequest"("traderId");

-- AddForeignKey
ALTER TABLE "CredentialsApi" ADD CONSTRAINT "CredentialsApi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CopyRequest" ADD CONSTRAINT "CopyRequest_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CopyRequest" ADD CONSTRAINT "CopyRequest_traderId_fkey" FOREIGN KEY ("traderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
