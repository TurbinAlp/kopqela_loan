-- Test Script: Update subscription status for testing

-- 1. VIEW current subscription status
SELECT 
  bs.id,
  bs.business_id,
  b.name as business_name,
  sp.name as plan_name,
  bs.status,
  bs.trial_ends_at,
  bs.current_period_end,
  EXTRACT(DAY FROM bs.trial_ends_at - NOW()) as days_remaining
FROM business_subscriptions bs
JOIN businesses b ON b.id = bs.business_id
JOIN subscription_plans sp ON sp.id = bs.plan_id;

-- 2. ACTIVATE PROFESSIONAL PLAN (Simulate activation)
-- UPDATE business_subscriptions
-- SET 
--   plan_id = (SELECT id FROM subscription_plans WHERE name = 'PROFESSIONAL'),
--   status = 'ACTIVE',
--   trial_ends_at = NULL,
--   current_period_start = NOW(),
--   current_period_end = NOW() + INTERVAL '30 days'
-- WHERE business_id = 2;

-- 3. ACTIVATE ENTERPRISE PLAN (For testing advanced features)
-- UPDATE business_subscriptions
-- SET 
--   plan_id = (SELECT id FROM subscription_plans WHERE name = 'ENTERPRISE'),
--   status = 'ACTIVE',
--   trial_ends_at = NULL,
--   current_period_start = NOW(),
--   current_period_end = NOW() + INTERVAL '30 days'
-- WHERE business_id = 2;

-- 4. EXPIRE TRIAL (To test expired modal)
-- UPDATE business_subscriptions
-- SET 
--   status = 'EXPIRED',
--   trial_ends_at = NOW() - INTERVAL '1 day',
--   current_period_end = NOW() - INTERVAL '1 day'
-- WHERE business_id = 2;

-- 5. RESET TO TRIAL (Go back to trial)
-- UPDATE business_subscriptions
-- SET 
--   plan_id = (SELECT id FROM subscription_plans WHERE name = 'BASIC'),
--   status = 'TRIAL',
--   trial_ends_at = NOW() + INTERVAL '30 days',
--   current_period_start = NOW(),
--   current_period_end = NOW() + INTERVAL '30 days'
-- WHERE business_id = 2;

