# zkPredict - Tareas Pendientes y Estado del Proyecto

**Fecha**: 2026-02-11
**Estado**: En desarrollo - Deployment bloqueado por tamaño del contrato

---

## 🚨 PROBLEMA CRÍTICO: Deployment del Contrato v5.0

### ❌ Estado Actual
El contrato zkPredict v5.0 **NO puede desplegarse** en Aleo testnet debido a su tamaño.

### 📊 Análisis del Problema

| Métrica | v5.0 (actual) | v4 (exitoso) | Diferencia |
|---------|---------------|--------------|------------|
| Variables | 1,812,725 | 130,407 | **13.9x más grande** |
| Constraints | 1,409,242 | 101,213 | **13.9x más grande** |
| Costo Deploy | 38.8 credits | 6.91 credits | **5.6x más caro** |
| Storage | 34.6 | 5.7 | **6.1x más** |
| Porcentaje del límite | 86% | 6% | Casi en el límite |

### ⚠️ Errores Encontrados

1. **HTTP 500** al intentar broadcast
   - El servidor de testnet no puede procesar programas tan grandes
   - Timeout en la generación del proof

2. **Constructor no reconocido**
   - Warning: "The program does not contain a constructor"
   - Leo no reconoce `initialize()` como constructor válido
   - Intentos fallidos con `constructor()` (palabra reservada)

3. **Features que causan el tamaño excesivo**:
   - Parlays (2-5 legs) con múltiples variantes
   - Reputation Proofs (ZK proofs complejos)
   - Time-weighted betting con múltiples multiplicadores
   - Sistema complejo de tiers y bonos

---

## 💡 OPCIONES DISPONIBLES

### Opción 1: Crear zkPredict v5.1 "Lite" (Recomendado)

**Descripción**: Versión simplificada con solo features core

**Features Incluidas** ✅:
- Mercados multi-outcome (2-255 outcomes)
- Sistema de apuestas parimutuel
- Resolución de mercados
- Claim de winnings con prevención de doble-claim
- Sistema básico de reputación (tracking simple)
- Categorías de mercados

**Features Removidas** ❌:
- Parlays complejos (2-5 legs)
- Reputation Proofs (ZK proofs)
- Time-weighted multipliers complejos
- Tier bonuses en parlays

**Estimado**:
- Variables: ~400,000 (vs 1.8M)
- Costo: ~12-15 credits (vs 38.8)
- **Deployable exitosamente** ✅

**Ventajas**:
- Deployment garantizado
- Menor costo de transacciones
- Más fácil de mantener
- Features core 100% funcionales

**Desventajas**:
- Sin parlays (feature premium)
- Sin ZK reputation proofs
- Sistema de reputación simplificado

---

### Opción 2: Dividir en Múltiples Programas

**Descripción**: Arquitectura modular con 3 programas separados

**Programa 1: zkpredict_core.aleo**
- Mercados multi-outcome
- Betting parimutuel
- Resolución y claims
- Estimado: ~300,000 variables

**Programa 2: zkpredict_reputation.aleo**
- Sistema de reputación
- Tier tracking
- Reputation proofs
- Estimado: ~200,000 variables

**Programa 3: zkpredict_parlays.aleo**
- Sistema de parlays
- Multi-leg betting
- Combined odds
- Estimado: ~300,000 variables

**Ventajas**:
- Todas las features v5.0 disponibles
- Deployment exitoso garantizado
- Mejor organización del código
- Escalabilidad futura

**Desventajas**:
- Más complejo de mantener
- 3 deployments separados (3x costo)
- Cross-program calls más complejos
- Frontend más complejo

---

### Opción 3: Usar zkpredict2.aleo (v4)

**Descripción**: Continuar con el programa v4 ya deployado

**Features Disponibles**:
- Mercados multi-outcome ✅
- Betting parimutuel ✅
- Resolución y claims ✅
- Categorías ✅
- **Ya está deployado y funcional** ✅

**Features No Disponibles**:
- Sin sistema de reputación ❌
- Sin parlays ❌
- Sin time-weighted betting ❌
- Sin tier system ❌

**Ventajas**:
- Ya está funcionando
- Costo $0 (ya deployado)
- Frontend ya integrado
- Estable y probado

**Desventajas**:
- No tiene features v5.0
- Menos atractivo para usuarios
- Sin diferenciación competitiva

---

## 📋 TAREAS PENDIENTES POR ÁREA

### A. Smart Contract (Crítico)

#### Pendiente Inmediato:
- [ ] **Decidir estrategia**: v5.1 lite, modular, o usar v4
- [ ] **Si v5.1 lite**: Simplificar contrato v5.0
  - [ ] Remover funciones de parlays
  - [ ] Remover reputation proofs complejos
  - [ ] Simplificar time-weighted betting
  - [ ] Rebuild y verificar tamaño
