-- CreateEnum
CREATE TYPE "payment_plan" AS ENUM ('FULL', 'PARTIAL', 'CREDIT');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "payment_plan" "payment_plan" NOT NULL DEFAULT 'FULL';
