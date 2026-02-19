-- ============================================================
-- zkPredict v5.0 — FULL RESET + SETUP
-- Pegar en: https://app.supabase.com/project/_/sql
--
-- ADVERTENCIA: Esto borra TODOS los datos existentes.
-- ============================================================

-- ============================================================
-- PASO 1: Limpiar todo lo viejo
-- ============================================================
DROP TABLE IF EXISTS markets_metadata CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- ============================================================
-- PASO 2: Crear tabla limpia con schema v5
-- ============================================================
CREATE TABLE markets_metadata (
    id              BIGSERIAL        PRIMARY KEY,
    market_id       TEXT             NOT NULL UNIQUE,
    title           TEXT             NOT NULL,
    description     TEXT,
    category        INTEGER          NOT NULL DEFAULT 4,
    -- 0=Sports 1=Politics 2=Crypto 3=Weather 4=Other
    num_outcomes    INTEGER          NOT NULL DEFAULT 2,
    outcome_labels  JSONB            NOT NULL DEFAULT '["Yes","No"]'::jsonb,
    image_url       TEXT,
    creator_address TEXT,
    created_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PASO 3: Índices
-- ============================================================
CREATE INDEX markets_metadata_category_idx   ON markets_metadata(category);
CREATE INDEX markets_metadata_created_at_idx ON markets_metadata(created_at DESC);
CREATE INDEX markets_metadata_fts_idx
    ON markets_metadata
    USING GIN (to_tsvector('english',
        coalesce(title, '') || ' ' || coalesce(description, '')
    ));

-- ============================================================
-- PASO 4: Trigger auto-updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_markets_metadata_updated_at
    BEFORE UPDATE ON markets_metadata
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- PASO 5: Row Level Security
-- ============================================================
ALTER TABLE markets_metadata ENABLE ROW LEVEL SECURITY;

-- Lectura pública
CREATE POLICY "public_read"
    ON markets_metadata FOR SELECT
    USING (true);

-- Inserción pública (cualquiera puede crear mercados via API)
CREATE POLICY "public_insert"
    ON markets_metadata FOR INSERT
    WITH CHECK (true);

-- Actualización pública
CREATE POLICY "public_update"
    ON markets_metadata FOR UPDATE
    USING (true);

-- Eliminación pública
CREATE POLICY "public_delete"
    ON markets_metadata FOR DELETE
    USING (true);

-- ============================================================
-- PASO 6: Verificación
-- ============================================================
SELECT
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'markets_metadata'
ORDER BY ordinal_position;

-- Debe retornar: id, market_id, title, description, category,
--               num_outcomes, outcome_labels, image_url,
--               creator_address, created_at, updated_at
