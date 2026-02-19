# zkPredict - Tareas Pendientes y Estado del Proyecto

**Fecha**: 2026-02-19
**Estado**: ✅ zkpredict_v6.aleo deployado en testnet — 7 bugs críticos corregidos

---

## ✅ DEPLOYMENT EXITOSO: zkpredict_v6.aleo

### Estado Actual
El contrato zkPredict **v6.0** está deployado exitosamente en Aleo testnet.

**Transaction ID**: `at1hcty9vhpnpnpcsyrx2lk5w0mrwf882j3p968fya0nvdyhrq26ypqcmfwak`

**Explorer**: https://testnet.explorer.provable.com/transaction/at1hcty9vhpnpnpcsyrx2lk5w0mrwf882j3p968fya0nvdyhrq26ypqcmfwak

### Por qué v6 y no actualizar v5
`zkpredict_v5.aleo` tiene `@noupgrade` — es inmutable. Imposible actualizarlo. Se deployó un nuevo program ID `zkpredict_v6.aleo` con los 7 bugs críticos corregidos.

### Estadísticas del Deployment

| Métrica | zkpredict_v6.aleo | zkpredict_v5.aleo |
|---------|-------------------|-------------------|
| **Variables** | 1,842,851 (87.9%) | 1,800,512 (86%) |
| **Constraints** | 1,431,871 | 1,401,568 |
| **Statements** | 1,176 (optimizado) | 1,160 |
| **Costo Deploy** | 36.479722 credits | 37.957080 credits |
| **Synthesis Time** | ~8 minutos | ~8 minutos |
| **Status** | ✅ Deployado | ✅ Deployado (inmutable, bugs) |

---

## 7 Bugs Críticos Corregidos en v6

| # | Función | Bug | Fix |
|---|---------|-----|-----|
| 1 | `prove_reputation` | Asignación ilegal a variable de scope padre en `async function` | Reemplazado con expresión ternaria |
| 2 | `finalize_create_parlay` | `markets.get()` en rama condicional con key inexistente → revert | `get_or_use` + parámetro `num_legs: u8` |
| 3 | `finalize_claim_parlay` | Mismo patrón, dummy market con `resolved: false` incorrecto | Dummy con `resolved: true, winning_outcome: 255u8` |
| 4 | `claim_winnings` | Credits calculados pero **nunca transferidos** — fondos atrapados | `transfer_public_to_private` implementado |
| 5 | `claim_two_winnings` | Mismo bug de transferencia | Pago combinado en una sola transferencia |
| 6 | `finalize_place_bet` | Apuestas aceptadas después de expirar el mercado | `assert(block.height < market.end_time)` |
| 7 | `finalize_create_market` | `set()` dentro de condicional en loop → comportamiento indefinido | 10 `set()` incondicionales explícitos |

---

## Archivos Actualizados

### Smart Contract
- ✅ `program/src/main.leo` — `program zkpredict_v6.aleo`, 7 fixes aplicados
- ✅ `program/program.json` — program ID y versión 6.0.0

### Frontend (todos apuntan a `zkpredict_v6.aleo`)
- ✅ `src/types/index.ts`
- ✅ `src/lib/aleo.ts`
- ✅ `src/components/markets/CreateMarket.tsx`
- ✅ `src/components/markets/ResolveMarket.tsx`
- ✅ `src/components/markets/ClaimWinnings.tsx`
- ✅ `src/components/markets/PlaceBet.tsx`
- ✅ `src/components/markets/ClaimTwoWinnings.tsx`
- ✅ `src/components/parlay/ParlayBuilder.tsx`

---

## Tareas Pendientes

### A. Testing End-to-End (Prioritario)

- [ ] **Crear mercado de prueba**
  ```bash
  leo execute create_market "1field" "1760000000u32" "2u8" "0u8" "false" --network testnet
  ```
- [ ] **Inicializar reputación**
  ```bash
  leo execute init_reputation --network testnet
  ```
- [ ] **Hacer apuesta simple**
  ```bash
  leo execute place_bet "1field" "1u8" "1000000u64" "123field" --network testnet
  ```
- [ ] **Resolver mercado**
  ```bash
  leo execute resolve_market "1field" "1u8" "1760000001u32" --network testnet
  ```
- [ ] **Claim winnings** (verificar que los credits llegan — fix crítico de v6)
  ```bash
  leo execute claim_winnings "{...bet_record...}" --network testnet
  ```
- [ ] **Verificar double-claim prevention**
- [ ] **Crear parlay 2-leg**
- [ ] **Verificar time-weighted multipliers**
- [ ] **Verificar que apuestas post-expiración son rechazadas** (fix v6)

### B. Frontend Integration Testing

- [ ] **Conectar wallet** y verificar red TestnetBeta
- [ ] **Flujo completo desde UI**: crear market → bet → resolve → claim
- [ ] **Verificar ClaimWinnings.tsx** entrega los credits correctamente (fix v6)
- [ ] **Verificar ParlayBuilder** funciona con `num_legs` correcto
- [ ] **Verificar wallet adapter** compatibilidad con v6.0

### C. Supabase

- ✅ Esquema v5 corrido (reset-and-setup-v5.sql ejecutado el 2026-02-13)
- [ ] Verificar que `createMarketMetadata()` guarda `category`, `numOutcomes`, `creatorAddress`
- [ ] Confirmar queries de API funcionan correctamente

### D. Deploy Frontend a Producción

- [ ] **Vercel deploy** con el nuevo `ZKPREDICT_PROGRAM_ID = 'zkpredict_v6.aleo'`
- [ ] Verificar build pasa en Vercel
- [ ] Smoke test en https://zkpredict.lat/

---

## Deployments Activos

| Program ID | Versión | Status | TX |
|------------|---------|--------|----|
| `zkpredict_v6.aleo` | v6.0 | ✅ Activo (usar este) | `at1hcty9vhpnpnpcsyrx2lk5w0mrwf882j3p968fya0nvdyhrq26ypqcmfwak` |
| `zkpredict_v5.aleo` | v5.0 | ⚠️ Legacy (bugs críticos, inmutable) | `at1j6fcl5u5ra8p4ltr4l60xyuycx55dul5ts2mzamd6s6aae0n3qzqs8m5gu` |
| `zkpredict2.aleo` | v4.0 | ⛔ Obsoleto | `at1uaezw9wsrskwex086wu6aj6ryas6m6eq90xn5qydwj7ymlva2qgstgl3vt` |

---

## Lecciones Técnicas Aprendidas (Leo/Aleo)

1. **`@noupgrade` es permanente** — cualquier bug requiere un nuevo program ID
2. **Variables en `async function`** no pueden reasignarse desde branches condicionales — usar ternarios
3. **`mapping.get()` en condicional** puede revertir si la key no existe — usar `get_or_use` siempre
4. **`transfer_public_to_private` debe ir en la `async transition`**, no en `async function`
5. **`block.height`** solo disponible en `async function`
6. **`--broadcast`** flag es necesario para que `leo deploy` envíe la TX a la red
7. **Síntesis toma ~8 min** para programas de ~1.8M variables — es normal

---

## Recursos

- **Testnet Explorer**: https://testnet.explorer.provable.com
- **Program v6**: https://testnet.explorer.provable.com/program/zkpredict_v6.aleo
- **Faucet**: https://faucet.aleo.org
- **Frontend**: https://zkpredict.lat/

---

**Última actualización**: 2026-02-19
**Status**: ✅ v6.0 deployado y pusheado a GitHub
**Próxima acción**: Testing end-to-end de las features corregidas en testnet
