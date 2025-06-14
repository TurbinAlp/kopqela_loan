/*
  Warnings:

  - You are about to drop the column `key` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `business_settings` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `businesses` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `businesses` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `businesses` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `businesses` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `businesses` table. All the data in the column will be lost.
  - You are about to drop the column `logo_url` on the `businesses` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `businesses` table. All the data in the column will be lost.
  - You are about to drop the column `primary_color` on the `businesses` table. All the data in the column will be lost.
  - You are about to drop the column `registration_number` on the `businesses` table. All the data in the column will be lost.
  - You are about to drop the column `secondary_color` on the `businesses` table. All the data in the column will be lost.
  - You are about to drop the column `timezone` on the `businesses` table. All the data in the column will be lost.
  - You are about to drop the column `image_url` on the `products` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[business_id]` on the table `business_settings` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "business_settings_business_id_key_key";

-- AlterTable
ALTER TABLE "business_settings" DROP COLUMN "key",
DROP COLUMN "value",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "city" VARCHAR(100),
ADD COLUMN     "country" VARCHAR(100) DEFAULT 'Tanzania',
ADD COLUMN     "currency" VARCHAR(3) NOT NULL DEFAULT 'TZS',
ADD COLUMN     "default_payment_method" VARCHAR(20) DEFAULT 'CASH',
ADD COLUMN     "description" TEXT,
ADD COLUMN     "email" VARCHAR(255),
ADD COLUMN     "enable_credit_sales" BOOLEAN DEFAULT false,
ADD COLUMN     "enable_inventory_tracking" BOOLEAN DEFAULT true,
ADD COLUMN     "enable_loyalty_program" BOOLEAN DEFAULT false,
ADD COLUMN     "enable_multi_currency" BOOLEAN DEFAULT false,
ADD COLUMN     "enable_multi_location" BOOLEAN DEFAULT false,
ADD COLUMN     "enable_tax_calculation" BOOLEAN DEFAULT true,
ADD COLUMN     "financial_year_start" VARCHAR(5) DEFAULT '01-01',
ADD COLUMN     "invoice_prefix" VARCHAR(10) DEFAULT 'INV',
ADD COLUMN     "language" VARCHAR(2) NOT NULL DEFAULT 'en',
ADD COLUMN     "logo_url" VARCHAR(500),
ADD COLUMN     "order_prefix" VARCHAR(10) DEFAULT 'ORD',
ADD COLUMN     "phone" VARCHAR(20),
ADD COLUMN     "postal_code" VARCHAR(20),
ADD COLUMN     "primary_color" VARCHAR(7),
ADD COLUMN     "receipt_footer_message" TEXT,
ADD COLUMN     "region" VARCHAR(100),
ADD COLUMN     "registration_number" VARCHAR(100),
ADD COLUMN     "retail_margin" DECIMAL(5,2) DEFAULT 50,
ADD COLUMN     "secondary_color" VARCHAR(7),
ADD COLUMN     "tax_rate" DECIMAL(5,2) DEFAULT 18,
ADD COLUMN     "timezone" VARCHAR(50) NOT NULL DEFAULT 'Africa/Dar_es_Salaam',
ADD COLUMN     "website" VARCHAR(255),
ADD COLUMN     "wholesale_margin" DECIMAL(5,2) DEFAULT 30;

-- AlterTable
ALTER TABLE "businesses" DROP COLUMN "address",
DROP COLUMN "currency",
DROP COLUMN "description",
DROP COLUMN "email",
DROP COLUMN "language",
DROP COLUMN "logo_url",
DROP COLUMN "phone",
DROP COLUMN "primary_color",
DROP COLUMN "registration_number",
DROP COLUMN "secondary_color",
DROP COLUMN "timezone";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "image_url";

-- CreateIndex
CREATE UNIQUE INDEX "business_settings_business_id_key" ON "business_settings"("business_id");
