-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'superadmin', 'trader');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Credential" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Credential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "UserInformation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "company" TEXT,
    "city" TEXT,
    "country" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserInformation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mt5Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "server" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mt5Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradeCopierAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mt5AccountId" TEXT,
    "account_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "broker" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "server" TEXT NOT NULL,
    "environment" TEXT,
    "status" INTEGER NOT NULL DEFAULT 1,
    "groupid" TEXT,
    "subscription_key" TEXT,
    "ccy" TEXT,
    "balance" DOUBLE PRECISION,
    "equity" DOUBLE PRECISION,
    "state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TradeCopierAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EaConfig" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eaName" TEXT NOT NULL,
    "magicNumber" INTEGER NOT NULL,
    "symbol" TEXT NOT NULL,
    "timeframe" TEXT NOT NULL,
    "lotSize" DOUBLE PRECISION NOT NULL,
    "stopLoss" INTEGER NOT NULL,
    "takeProfit" INTEGER NOT NULL,
    "maxTrades" INTEGER NOT NULL,
    "tradingHoursStart" INTEGER NOT NULL,
    "tradingHoursEnd" INTEGER NOT NULL,
    "riskPercent" DOUBLE PRECISION NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "customParams" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EaConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotAssignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "magicNumber" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BotAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "performedById" TEXT NOT NULL,
    "targetUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelConfig" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "risk_factor_value" DOUBLE PRECISION NOT NULL,
    "risk_factor_type" INTEGER NOT NULL,
    "copier_status" INTEGER NOT NULL DEFAULT 1,
    "max_order_size" DOUBLE PRECISION,
    "min_order_size" DOUBLE PRECISION,
    "pending_order" INTEGER NOT NULL DEFAULT 1,
    "stop_loss" INTEGER NOT NULL DEFAULT 0,
    "take_profit" INTEGER NOT NULL DEFAULT 0,
    "stop_loss_fixed_format" INTEGER NOT NULL DEFAULT 2,
    "take_profit_fixed_format" INTEGER NOT NULL DEFAULT 2,
    "advancedSettings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModelConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradingModel" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "masterAccountId" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "group_id" TEXT,
    "ownerId" TEXT,
    "isClone" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TradingModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncConfig" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "masterAccountId" TEXT NOT NULL,
    "slaveAccountId" TEXT NOT NULL,
    "risk_factor_value" DOUBLE PRECISION NOT NULL,
    "risk_factor_type" INTEGER NOT NULL,
    "copier_status" INTEGER NOT NULL DEFAULT 1,
    "max_order_size" DOUBLE PRECISION,
    "min_order_size" DOUBLE PRECISION,
    "pending_order" INTEGER NOT NULL DEFAULT 1,
    "stop_loss" INTEGER NOT NULL DEFAULT 0,
    "take_profit" INTEGER NOT NULL DEFAULT 0,
    "stop_loss_fixed_format" INTEGER NOT NULL DEFAULT 2,
    "take_profit_fixed_format" INTEGER NOT NULL DEFAULT 2,
    "advancedSettings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyncConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "Credential_userId_key" ON "Credential"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "UserInformation_userId_key" ON "UserInformation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Mt5Account_userId_key" ON "Mt5Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TradeCopierAccount_mt5AccountId_key" ON "TradeCopierAccount"("mt5AccountId");

-- CreateIndex
CREATE UNIQUE INDEX "TradeCopierAccount_account_id_key" ON "TradeCopierAccount"("account_id");

-- CreateIndex
CREATE INDEX "TradeCopierAccount_userId_idx" ON "TradeCopierAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EaConfig_magicNumber_key" ON "EaConfig"("magicNumber");

-- CreateIndex
CREATE INDEX "EaConfig_userId_idx" ON "EaConfig"("userId");

-- CreateIndex
CREATE INDEX "BotAssignment_userId_idx" ON "BotAssignment"("userId");

-- CreateIndex
CREATE INDEX "BotAssignment_magicNumber_idx" ON "BotAssignment"("magicNumber");

-- CreateIndex
CREATE UNIQUE INDEX "BotAssignment_userId_magicNumber_key" ON "BotAssignment"("userId", "magicNumber");

-- CreateIndex
CREATE INDEX "UserAuditLog_performedById_idx" ON "UserAuditLog"("performedById");

-- CreateIndex
CREATE INDEX "UserAuditLog_targetUserId_idx" ON "UserAuditLog"("targetUserId");

-- CreateIndex
CREATE INDEX "ModelConfig_userId_idx" ON "ModelConfig"("userId");

-- CreateIndex
CREATE INDEX "TradingModel_userId_idx" ON "TradingModel"("userId");

-- CreateIndex
CREATE INDEX "TradingModel_configId_idx" ON "TradingModel"("configId");

-- CreateIndex
CREATE INDEX "SyncConfig_userId_idx" ON "SyncConfig"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SyncConfig_masterAccountId_slaveAccountId_key" ON "SyncConfig"("masterAccountId", "slaveAccountId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInformation" ADD CONSTRAINT "UserInformation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mt5Account" ADD CONSTRAINT "Mt5Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeCopierAccount" ADD CONSTRAINT "TradeCopierAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradeCopierAccount" ADD CONSTRAINT "TradeCopierAccount_mt5AccountId_fkey" FOREIGN KEY ("mt5AccountId") REFERENCES "Mt5Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EaConfig" ADD CONSTRAINT "EaConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotAssignment" ADD CONSTRAINT "BotAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotAssignment" ADD CONSTRAINT "BotAssignment_magicNumber_fkey" FOREIGN KEY ("magicNumber") REFERENCES "EaConfig"("magicNumber") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAuditLog" ADD CONSTRAINT "UserAuditLog_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAuditLog" ADD CONSTRAINT "UserAuditLog_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelConfig" ADD CONSTRAINT "ModelConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradingModel" ADD CONSTRAINT "TradingModel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TradingModel" ADD CONSTRAINT "TradingModel_configId_fkey" FOREIGN KEY ("configId") REFERENCES "ModelConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyncConfig" ADD CONSTRAINT "SyncConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
