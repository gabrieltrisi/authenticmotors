-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELED');

-- AlterTable
ALTER TABLE "CashMovement" ADD COLUMN     "appointmentId" TEXT;

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "customerName" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "vehicleModel" TEXT NOT NULL,
    "plate" TEXT,
    "serviceName" TEXT NOT NULL,
    "serviceCategory" TEXT,
    "vehicleSize" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "appointmentDate" TIMESTAMP(3) NOT NULL,
    "appointmentTime" TEXT NOT NULL,
    "notes" TEXT,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "source" TEXT NOT NULL DEFAULT 'site-authentic-motors',
    "confirmedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "reminderSentAt" TIMESTAMP(3),
    "confirmationSentAt" TIMESTAMP(3),

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Appointment_appointmentDate_idx" ON "Appointment"("appointmentDate");

-- CreateIndex
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");

-- CreateIndex
CREATE INDEX "Appointment_appointmentDate_appointmentTime_idx" ON "Appointment"("appointmentDate", "appointmentTime");

-- CreateIndex
CREATE UNIQUE INDEX "CashMovement_appointmentId_key" ON "CashMovement"("appointmentId");

-- AddForeignKey
ALTER TABLE "CashMovement" ADD CONSTRAINT "CashMovement_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
