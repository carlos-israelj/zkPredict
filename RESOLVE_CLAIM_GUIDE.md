# 🎯 Guía de Resolve Market y Claim Winnings

## 📌 Resumen

Esta guía explica cómo usar las nuevas funcionalidades de UI para resolver markets y reclamar ganancias, implementadas el 29 de Enero de 2026.

**Nuevos Componentes:**
- `ResolveMarket.tsx` - UI para resolver markets
- `ClaimWinnings.tsx` - UI para reclamar ganancias

---

## 🏁 Resolve Market Component

### Ubicación
`src/components/markets/ResolveMarket.tsx`

### Características

#### 1. Verificación de Permisos
El componente verifica automáticamente si el usuario puede resolver el market:

**Opciones:**
- ✅ **Creator**: El creador del market puede resolver en cualquier momento
- ✅ **Auto-resolve**: Si `auto_resolve` está habilitado, cualquier usuario puede resolver después del `end_time`

```typescript
const isCreator = publicKey === market.creator;
const hasEnded = now >= market.endTime;
const canResolve = isCreator || (market.autoResolve && hasEnded);
```

#### 2. UI Intuitiva
- Radio buttons para seleccionar el winning outcome
- Muestra todos los outcome labels del market
- Feedback visual con alerts (success, warning, info)
- Loading states durante la transacción

#### 3. Validaciones
- ✅ Market no debe estar ya resuelto
- ✅ Winning outcome debe estar dentro del rango válido (0 a numOutcomes-1)
- ✅ Time validation: auto-resolve solo después de end_time
- ✅ Creator validation: verificación on-chain

#### 4. Parámetros de Transacción
```typescript
const inputs = [
  market.marketId,              // market_id: field
  `${selectedWinningOutcome}u8`, // winning_outcome: u8
  `${currentTime}u32`,          // current_time: u32
];

const transaction = Transaction.createTransaction(
  publicKey,
  'testnetbeta',
  'zkpredict.aleo',
  'resolve_market',
  inputs,
  5000000, // 5 credits fee
  false
);
```

### Uso en Código

```typescript
import ResolveMarket from '@/components/markets/ResolveMarket';

<ResolveMarket
  market={market}
  onResolved={() => {
    // Callback para refrescar datos
    console.log('Market resolved!');
  }}
/>
```

### Props

| Prop | Tipo | Descripción |
|------|------|-------------|
| `market` | `Market` | Objeto del market a resolver |
| `onResolved` | `() => void` (opcional) | Callback ejecutado después de resolver exitosamente |

---

## 💰 Claim Winnings Component

### Ubicación
`src/components/markets/ClaimWinnings.tsx`

### Características

#### 1. Input de Bet Record
El usuario debe pegar su Bet record completo desde su wallet:

```
{
  owner: aleo1...,
  market_id: 1738097234field,
  bet_id: 789field,
  outcome: 1u8,
  amount: 1000000u64,
  odds_at_bet: 10000u64
}
```

#### 2. Instrucciones Expandibles
- Click en "▶ How to find your Bet record"
- Instrucciones paso a paso para encontrar el record en el wallet
- Ejemplo de formato del record

#### 3. Validación Automática
El componente detecta automáticamente:

```typescript
// Detecta si es winning bet
if (betRecordString.includes(`outcome: ${market.winningOutcome}u8`)) {
  // ✅ Alert verde: "This bet is for the winning outcome!"
}

// Detecta si es losing bet
if (!betRecordString.includes(`outcome: ${market.winningOutcome}u8`) &&
    betRecordString.includes('outcome:')) {
  // ❌ Alert rojo: "This bet is for a losing outcome"
}
```

#### 4. Error Handling Mejorado
El componente proporciona mensajes específicos:

```typescript
if (errorMessage.includes('already claimed')) {
  alert('This bet has already been claimed. You cannot claim the same bet twice.');
} else if (errorMessage.includes('losing outcome')) {
  alert('This bet is for a losing outcome. Only winning bets can be claimed.');
} else if (errorMessage.includes('not resolved')) {
  alert('This market has not been resolved yet. Please wait for resolution.');
}
```

#### 5. Parámetros de Transacción
```typescript
const inputs = [
  betRecord, // bet: Bet record completo
];

const transaction = Transaction.createTransaction(
  publicKey,
  'testnetbeta',
  'zkpredict.aleo',
  'claim_winnings',
  inputs,
  5000000, // 5 credits fee
  false
);
```

### Uso en Código

```typescript
import ClaimWinnings from '@/components/markets/ClaimWinnings';

<ClaimWinnings
  market={market}
  onClaimed={() => {
    // Callback para refrescar datos
    console.log('Winnings claimed!');
  }}
/>
```

### Props

| Prop | Tipo | Descripción |
|------|------|-------------|
| `market` | `Market` | Objeto del market resuelto |
| `onClaimed` | `() => void` (opcional) | Callback ejecutado después de reclamar exitosamente |

---

## 🔄 Integración en la Página de Detalle

### Archivo: `src/pages/markets/[id].tsx`

