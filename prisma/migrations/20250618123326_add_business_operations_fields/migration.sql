-- AlterTable
ALTER TABLE "business_settings" ADD COLUMN     "business_hours" JSONB,
ADD COLUMN     "delivery_areas" JSONB,
ADD COLUMN     "delivery_fee" DECIMAL(10,2),
ADD COLUMN     "estimated_delivery_time" VARCHAR(100),
ADD COLUMN     "free_delivery_minimum" DECIMAL(10,2),
ADD COLUMN     "payment_methods" JSONB;
