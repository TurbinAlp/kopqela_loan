-- AlterTable
-- Add credit_sales_terms column for flexible credit sales payment terms (buy now, pay later)
ALTER TABLE "business_settings" ADD COLUMN "credit_sales_terms" JSONB;

-- Set default credit sales terms for existing businesses
UPDATE "business_settings" 
SET "credit_sales_terms" = '[
  {"duration": "24h", "label": "24 Hours", "labelSw": "Masaa 24", "interestRate": 2, "isPopular": true, "enabled": true},
  {"duration": "3d", "label": "3 Days", "labelSw": "Siku 3", "interestRate": 4, "isPopular": false, "enabled": true},
  {"duration": "1m", "label": "1 Month", "labelSw": "Mwezi 1", "interestRate": 8, "isPopular": false, "enabled": true}
]'::jsonb
WHERE "credit_sales_terms" IS NULL;
