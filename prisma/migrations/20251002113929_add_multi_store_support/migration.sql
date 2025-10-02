-- CreateEnum
CREATE TYPE "service_type" AS ENUM ('LEASE');

-- CreateEnum
CREATE TYPE "duration_unit" AS ENUM ('MINUTES', 'HOURS', 'DAYS', 'WEEKS', 'MONTHS', 'YEARS');

-- CreateEnum
CREATE TYPE "service_item_status" AS ENUM ('AVAILABLE', 'RENTED', 'BOOKED', 'MAINTENANCE');

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_product_id_fkey";

-- AlterTable
ALTER TABLE "inventory" ADD COLUMN     "store_id" INTEGER;

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "service_item_id" INTEGER,
ALTER COLUMN "product_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "stores" (
    "id" SERIAL NOT NULL,
    "business_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "name_swahili" VARCHAR(255),
    "store_type" VARCHAR(50) NOT NULL DEFAULT 'retail_store',
    "address" VARCHAR(500),
    "city" VARCHAR(100),
    "region" VARCHAR(100),
    "phone" VARCHAR(20),
    "email" VARCHAR(255),
    "manager_id" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" SERIAL NOT NULL,
    "business_id" INTEGER NOT NULL,
    "service_type" "service_type" NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "name_swahili" VARCHAR(255),
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_items" (
    "id" SERIAL NOT NULL,
    "service_id" INTEGER NOT NULL,
    "item_number" VARCHAR(100) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "name_swahili" VARCHAR(255),
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "duration_value" INTEGER NOT NULL,
    "duration_unit" "duration_unit" NOT NULL,
    "status" "service_item_status" NOT NULL DEFAULT 'AVAILABLE',
    "current_rental_start" TIMESTAMP(3),
    "current_rental_end" TIMESTAMP(3),
    "current_customer_id" INTEGER,
    "specifications" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stores_business_id_name_key" ON "stores"("business_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "service_items_service_id_item_number_key" ON "service_items"("service_id", "item_number");

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_service_item_id_fkey" FOREIGN KEY ("service_item_id") REFERENCES "service_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_items" ADD CONSTRAINT "service_items_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_items" ADD CONSTRAINT "service_items_current_customer_id_fkey" FOREIGN KEY ("current_customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