- [ ] **Si modular**: Dividir en 3 programas
  - [ ] Crear zkpredict_core.aleo
  - [ ] Crear zkpredict_reputation.aleo
  - [ ] Crear zkpredict_parlays.aleo
- [ ] **Deploy exitoso** del contrato elegido
- [ ] **Testing end-to-end** en testnet

#### Estado Actual:
- ✅ Contrato v5.0 compila sin errores (1162 statements)
- ✅ Tipos del frontend actualizados (`RepProof`)
- ✅ Documentación completa creada
- ❌ Deployment fallido (HTTP 500)
- ⏳ Wallet fondeada (69.7 credits disponibles)

---

### B. Frontend (En Espera del Contrato)

#### Componentes Existentes:
- ✅ `ReputationProfile.tsx` - Listo
- ✅ `TierBadge.tsx` - Listo
- ✅ `ParlayBuilder.tsx` - Listo
- ✅ `CreateMarket.tsx` - Listo
- ✅ `PlaceBet.tsx` - Listo
- ✅ `ClaimWinnings.tsx` - Listo
- ✅ `MarketCard.tsx` - Listo

#### Tareas Pendientes:
- [ ] **Actualizar PROGRAM_ID** en `src/types/index.ts` después del deploy
- [ ] **Testing de integración** con contrato deployado
- [ ] **Adaptar componentes** según versión deployada (v5.0, v5.1, o v4)
- [ ] **Si v5.1 lite**: Ocultar UI de parlays y reputation proofs
- [ ] **Si modular**: Integrar calls a múltiples programas

#### Features Nuevas Requeridas (Si v5.0/v5.1):
- [ ] Dashboard de reputación del usuario
- [ ] Indicadores de tier y bonos
- [ ] Parlay builder UI (si está disponible)
- [ ] Time multiplier indicators
- [ ] Reputation proof generator UI (si está disponible)

---

### C. Supabase / Base de Datos

#### Pendiente:
- [ ] **Esquema actualizado** para v5 features
  - [ ] Tabla de reputation (si se usa)
  - [ ] Tabla de parlays (si se usa)
  - [ ] Metadata adicional para markets
- [ ] **Migración de datos** si es necesario
- [ ] **Índices optimizados** para queries de reputación

---

### D. Testing y QA

#### Pendiente:
- [ ] **Test Suite Refactor** (Leo tests fallando)
  - Opciones:
    1. Mover tests a transitions públicos en main.leo
    2. Crear wrappers para testing
    3. Solo manual testing por ahora
- [ ] **Manual Testing Checklist**:
  - [ ] Crear mercado
  - [ ] Hacer apuesta
  - [ ] Resolver mercado
  - [ ] Claim winnings
  - [ ] Inicializar reputación (si disponible)
  - [ ] Crear parlay (si disponible)
  - [ ] Verificar double-claim prevention
- [ ] **Integration Testing** frontend + smart contract
- [ ] **Load Testing** (múltiples usuarios concurrentes)

---

### E. Documentación

#### Completado:
- ✅ `V5_COMPILATION_SUMMARY.md`
- ✅ `TEST_STATUS.md`
- ✅ `DEPLOYMENT_GUIDE.md`
- ✅ `V5_COMPLETION_SUMMARY.md`
- ✅ `DEPLOYMENT.md` (v4)

#### Pendiente:
- [ ] **Actualizar README.md** con status actual
- [ ] **API Documentation** para frontend developers
- [ ] **User Guide** para usuarios finales
- [ ] **Troubleshooting Guide** completo
- [ ] **Architecture Decision Records** (ADRs)
  - Por qué v5.1 lite vs modular vs v4

---

## 🎯 PRÓXIMOS PASOS RECOMENDADOS

### Paso 1: Decisión Estratégica (Urgente)
**Acción**: Elegir entre:
- A) v5.1 lite (rápido, 1-2 días)
- B) Modular (completo, 3-5 días)
- C) Continuar con v4 (inmediato)

**Recomendación**: **Opción A - v5.1 lite**

**Razones**:
1. Balance entre features y viabilidad
2. Deployment garantizado
3. Implementación rápida
4. Mantiene diferenciación vs competencia
5. Path to upgrade a modular después

---

### Paso 2: Implementación (1-2 días)

#### Si v5.1 lite:
**Día 1**:
- [ ] Simplificar main.leo (remover parlays y ZK proofs)
- [ ] Rebuild y verificar tamaño (<500k variables)
- [ ] Deploy a testnet
- [ ] Verificar deployment exitoso

**Día 2**:
- [ ] Testing manual completo
- [ ] Actualizar frontend PROGRAM_ID
- [ ] Testing de integración
- [ ] Deploy frontend a producción

