-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "address" VARCHAR(500),
ADD COLUMN     "date_of_birth" TIMESTAMP(3),
ADD COLUMN     "id_number" VARCHAR(50),
ADD COLUMN     "occupation" VARCHAR(255);
