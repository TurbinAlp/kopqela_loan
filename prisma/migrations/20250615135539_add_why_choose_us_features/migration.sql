/*
  Warnings:

  - You are about to drop the column `business_id` on the `user_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `business_id` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_sessions" DROP CONSTRAINT "user_sessions_business_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_business_id_fkey";

-- DropIndex
DROP INDEX "businesses_owner_id_key";

-- AlterTable
ALTER TABLE "business_settings" ADD COLUMN     "feature1_description" VARCHAR(255),
ADD COLUMN     "feature1_description_swahili" VARCHAR(255),
ADD COLUMN     "feature1_icon" VARCHAR(50),
ADD COLUMN     "feature1_title" VARCHAR(100),
ADD COLUMN     "feature1_title_swahili" VARCHAR(100),
ADD COLUMN     "feature2_description" VARCHAR(255),
ADD COLUMN     "feature2_description_swahili" VARCHAR(255),
ADD COLUMN     "feature2_icon" VARCHAR(50),
ADD COLUMN     "feature2_title" VARCHAR(100),
ADD COLUMN     "feature2_title_swahili" VARCHAR(100),
ADD COLUMN     "feature3_description" VARCHAR(255),
ADD COLUMN     "feature3_description_swahili" VARCHAR(255),
ADD COLUMN     "feature3_icon" VARCHAR(50),
ADD COLUMN     "feature3_title" VARCHAR(100),
ADD COLUMN     "feature3_title_swahili" VARCHAR(100),
ADD COLUMN     "feature4_description" VARCHAR(255),
ADD COLUMN     "feature4_description_swahili" VARCHAR(255),
ADD COLUMN     "feature4_icon" VARCHAR(50),
ADD COLUMN     "feature4_title" VARCHAR(100),
ADD COLUMN     "feature4_title_swahili" VARCHAR(100);

-- AlterTable
ALTER TABLE "user_sessions" DROP COLUMN "business_id";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "business_id";
