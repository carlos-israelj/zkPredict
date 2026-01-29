# zkPredict - MVP Progress Tracker

## 🎯 Estado Actual: **40% → 60%** (Backend Configurado! 🚀)

### ✅ Completado

#### 1. Deploy del Smart Contract (DONE - 29 Enero 2026, 00:30 AM)
- ✅ Agregado constructor `@noupgrade` al programa
- ✅ Compilación exitosa con Leo 3.4.0
- ✅ Deploy a Aleo Testnet completado
- ✅ Program ID: `zkpredict.aleo`
- ✅ Costo total: 15.755450 credits
- ✅ Documentación de deployment creada

**Problemas Resueltos:**
- ❌ Endpoint incorrecto → ✅ Cambiado a `https://api.explorer.provable.com/v1`
- ❌ Falta de constructor → ✅ Agregado `@noupgrade async constructor()`
- ❌ Constructor con lógica → ✅ Vaciado (Leo genera el código automáticamente)

#### 2. Backend Básico para Metadata (DONE - 29 Enero 2026, 02:30 AM)
- ✅ Proyecto Supabase creado (gnelwpxhgavntqfplwau)
- ✅ Tabla `markets_metadata` creada con schema completo
- ✅ 3 markets de ejemplo insertados
- ✅ Row Level Security (RLS) habilitado
- ✅ Variables de entorno configuradas (`.env.local`)
- ✅ Código actualizado para usar `db-supabase.ts`
- ✅ Tests de conexión exitosos (CRUD completo funciona)

**Verificaciones Completadas:**
- ✅ Fetch all markets (3 encontrados)
- ✅ Fetch single market by ID
- ✅ Insert new market
- ✅ Delete market
- ✅ Full-text search configurado

**Archivos Actualizados:**
- ✅ `src/hooks/useMarketMetadata.ts` → usa `db-supabase`
- ✅ `src/pages/api/markets/index.ts` → usa `db-supabase`
- ✅ `src/pages/api/markets/[id].ts` → usa `db-supabase`

---

## 🔜 Próximos Pasos para MVP (80%)

### 3. Integración On-Chain Real (2-3 días estimados)

**Estado**: Siguiente paso
**Prioridad**: ALTA

- [ ] Diseñar schema de base de datos
  ```sql
  -- markets table
  CREATE TABLE markets (
    market_id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    outcome_labels TEXT[] NOT NULL,
    image_url TEXT,
    category INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  -- Opcional: bets cache table para UI
  CREATE TABLE bets_cache (
    bet_id TEXT PRIMARY KEY,
    market_id TEXT REFERENCES markets(market_id),
    user_address TEXT NOT NULL,
    outcome INTEGER NOT NULL,
    amount BIGINT NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW()
  );
  ```

- [ ] Implementar API endpoints
  - [ ] `GET /api/markets` - Listar todos los mercados
  - [ ] `GET /api/markets/[id]` - Obtener mercado específico
  - [ ] `POST /api/markets` - Crear metadata de mercado
  - [ ] `PUT /api/markets/[id]` - Actualizar metadata

- [ ] Migrar de `db.ts` (in-memory) a `db-supabase.ts`
  - [ ] Actualizar todos los imports en componentes
  - [ ] Probar CRUD operations

**Archivos a modificar:**
- `src/lib/db-supabase.ts` (ya existe, completar implementación)
- `src/pages/api/markets/index.ts`
- `src/pages/api/markets/[id].ts`
- `.env.local` (crear con Supabase keys)

---

### 3. Integración On-Chain Real (2-3 días estimados)

**Estado**: Pendiente
**Prioridad**: Alta

**Tareas:**
- [ ] Actualizar hooks para usar program ID real
  - [ ] `useOnChainMarket.ts` - Usar `zkpredict.aleo`
  - [ ] `useMarketMetadata.ts` - Combinar on-chain + Supabase

- [ ] Implementar transacciones reales
  - [ ] Integrar wallet adapter para `create_market`
  - [ ] Implementar `place_bet` con wallet
  - [ ] Implementar `claim_winnings`

