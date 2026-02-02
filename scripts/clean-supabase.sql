-- SQL script to clean all markets from Supabase
-- Execute this in Supabase SQL Editor: https://app.supabase.com/project/_/sql

-- Step 1: View all markets before deletion (optional)
SELECT market_id, title, created_at
FROM markets_metadata
ORDER BY created_at DESC;

-- Step 2: Delete all markets
DELETE FROM markets_metadata;

-- Step 3: Verify deletion (should return 0 rows)
SELECT COUNT(*) as remaining_markets FROM markets_metadata;

-- Optional: Reset auto-increment ID if you have one
-- ALTER SEQUENCE markets_metadata_id_seq RESTART WITH 1;
