-- Add business_category column to businesses
ALTER TABLE "businesses"
ADD COLUMN IF NOT EXISTS "business_category" VARCHAR(100);


