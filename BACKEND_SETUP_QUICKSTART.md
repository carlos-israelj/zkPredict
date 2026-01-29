# 🚀 Backend Setup - Quick Start Guide

**Tiempo estimado: 15-20 minutos**

## Paso 1: Crear Proyecto en Supabase (5 min)

1. **Ve a**: https://supabase.com
2. **Inicia sesión** o crea una cuenta (usa GitHub para más rápido)
3. Click en **"New Project"**
4. Completa el formulario:
   ```
   Name: zkpredict
   Database Password: [Genera una contraseña segura y guárdala]
   Region: [Elige la más cercana, ej: South America (São Paulo)]
   Pricing Plan: Free tier (perfecta para desarrollo)
   ```
5. Click **"Create new project"**
6. ⏳ Espera 2-3 minutos mientras se crea el proyecto

---

## Paso 2: Crear la Tabla de Datos (5 min)

1. **En tu proyecto de Supabase**, ve a la sección **"SQL Editor"** (menú lateral izquierdo)
2. Click en **"New query"**
3. **Copia y pega** TODO el SQL de abajo:

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

-- Política: Permitir inserción pública
CREATE POLICY "Allow public insert"
ON markets_metadata FOR INSERT
WITH CHECK (true);

-- Política: Permitir actualización pública
CREATE POLICY "Allow public update"
ON markets_metadata FOR UPDATE
USING (true);
```

4. Click **"Run"** (o presiona Ctrl/Cmd + Enter)
5. ✅ Deberías ver: **"Success. No rows returned"**

---

## Paso 3: Obtener las Credenciales (2 min)

1. En tu proyecto de Supabase, ve a **"Project Settings"** (icono de engranaje abajo a la izquierda)
2. Click en **"API"** en el menú lateral
3. Busca y copia estos dos valores:

   📋 **Project URL**:
   ```
   https://[tu-proyecto-id].supabase.co
   ```

   📋 **anon public** (en la sección "Project API keys"):
   ```
   eyJhbGc... [una clave muy larga]
   ```

---

## Paso 4: Configurar Variables de Entorno (3 min)

1. En tu proyecto local, en la **raíz de zkPredict**, crea un archivo `.env.local`:

```bash
# Dentro de /zkPredict/ (NO en /zkPredict/program/)
touch .env.local
```

2. Abre `.env.local` y pega:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[TU-PROYECTO-ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[TU-ANON-KEY-AQUI]

# Aleo Network Configuration
URL=https://aleo.tools/
TWITTER=https://twitter.com/AleoHQ
DISCORD=https://discord.gg/aleohq
RPC_URL=https://api.explorer.provable.com/v1
```

3. **Reemplaza** `[TU-PROYECTO-ID]` y `[TU-ANON-KEY-AQUI]` con tus valores reales

---

## Paso 5: Verificar que Funciona (5 min)

### 5.1 Verificar en Supabase Dashboard

1. Ve a **"Table Editor"** en Supabase
2. Selecciona la tabla **`markets_metadata`**
3. ✅ Deberías ver **3 registros** (Bitcoin, Super Bowl, NYC Rain)

### 5.2 Verificar en tu App

1. **Detén** el servidor de desarrollo si está corriendo (Ctrl+C)
2. **Reinicia** el servidor:
   ```bash
   cd zkPredict
   yarn dev
   ```
3. Abre http://localhost:3000/markets
4. ✅ Deberías ver los 3 markets cargados desde Supabase

### 5.3 Verificar en Consola del Navegador

1. Abre **DevTools** (F12)
2. Ve a la pestaña **Console**
3. ✅ NO deberías ver errores relacionados con Supabase
4. Ve a la pestaña **Network**
5. Filtra por "supabase"
6. ✅ Deberías ver requests exitosos (status 200)

---

## 🎉 ¡Listo! Backend Configurado

Tu backend ahora está:
- ✅ Usando Supabase (PostgreSQL real)
- ✅ Con 3 markets de ejemplo
- ✅ Listo para CRUD operations
- ✅ Con búsqueda full-text
- ✅ Con actualización automática de timestamps

---

## 🔥 Próximos Pasos

Ahora que tienes el backend funcionando:

1. **Crear un market nuevo** desde la UI
2. **Conectar con el smart contract** desplegado
3. **Sincronizar on-chain + off-chain** data

---

## 🐛 Troubleshooting

### Error: "Invalid API key"
- ✅ Verifica que copiaste bien las credenciales (sin espacios extra)
- ✅ Reinicia el servidor de desarrollo

### Error: "Failed to fetch markets"
- ✅ Verifica que la tabla se creó correctamente (paso 2)
- ✅ Revisa la consola del navegador para ver el error exacto
- ✅ Verifica los logs en Supabase Dashboard > Logs

### Los markets no aparecen
- ✅ Abre DevTools > Network y busca errores
- ✅ Verifica que `.env.local` esté en la raíz de zkPredict
- ✅ Verifica que las políticas RLS estén habilitadas

### "Relation does not exist"
- ✅ La tabla no se creó. Vuelve al Paso 2 y ejecuta el SQL nuevamente

---

## 📚 Recursos

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Tu archivo original**: `SUPABASE_SETUP.md`
- **Deployment info**: `DEPLOYMENT.md`
- **Progress tracker**: `MVP_PROGRESS.md`
