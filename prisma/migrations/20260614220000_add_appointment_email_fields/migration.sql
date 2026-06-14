-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "canceledEmailSentAt" TIMESTAMP(3),
ADD COLUMN     "completedEmailSentAt" TIMESTAMP(3),
ADD COLUMN     "createdEmailSentAt" TIMESTAMP(3),
ADD COLUMN     "email" TEXT;