#### Si modular:
**Día 1-2**: Dividir código en 3 programas
**Día 3-4**: Deploy y testing de cada programa
**Día 5**: Integración frontend

#### Si continuar con v4:
**Hoy**: Ya está deployado, solo testing

---

### Paso 3: Testing y Launch (1 día)
- [ ] Manual testing completo
- [ ] Beta testing con usuarios
- [ ] Documentación finalizada
- [ ] Launch público

---

## 📊 MÉTRICAS DE ÉXITO

### Smart Contract:
- ✅ Deployment exitoso en testnet
- ✅ Costo de deployment < 20 credits
- ✅ Todas las transactions completan en < 30 segundos
- ✅ 0 errores críticos en testing

### Frontend:
- ✅ Integración completa con contrato
- ✅ Todas las features UI funcionando
- ✅ Tiempo de carga < 3 segundos
- ✅ Mobile responsive

### Usuario:
- ✅ Puede crear mercados exitosamente
- ✅ Puede hacer apuestas sin errores
- ✅ Puede claim winnings correctamente
- ✅ UI intuitiva y fácil de usar

---

## 💰 COSTOS ESTIMADOS

### Deployment (One-time):
- v5.1 lite: ~12-15 credits testnet (~$0 testnet, ~$200-250 mainnet)
- Modular (3 programas): ~25-35 credits testnet (~$0 testnet, ~$400-600 mainnet)
- v4: $0 (ya deployado)

### Operacional (Por usuario):
- Create market: ~1-2 credits
- Place bet: ~0.5-1 credit
- Resolve market: ~1-2 credits
- Claim winnings: ~0.5-1 credit

---

## 🔍 ANÁLISIS DE RIESGOS

### Riesgo Alto:
1. **Deployment sigue fallando** con v5.1 lite
   - Mitigación: Opción modular como backup
   - Probabilidad: 20%

2. **Features simplificadas no atraen usuarios**
   - Mitigación: Roadmap claro para features v5.0 completo
   - Probabilidad: 30%

### Riesgo Medio:
1. **Bugs en producción**
   - Mitigación: Testing extensivo en testnet
   - Probabilidad: 40%

2. **Performance issues con múltiples usuarios**
   - Mitigación: Load testing preventivo
   - Probabilidad: 25%

### Riesgo Bajo:
1. **Frontend integration issues**
   - Mitigación: Componentes ya desarrollados
   - Probabilidad: 10%

---

## 📝 NOTAS TÉCNICAS

### Limitaciones de Aleo/Leo Encontradas:

1. **Program Size Limits**
   - Max variables: 2,097,152
   - Max constraints: 2,097,152
   - v5.0 alcanza 86% del límite (no deployable)

2. **Constructor Issues**
   - Leo no permite `constructor` como nombre (palabra reservada)
   - Functions normales como `initialize` no son reconocidas como constructors
   - Warning "no constructor" puede causar deployment failures

3. **Loop Bounds**
   - Deben ser compile-time constants
   - No se pueden usar variables como límites
   - Solución: Use MAX_OUTCOMES constant con conditional

4. **Block Height Access**
   - Solo disponible en `async function` (finalize)
   - No disponible en transitions
   - Solución: Pasar como parámetro público

5. **Record Naming**
   - No pueden ser prefijos de otros records
   - `ReputationProof` prefixed by `Reputation` → Error
   - Solución: Renombrar a `RepProof`

---

## 🚀 ROADMAP FUTURO

### v5.2 (Post-Launch):
- [ ] Oracles integration para auto-resolution
- [ ] Reputation staking
- [ ] Social features (follow bettors)
- [ ] Leaderboards

### v6.0 (Long-term):
- [ ] Cross-chain bridge
- [ ] DAO governance
- [ ] Advanced analytics
- [ ] Mobile app

---

## 📞 CONTACTO Y RECURSOS

### Recursos Útiles:
- **Aleo Discord**: https://discord.gg/aleo
- **Leo Docs**: https://developer.aleo.org/leo
- **Testnet Explorer**: https://testnet.explorer.provable.com
- **Faucet**: https://faucet.aleo.org

### Estado de Archivos Clave:
- ✅ `/program/src/main.leo` - v5.0 completo, no deployable
- ✅ `/program/main_v4_backup.leo` - Backup de v4
- ✅ `/program/program.json` - Configurado para v5.0
- ✅ `/src/types/index.ts` - Tipos actualizados para v5.0
- ⏳ Balance wallet: 69.7 credits testnet

---

**Última actualización**: 2026-02-11 06:15 UTC
**Status**: ⏸️ Deployment bloqueado - Esperando decisión estratégica
**Próxima acción**: Elegir entre v5.1 lite, modular, o v4
