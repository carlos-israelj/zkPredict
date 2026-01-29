# 🧪 Testing Guide - zkPredict Integration

## Pre-requisitos

Antes de empezar, asegúrate de tener:
- ✅ Smart contract deployado: `zkpredict.aleo`
- ✅ Supabase configurado y funcionando
- ✅ Leo Wallet o Puzzle Wallet instalado
- ✅ Créditos en tu wallet de testnet

---

## 1. Preparación del Entorno

### 1.1 Iniciar el Servidor de Desarrollo

```bash
cd /mnt/c/Users/CarlosIsraelJiménezJ/Documents/Aleo/zkPredict
npm run dev
```

Espera a que compile y abre: http://localhost:3000

### 1.2 Verificar Supabase

```bash
node test-supabase.js
```

**Resultado esperado**: ✅ All tests passed!

---

## 2. Test: Wallet Connection

### Paso 1: Abrir la App
- Abre http://localhost:3000

### Paso 2: Conectar Wallet
- Click en botón "Connect Wallet" (debería estar en el header)
- Selecciona tu wallet (Leo Wallet o Puzzle Wallet)
- Aprueba la conexión

### Verificación:
- ✅ Deberías ver tu dirección en el header
- ✅ Deberías ver tu balance de créditos
- ✅ Consola del navegador sin errores

**Si falla:**
- Verifica que tengas una wallet instalada
- Asegúrate de estar en testnetbeta
- Revisa la consola del navegador (F12) para errores

---

## 3. Test: Ver Markets Existentes

### Paso 1: Navegar a Markets
- Ve a http://localhost:3000/markets
- O click en "Markets" en el menú

### Verificación:
- ✅ Deberías ver 3 markets de ejemplo:
  1. "Will Bitcoin reach $100k by end of 2026?"
  2. "Winner of Super Bowl LXI"
  3. "Will it rain in NYC tomorrow?"
- ✅ Cada market muestra título, descripción, outcomes
- ✅ Sin errores en consola

**Estos markets están solo en Supabase (off-chain), aún no en blockchain**

---

## 4. Test: Create Market (UI + On-Chain)

### Paso 1: Ir a Create Market
- Click en "Create Market" (debería haber un botón o link)
- O navega a http://localhost:3000/create

### Paso 2: Llenar el Formulario
```
Title: Will Aleo reach $50 by March 2026?
Description: This market resolves to YES if ALEO token reaches $50 USD on any major exchange by March 31, 2026
Category: Crypto
Number of Outcomes: 2
Outcome Labels:
  - No
  - Yes
End Date: 2026-03-31
End Time: 23:59
Auto-resolve: [marcado]
```

### Paso 3: Crear Market
- Click en "Create Market"
- **Tu wallet se abrirá pidiendo aprobación**
- Revisa los detalles de la transacción
- Aprueba la transacción

### Paso 4: Esperar Confirmación
- Espera 30-60 segundos
- Deberías ver un alert: "Market created successfully!"

### Verificación:
- ✅ Transacción aprobada en wallet
- ✅ Alert de éxito
- ✅ El market aparece en la lista de markets
- ✅ Metadata guardada en Supabase

**Problemas comunes:**
- "Fondos insuficientes" → Necesitas más créditos testnet
- "Transaction rejected" → Revisa que el market_id sea único
- "Failed to create market" → Revisa consola para detalles

### Paso 5: Verificar On-Chain (Opcional)
```bash
cd program
leo query markets "[TU_MARKET_ID]field" --network testnet
```

Si el market se creó correctamente, verás los datos on-chain.

---

## 5. Test: Place Bet

### Paso 1: Abrir un Market
- Ve a Markets
- Click en cualquier market que hayas creado

### Paso 2: Seleccionar Outcome
- Selecciona "Yes" o "No" (o cualquier outcome disponible)
- Ingresa una cantidad: `1.0` (1 credit)

### Paso 3: Colocar Apuesta
- Click en "Place Bet"
- **Tu wallet se abrirá pidiendo aprobación**
- Revisa los detalles (market, outcome, amount)
- Aprueba la transacción

### Paso 4: Esperar Confirmación
- Espera 30-60 segundos
- Deberías ver un alert: "Bet placed successfully!"