- [ ] Testing de flujo completo
  - [ ] Crear market via UI
  - [ ] Guardar metadata en Supabase
  - [ ] Ejecutar `create_market` on-chain
  - [ ] Verificar que aparece en UI
  - [ ] Hacer bet y verificar pools
  - [ ] Resolver market
  - [ ] Claim winnings

- [ ] Manejo de errores
  - [ ] Wallet no conectada
  - [ ] Fondos insuficientes
  - [ ] Transacción rechazada
  - [ ] Market no existe

**Componentes a actualizar:**
- `src/components/markets/CreateMarket.tsx`
- `src/components/markets/PlaceBet.tsx`
- `src/components/markets/MarketCard.tsx`
- `src/components/markets/MarketList.tsx`

---

## 📊 Métricas de Progreso

| Fase | Estimación Original | Estado | Tiempo Real |
|------|---------------------|--------|-------------|
| 1. Deploy Smart Contract | 1-2 días | ✅ DONE | ~4 horas |
| 2. Backend Metadata | 2-3 días | 🔄 Pendiente | - |
| 3. Integración On-Chain | 2-3 días | 🔄 Pendiente | - |
| **Total MVP (80%)** | **5-8 días** | **20% → 40%** | **~4 horas** |

---

## 🚀 Para Producción (100%)

### 4. Testing End-to-End (3-5 días)
- [ ] Unit tests para smart contract
- [ ] Integration tests para API
- [ ] E2E tests para flujos completos
- [ ] Load testing

### 5. Auditoría del Smart Contract (1-2 semanas)
- [ ] Code review interno
- [ ] Security audit externo
- [ ] Vulnerability scanning
- [ ] Fix de issues encontrados

### 6. Optimizaciones de UX (1 semana)
- [ ] Loading states
- [ ] Error handling mejorado
- [ ] Responsive design
- [ ] Performance optimization

### 7. Documentación de Usuario Final (2-3 días)
- [ ] User guide
- [ ] FAQs
- [ ] Video tutorials
- [ ] API documentation

---

## 🔧 Configuración Actual

### Smart Contract
```
Program ID: zkpredict.aleo
Network: Aleo Testnet
Endpoint: https://api.explorer.provable.com/v1
Status: ✅ Deployed and Live
```

### Frontend
```
Framework: Next.js 15.2.4
Network: TestnetBeta (configurado en src/types/index.ts)
RPC: https://testnetbeta.aleorpc.com
Wallet: @demox-labs/aleo-wallet-adapter
```

### Backend
```
Database: Supabase (por configurar)
Current: In-memory (src/lib/db.ts)
Target: PostgreSQL via Supabase
```

---

## 📝 Notas Importantes

1. **Non-upgradable**: El programa usa `@noupgrade` - NO se puede actualizar. Cualquier cambio requiere un nuevo deployment con otro nombre.

2. **Costo de transacciones**:
   - Create market: ~6-10 credits
   - Place bet: ~2-4 credits
   - Resolve market: ~2-4 credits
   - Claim winnings: ~2-4 credits

3. **Próximos blockers conocidos**:
   - Necesitas créditos testnet para los usuarios
   - Supabase configuration pending
   - Wallet testing con usuarios reales

4. **Quick wins para avanzar rápido**:
   - Configurar Supabase HOY (30 min)
   - Migrar un endpoint de API (1 hora)
   - Probar create_market desde Leo CLI (30 min)
   - Conectar wallet y mostrar address (1 hora)

---

## 🎯 Meta para esta semana

**Objetivo**: Llegar a **MVP 80%** - Tener un market funcional end-to-end

**Milestone**:
- ✅ Deploy exitoso
- [ ] Supabase configurado y funcionando
- [ ] Al menos 1 market creado via UI que se vea on-chain
- [ ] Al menos 1 bet realizado que actualice pools
- [ ] Demo video de 2 minutos mostrando el flujo

---

**Última actualización**: 29 Enero 2026 - 00:30 AM
**Próxima revisión**: 29 Enero 2026 - PM (después de configurar Supabase)