La página de detalle del market ahora muestra dinámicamente:

```typescript
{/* Resolution Section (Wave 2) */}
{!market.resolved && (
  <ResolveMarket market={market} onResolved={handleRefresh} />
)}

{/* Claim Winnings Section (Wave 2) */}
{market.resolved && (
  <ClaimWinnings market={market} onClaimed={handleRefresh} />
)}
```

**Lógica:**
- Si el market **NO está resuelto** → Muestra `ResolveMarket`
- Si el market **ESTÁ resuelto** → Muestra `ClaimWinnings`

### Refresh Automático

```typescript
const [refreshKey, setRefreshKey] = useState(0);

const handleRefresh = () => {
  setRefreshKey(prev => prev + 1);
};
```

Este mecanismo fuerza un re-render de la página después de resolver o reclamar.

---

## 📋 Flujo Completo End-to-End

### Escenario: Usuario crea market, apuesta, resuelve y reclama

```
1. Usuario conecta wallet
   ↓
2. Usuario crea market "Bitcoin $100k?"
   - end_time: 2026-12-31
   - auto_resolve: true
   ↓
3. Usuario A apuesta 10 credits en "Yes"
   - Recibe Bet record en wallet
   ↓
4. Usuario B apuesta 5 credits en "No"
   - Recibe Bet record en wallet
   ↓
5. Esperar a que termine el market (end_time)
   ↓
6. Usuario C (o cualquiera) resuelve el market
   - Selecciona "Yes" como winner
   - Transacción aprobada
   ↓
7. Usuario A ve el market resuelto
   - Copia su Bet record del wallet
   - Pega el record en "Claim Winnings"
   - Recibe Winnings record con ~15 credits
   ↓
8. Usuario B intenta reclamar
   - ❌ "This bet is for a losing outcome"
   - No puede reclamar porque apostó en "No"
```

---

## ⚠️ Consideraciones Importantes

### Wave 2: Anti-Double-Claim Protection

El smart contract usa el mapping `claimed_bets` para prevenir que un mismo bet sea reclamado dos veces:

```leo
mapping claimed_bets: field => bool;

// En claim_winnings finalize:
let already_claimed: bool = Mapping::get_or_use(claimed_bets, bet_id, false);
assert(!already_claimed);

// Marcar como claimed
Mapping::set(claimed_bets, bet_id, true);
```

**Implicación:** Cada Bet record solo puede usarse UNA VEZ para claim.

### Records Privados

Los Bet records son **privados**. Solo el owner puede verlos en su wallet.

**Implicación:**
- Los usuarios DEBEN guardar sus Bet records
- No hay forma de recuperar un Bet record perdido
- La UI no puede "autocompletar" el Bet record

### Cálculo de Ganancias

```leo
// Proportional winnings
let winnings_share: u64 = (bet_amount * total_pool) / winning_pool;
```

**Ejemplo:**
- Total pool: 15 credits
- Winning pool (Yes): 10 credits
- Tu bet: 2 credits en Yes
- Tus ganancias: (2 * 15) / 10 = 3 credits
- Profit: 3 - 2 = 1 credit

---

## 🐛 Troubleshooting

### "Cannot resolve market: Only the creator can resolve"
- Verifica que seas el creator (`market.creator === publicKey`)
- O verifica que `auto_resolve` esté habilitado y el `end_time` haya pasado

### "Invalid bet record format"
- Asegúrate de copiar el record COMPLETO desde el wallet
- Debe incluir: `owner`, `market_id`, `bet_id`, `outcome`, `amount`, `odds_at_bet`
- Formato debe ser válido Leo record syntax

### "This bet has already been claimed"
- Ya reclamaste este bet anteriormente (Wave 2 protection)
- Verifica en tu wallet si tienes un Winnings record previo
- Intenta con un Bet record diferente

### "This bet is for a losing outcome"
- Tu bet no está en el winning outcome
- Ejemplo: Apostaste "No" pero ganó "Yes"
- Solo bets en el outcome ganador pueden reclamarse

---

## 🎉 Mejoras Futuras

### Corto Plazo
- [ ] Bet history en la UI (lista de tus bets activos)
- [ ] Detección automática de Bet records desde wallet
- [ ] Estimación de ganancias potenciales antes de claim

### Medio Plazo
- [ ] Batch claim (reclamar múltiples bets a la vez)
- [ ] Transaction history y status tracking
- [ ] Notificaciones cuando markets están listos para resolver/claim

### Largo Plazo
- [ ] Integración con oráculos para auto-resolve
- [ ] Resolución por consenso (multiple validators)
- [ ] Dispute resolution mechanism

---

## 📚 Referencias

### Documentos Relacionados
- `INTEGRATION_STATUS.md` - Estado general de integración
- `TESTING_GUIDE.md` - Guía completa de testing
- `CLAUDE.md` - Documentación del proyecto
- `program/src/main.leo` - Smart contract code

### Smart Contract Functions
- `resolve_market` (línea 202-250 en main.leo)
- `claim_winnings` (línea 259-312 en main.leo)

---

*Última actualización: 29 Enero 2026*
