/*
  Warnings:

  - A unique constraint covering the columns `[business_id,product_id,location]` on the table `inventory` will be added. If there are existing duplicate values, this will fail.
  - Made the column `location` on table `inventory` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "inventory_business_id_product_id_key";

-- AlterTable
ALTER TABLE "inventory" ALTER COLUMN "location" SET NOT NULL,
ALTER COLUMN "location" SET DEFAULT 'main_store';

-- CreateTable
CREATE TABLE "inventory_movements" (
    "id" SERIAL NOT NULL,
    "business_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "from_location" VARCHAR(100),
    "to_location" VARCHAR(100) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "movement_type" VARCHAR(50) NOT NULL,
    "reason" VARCHAR(255),
    "reference_id" VARCHAR(100),
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inventory_business_id_product_id_location_key" ON "inventory"("business_id", "product_id", "location");

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