### Verificación:
- ✅ Transacción aprobada
- ✅ Alert de éxito
- ✅ Balance actualizado en wallet
- ✅ Pools actualizados en el market

**Verificar On-Chain:**
```bash
cd program
leo query yes_pool "[MARKET_ID]field" --network testnet
leo query no_pool "[MARKET_ID]field" --network testnet
```

Deberías ver los pools actualizados.

---

## 6. Test: Resolve Market (CLI)

Por ahora, la resolución se hace desde CLI:

### Paso 1: Obtener Current Time
```bash
date +%s
```

Copia el timestamp (ej: 1740500000)

### Paso 2: Resolver Market
```bash
cd program

# Resolver con outcome YES (1u8)
leo execute resolve_market \
  "[MARKET_ID]field" \
  "1u8" \
  "[TIMESTAMP]u32" \
  --network testnet
```

### Verificación:
```bash
leo query markets "[MARKET_ID]field" --network testnet
```

Deberías ver `resolved: true` y `winning_outcome: 1u8`.

---

## 7. Test: Claim Winnings (Avanzado)

Esto requiere que tengas un Bet record de una apuesta ganadora.

```bash
cd program

leo execute claim_winnings \
  "{owner: [TU_ADDRESS], market_id: [MARKET_ID]field, bet_id: [BET_ID]field, outcome: 1u8, amount: 1000000u64, odds_at_bet: 10000u64}" \
  --network testnet
```

---

## 📋 Checklist de Testing

### Backend (Supabase)
- [ ] `node test-supabase.js` pasa todos los tests
- [ ] Markets aparecen en http://localhost:3000/markets
- [ ] Crear market guarda metadata

### Wallet
- [ ] Wallet se conecta correctamente
- [ ] Dirección y balance se muestran
- [ ] Transacciones se aprueban

### Create Market
- [ ] Formulario se llena correctamente
- [ ] Transacción se envía a blockchain
- [ ] Market aparece on-chain
- [ ] Metadata se guarda en Supabase

### Place Bet
- [ ] Outcomes se muestran correctamente
- [ ] Apuesta se envía a blockchain
- [ ] Pools se actualizan on-chain
- [ ] Bet record se retorna al usuario

### Resolve & Claim
- [ ] Market se puede resolver (CLI)
- [ ] Winnings se pueden reclamar (CLI)

---

## 🐛 Troubleshooting

### Error: "Wallet does not support transactions"
- Actualiza tu wallet a la última versión
- Prueba con otra wallet (Leo Wallet o Puzzle Wallet)

### Error: "Failed to broadcast transaction: http status: 500"
- El endpoint RPC puede estar caído
- Espera unos minutos e intenta de nuevo
- Verifica que estés en testnetbeta

### Error: "Insufficient funds"
- Necesitas más créditos testnet
- Solicita créditos en el Discord de Aleo

### Market no aparece después de crearlo
- Espera 1-2 minutos (confirmación en blockchain)
- Refresca la página
- Verifica en Supabase que se guardó la metadata

### Pools no se actualizan
- Verifica que la transacción se confirmó
- Query el blockchain directamente con `leo query`
- Puede haber delay de propagación

---

## 📊 Métricas Esperadas

**Tiempos aproximados:**
- Conexión de wallet: 5-10 segundos
- Create market (tx): 30-60 segundos
- Place bet (tx): 30-60 segundos
- Resolve market (tx): 30-60 segundos

**Costos aproximados:**
- Create market: ~10-16 credits
- Place bet: ~2-5 credits
- Resolve market: ~2-4 credits
- Claim winnings: ~2-4 credits

---

## ✅ Criterios de Éxito

Para considerar la integración completa, debes poder:

1. ✅ Conectar wallet sin errores
2. ✅ Ver markets desde Supabase
3. ✅ Crear un market on-chain + metadata off-chain
4. ✅ Colocar una apuesta on-chain
5. ✅ Ver pools actualizados
6. ✅ Resolver market (CLI)
7. ✅ Claim winnings (CLI)

**Meta**: Al menos 1 market funcionando end-to-end (crear → bet → resolver → claim)

---

*Última actualización: 29 Enero 2026*
