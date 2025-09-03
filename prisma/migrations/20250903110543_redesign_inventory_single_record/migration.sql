/*
  Warnings:

  - You are about to drop the column `location` on the `inventory` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `inventory` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[business_id,product_id]` on the table `inventory` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "inventory_business_id_product_id_location_key";

-- AlterTable
ALTER TABLE "inventory" DROP COLUMN "location",
DROP COLUMN "quantity",
ADD COLUMN     "main_store_quantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "retail_store_quantity" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "inventory_business_id_product_id_key" ON "inventory"("business_id", "product_id");
