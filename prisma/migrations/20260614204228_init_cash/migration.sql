-- CreateEnum
CREATE TYPE "CashMovementType" AS ENUM ('ENTRY', 'EXIT');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'PIX', 'DEBIT_CARD', 'CREDIT_CARD', 'OTHER');

-- CreateTable
CREATE TABLE "CashMovement" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "CashMovementType" NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "category" TEXT,
    "customerName" TEXT,
    "serviceName" TEXT,
    "notes" TEXT,
    "movementDate" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "CashMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CashMovement_movementDate_idx" ON "CashMovement"("movementDate");
