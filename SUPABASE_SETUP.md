# Configuración de Supabase para zkPredict

## Paso 1: Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Click en "New Project"
4. Nombre del proyecto: `zkpredict`
5. Database Password: (guarda esta contraseña de forma segura)
6. Region: Elige la más cercana a tus usuarios
7. Click "Create new project"

## Paso 2: Crear la Tabla de Metadata

Una vez creado el proyecto, ve a la sección "SQL Editor" y ejecuta el siguiente SQL:

```sql
-- Crear tabla para metadata de markets
CREATE TABLE markets_metadata (
  market_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  outcome_labels TEXT[] NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Crear índices para búsquedas rápidas
CREATE INDEX idx_markets_created_at ON markets_metadata(created_at DESC);
CREATE INDEX idx_markets_title ON markets_metadata USING gin(to_tsvector('english', title));
CREATE INDEX idx_markets_description ON markets_metadata USING gin(to_tsvector('english', description));

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_markets_metadata_updated_at
    BEFORE UPDATE ON markets_metadata
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar datos de ejemplo
INSERT INTO markets_metadata (market_id, title, description, outcome_labels) VALUES
('1', 'Will Bitcoin reach $100k by end of 2026?', 'This market resolves to YES if Bitcoin (BTC) reaches or exceeds $100,000 USD on any major exchange by December 31, 2026, 23:59:59 UTC.', ARRAY['No', 'Yes']),
('2', 'Winner of Super Bowl LXI', 'Which team will win Super Bowl LXI in 2027?', ARRAY['Kansas City Chiefs', 'San Francisco 49ers', 'Other']),
('3', 'Will it rain in NYC tomorrow?', 'Will there be measurable precipitation (>0.01 inches) in Central Park, NYC on the next calendar day?', ARRAY['No', 'Yes']);

-- Habilitar Row Level Security (RLS)
ALTER TABLE markets_metadata ENABLE ROW LEVEL SECURITY;

-- Política: Permitir lectura pública
CREATE POLICY "Allow public read access"
ON markets_metadata FOR SELECT
USING (true);

-- Política: Permitir inserción pública (ajusta según tus necesidades)
CREATE POLICY "Allow public insert"
ON markets_metadata FOR INSERT
WITH CHECK (true);

-- Política: Permitir actualización pública (ajusta según tus necesidades)
CREATE POLICY "Allow public update"
ON markets_metadata FOR UPDATE
USING (true);
```

## Paso 3: Obtener las Credenciales

1. Ve a "Project Settings" > "API"
2. Copia los siguientes valores:
   - **Project URL**: `https://tu-proyecto.supabase.co`
   - **Anon/Public Key**: `eyJhbGc...` (es una clave larga)

## Paso 4: Configurar Variables de Entorno

Crea o actualiza el archivo `.env.local` en la raíz del proyecto:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui

# Aleo (ya existentes)
URL=https://aleo.tools/
TWITTER=https://twitter.com/AleoHQ
DISCORD=https://discord.gg/aleohq
RPC_URL=https://api.explorer.provable.com/v1
```

## Paso 5: Actualizar el Código

El archivo `src/lib/db.ts` ya está preparado para usar Supabase. Solo necesitas descomentar la implementación de Supabase y comentar la implementación in-memory.

### Verificar Conexión

Después de configurar las variables de entorno, reinicia el servidor de desarrollo:

```bash
npm run dev
```

Ve a [http://localhost:3000/markets](http://localhost:3000/markets) y verifica que los markets se carguen desde Supabase.

## Paso 6: Verificar en Supabase Dashboard

1. Ve a "Table Editor" en Supabase
2. Selecciona la tabla `markets_metadata`
3. Deberías ver los 3 registros de ejemplo

## Notas de Seguridad

### Producción
Para producción, considera:

1. **RLS (Row Level Security)**: Ajusta las políticas según tus necesidades
   - Quizás solo los usuarios autenticados puedan crear markets
   - Solo el creador puede actualizar su market

2. **API Key**: La `ANON_KEY` es segura para uso público
   - Solo permite operaciones permitidas por RLS
   - No expongas la `SERVICE_ROLE_KEY` en el frontend

3. **Rate Limiting**: Supabase incluye rate limiting automático
   - Considera implementar rate limiting adicional si es necesario

### Ejemplo de Políticas más Restrictivas

Si quieres que solo usuarios autenticados creen markets:

```sql
-- Eliminar política pública de inserción
DROP POLICY "Allow public insert" ON markets_metadata;

-- Nueva política: solo usuarios autenticados
CREATE POLICY "Allow authenticated insert"
ON markets_metadata FOR INSERT
TO authenticated
WITH CHECK (true);

-- Solo el creador puede actualizar (requiere columna user_id)
ALTER TABLE markets_metadata ADD COLUMN user_id UUID REFERENCES auth.users(id);

CREATE POLICY "Users can update own markets"
ON markets_metadata FOR UPDATE
USING (auth.uid() = user_id);
```

## Troubleshooting

### Error: "Invalid API key"
- Verifica que las variables de entorno estén correctamente configuradas
- Asegúrate de reiniciar el servidor después de cambiar `.env.local`

### Error: "relation does not exist"
- Verifica que la tabla `markets_metadata` se haya creado correctamente
- Revisa en "Table Editor" de Supabase

### Los datos no se cargan
- Abre las DevTools del navegador y revisa la consola
- Verifica la pestaña "Network" para ver si las requests a Supabase tienen errores
- Revisa los logs en "Logs" > "API" en Supabase Dashboard

## Próximos Pasos

Una vez configurado Supabase:

1. ✅ Actualizar `src/lib/db.ts` para usar Supabase
2. ✅ Probar CRUD completo (Create, Read, Update, Delete)
3. ✅ Migrar datos mock existentes si es necesario
4. ✅ Commit y push de cambios
