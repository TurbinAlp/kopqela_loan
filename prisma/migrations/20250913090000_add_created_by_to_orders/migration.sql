-- Add created_by column to orders (nullable)
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "created_by" INTEGER;


