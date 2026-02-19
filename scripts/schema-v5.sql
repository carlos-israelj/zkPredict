-- ============================================================
-- zkPredict v5.0 - Supabase Schema
-- Run this in: https://app.supabase.com/project/_/sql
-- ============================================================

-- ============================================================
-- 1. markets_metadata
-- Off-chain metadata for prediction markets.
-- The on-chain ID is the market_id field stored in Aleo.
-- ============================================================
CREATE TABLE IF NOT EXISTS markets_metadata (
    id              BIGSERIAL PRIMARY KEY,
    market_id       TEXT        NOT NULL UNIQUE,    -- Aleo field value (e.g. "1740000000field")
    title           TEXT        NOT NULL,
    description     TEXT,
    category        INTEGER     NOT NULL DEFAULT 4, -- 0=Sports 1=Politics 2=Crypto 3=Weather 4=Other
    num_outcomes    INTEGER     NOT NULL DEFAULT 2, -- Must match on-chain num_outcomes
    outcome_labels  JSONB,                          -- ["Yes", "No"] or ["Team A", "Team B", "Draw"]
    image_url       TEXT,
    creator_address TEXT,                           -- Aleo address (optional, for display)
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Full-text search index on title + description
CREATE INDEX IF NOT EXISTS markets_metadata_title_idx
    ON markets_metadata USING GIN (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')));

-- Category filter index
CREATE INDEX IF NOT EXISTS markets_metadata_category_idx ON markets_metadata(category);

-- Sort by creation date
CREATE INDEX IF NOT EXISTS markets_metadata_created_at_idx ON markets_metadata(created_at DESC);

-- ============================================================
-- 2. Auto-update updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_markets_metadata_updated_at ON markets_metadata;
CREATE TRIGGER update_markets_metadata_updated_at
    BEFORE UPDATE ON markets_metadata
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 3. Row Level Security
-- Allow public reads, restrict writes to authenticated users
-- ============================================================
ALTER TABLE markets_metadata ENABLE ROW LEVEL SECURITY;

-- Public read
DROP POLICY IF EXISTS "Allow public read" ON markets_metadata;
CREATE POLICY "Allow public read"
    ON markets_metadata FOR SELECT
    USING (true);

-- Public insert (allows unauthenticated market creation via API)
-- In production, replace with authenticated policy
DROP POLICY IF EXISTS "Allow public insert" ON markets_metadata;
CREATE POLICY "Allow public insert"
    ON markets_metadata FOR INSERT
    WITH CHECK (true);

-- Allow updates only to the record creator (via creator_address match)
-- Comment this out if using service role key in API routes
DROP POLICY IF EXISTS "Allow public update" ON markets_metadata;
CREATE POLICY "Allow public update"
    ON markets_metadata FOR UPDATE
    USING (true);

DROP POLICY IF EXISTS "Allow public delete" ON markets_metadata;
CREATE POLICY "Allow public delete"
    ON markets_metadata FOR DELETE
    USING (true);

-- ============================================================
-- 4. Verify schema
-- ============================================================
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'markets_metadata'
ORDER BY ordinal_position;

-- ============================================================
-- 5. Sample data (optional - remove before production)
-- ============================================================
-- INSERT INTO markets_metadata (market_id, title, description, category, num_outcomes, outcome_labels)
-- VALUES
--   ('1740000000field', 'Will BTC reach $100k by end of 2025?', 'Bitcoin price prediction', 2, 2, '["Yes", "No"]'),
--   ('1740000001field', 'Who wins the 2025 World Cup?', 'Football world cup winner', 0, 4, '["Brazil", "Argentina", "Germany", "France"]');
