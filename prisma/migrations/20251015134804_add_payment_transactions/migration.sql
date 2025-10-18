-- CreateEnum
CREATE TYPE "mobile_money_provider" AS ENUM ('AZAMPESA', 'TIGOPESA', 'AIRTEL', 'HALOPESA');

-- CreateEnum
CREATE TYPE "payment_transaction_status" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'EXPIRED');

-- CreateTable
CREATE TABLE "payment_transactions" (
    "id" SERIAL NOT NULL,
    "business_id" INTEGER NOT NULL,
    "business_subscription_id" INTEGER,
    "plan_id" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'TZS',
    "provider" "mobile_money_provider" NOT NULL,
    "status" "payment_transaction_status" NOT NULL DEFAULT 'PENDING',
    "azampay_transaction_id" VARCHAR(255),
    "reference" VARCHAR(100) NOT NULL,
    "phone_number" VARCHAR(20) NOT NULL,
    "metadata" JSONB,
    "initiated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "failure_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_azampay_transaction_id_key" ON "payment_transactions"("azampay_transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_reference_key" ON "payment_transactions"("reference");

-- CreateIndex
CREATE INDEX "payment_transactions_business_id_idx" ON "payment_transactions"("business_id");

-- CreateIndex
CREATE INDEX "payment_transactions_status_idx" ON "payment_transactions"("status");

-- CreateIndex
CREATE INDEX "payment_transactions_created_at_idx" ON "payment_transactions"("created_at");

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
