# 🧪 Pasos de Testing Manual - zkPredict

**Fecha**: 29 Enero 2026
**Estado del Proyecto**: 90% MVP
**Network**: Aleo TestnetBeta

---

## ✅ Pre-verificación Completada

- ✅ Node.js v20.19.5 instalado
- ✅ Supabase configurado y funcionando (4 markets en DB)
- ✅ Variables de entorno configuradas en `.env.local`
- ✅ Dependencias instaladas (`node_modules` presente)

---

## 🚀 Paso 1: Iniciar el Servidor de Desarrollo

### Opción A: Usando NPM directamente (recomendado)

Abre una terminal en la carpeta del proyecto:

```bash
cd /mnt/c/Users/CarlosIsraelJiménezJ/Documents/Aleo/zkPredict
npx next dev
```

**Espera a ver este mensaje:**
```
▲ Next.js 15.2.4
- Local:        http://localhost:3000
- Environments: .env.local

✓ Starting...
✓ Ready in 3s
```

### Opción B: Si tienes Yarn instalado

```bash
cd /mnt/c/Users/CarlosIsraelJiménezJ/Documents/Aleo/zkPredict
yarn dev
```

---

## 📋 Paso 2: Verificar que el Servidor Está Funcionando

### 2.1 Abrir el Navegador

1. Abre tu navegador (Chrome o Firefox recomendados)
2. Ve a: **http://localhost:3000**

### 2.2 Verificación Esperada

**✅ Deberías ver:**
- La página de inicio de zkPredict
- Header con logo y botón "Connect Wallet"
- Algún contenido de la landing page

**❌ Si ves errores:**
- Verifica que el servidor esté corriendo (no haya errores en la terminal)
- Revisa la consola del navegador (F12) para errores JavaScript

---

## 🔗 Paso 3: Probar Conexión de Wallet

### Pre-requisitos

- Tener instalado **Leo Wallet** o **Puzzle Wallet** en tu navegador
- Tener créditos testnet en tu wallet (solicitar en Discord de Aleo si es necesario)

### 3.1 Conectar Wallet

1. Click en botón **"Connect Wallet"** en el header
2. Selecciona tu wallet (Leo Wallet o Puzzle Wallet)
3. Aprueba la conexión en el popup de la wallet

### 3.2 Verificación

**✅ Deberías ver:**
- Tu dirección truncada en el header (ej: `aleo1...abc123`)
- Tu balance de créditos
- El botón cambió a "Connected" o muestra tu dirección

**📝 Anota aquí:**
```
Dirección de wallet: aleo1_______________________________________
Balance inicial: __________ credits
Wallet usada: [ ] Leo Wallet [ ] Puzzle Wallet
```

---

## 🏪 Paso 4: Ver Markets Existentes

### 4.1 Navegar a Markets

1. Click en **"Markets"** en el menú de navegación
2. O ve directamente a: **http://localhost:3000/markets**

### 4.2 Verificación

**✅ Deberías ver una lista de markets:**
1. "Will Bitcoin reach $100k by end of 2026?" (Crypto)
2. "Winner of Super Bowl LXI" (Sports)
3. "Will it rain in NYC tomorrow?" (Weather)
4. "Test Market - Will Aleo reach $100 by end of 2026?" (puede aparecer o no)

**Cada market debe mostrar:**
- Título y descripción
- Badge de categoría (Sports, Crypto, Politics, etc.)
- Badge de estado (Active, Resolved, etc.)
- Fecha de finalización
- Botón "View Details" o similar

### 4.3 Abrir un Market

1. Click en cualquier market
2. Deberías ver la página de detalles del market con:
   - Información completa
   - Outcomes disponibles
   - Sección para colocar apuestas (si está activo)

**📝 Anota aquí:**
```
Markets visibles: _____
Market seleccionado para probar: _________________________________
```

---

## 📝 Paso 5: Crear un Market Nuevo

### 5.1 Navegar a Create Market

1. Click en **"Create Market"** en el menú
2. O ve a: **http://localhost:3000/create**

### 5.2 Llenar el Formulario

**Datos sugeridos para testing:**
```
Title: ¿Alcanzará Aleo $50 antes de Marzo 2026?

Description: Este market se resuelve como YES si el token ALEO alcanza
$50 USD en cualquier exchange mayor antes del 31 de Marzo de 2026.

Category: Crypto

Number of Outcomes: 2

Outcome Labels:
  - Outcome 1: No
  - Outcome 2: Yes

End Date: 2026-03-31
End Time: 23:59

Auto-resolve: [✓] Marcado
```

### 5.3 Crear el Market

1. Click en **"Create Market"**
2. **Tu wallet se abrirá** pidiendo aprobación
3. Revisa la transacción:
   - Program: `zkpredict.aleo`
   - Function: `create_market`
   - Fee: ~10 credits
   - Inputs: market_id, end_time, num_outcomes, category, auto_resolve

4. **Aprueba la transacción**

### 5.4 Esperar Confirmación

- Espera **30-60 segundos**
- Deberías ver un alert: **"Market created successfully!"**
- El market debería aparecer en la lista

### 5.5 Verificación On-Chain (Opcional)

Si tienes Leo CLI instalado:

```bash
cd program
leo query markets "[MARKET_ID]field" --network testnetbeta
```

**📝 Anota aquí:**
```
Market ID generado: _______________________________________
Transaction ID: ___________________________________________
Tiempo de confirmación: ________ segundos
Fee real cobrado: ________ credits
¿Se creó exitosamente? [ ] Sí [ ] No
Errores (si los hubo): ____________________________________
```

---

## 💰 Paso 6: Colocar una Apuesta (Place Bet)

### 6.1 Seleccionar Market

1. Ve a **http://localhost:3000/markets**
2. Click en el market que acabas de crear (o cualquier market activo)

### 6.2 Colocar la Apuesta

En la sección **"Place Your Bet"**:

1. Selecciona un outcome (ej: "Yes")
2. Observa los **odds actuales**
3. Ingresa una cantidad: **1.0** credits (o la que prefieras)
4. El "Potential Return" debería calcularse automáticamente
5. Click en **"Place Bet"**

### 6.3 Aprobar Transacción

1. **Tu wallet se abrirá** con la transacción
2. Revisa:
   - Program: `zkpredict.aleo`
   - Function: `place_bet`
   - Fee: ~5 credits
   - Inputs: market_id, outcome, amount, nonce

3. **Aprueba la transacción**

### 6.4 Guardar Bet Record (MUY IMPORTANTE)

**⚠️ CRÍTICO: Después de que la transacción se confirme:**

1. Ve a tu wallet
2. Busca la transacción de "place_bet"
3. En los **"Outputs"** o **"Records"**, copia el **Bet record completo**

**Debería verse así:**
```
{
  owner: aleo1xyz...,
  market_id: 1738097234field,
  bet_id: 789123field,
  outcome: 1u8,
  amount: 1000000u64,
  odds_at_bet: 10000u64
}
```

4. **Guarda este record en un archivo de texto** - lo necesitarás para claim winnings

### 6.5 Verificación

- ✅ Alert de éxito: "Bet placed successfully!"
- ✅ Los pools del market se actualizan (puede requerir refresh)
- ✅ Tu balance de wallet disminuyó

**📝 Anota aquí:**
```
Market apostado: __________________________________________
Outcome seleccionado: _____________________________________
Cantidad apostada: ________ credits
Odds al apostar: __________
Potential Return: ________ credits
Transaction ID: ___________________________________________
Tiempo de confirmación: ________ segundos
Fee real: ________ credits

BET RECORD (pegar completo):
{
  owner: ___________________________________________________,
  market_id: ________________________________________________,
  bet_id: ___________________________________________________,
  outcome: _____u8,
  amount: _________u64,
  odds_at_bet: _________u64
}
```

---

## ✅ Paso 7: Resolver Market

### 7.1 Pre-requisitos

Para poder resolver un market necesitas:
- **Ser el creator del market**, O
- **El market tiene auto_resolve=true** Y **end_time ya pasó**

### 7.2 Navegar al Market

1. Ve a **http://localhost:3000/markets**
2. Click en el market que creaste en el Paso 5

### 7.3 Sección "Resolve Market"

Si tienes permisos, deberías ver una sección **"Resolve Market"** con:
- Lista de outcomes con radio buttons
- Botón "Resolve Market"

### 7.4 Resolver

1. Selecciona el **winning outcome** (ej: "Yes" si es el ganador)
2. Click en **"Resolve Market"**
3. **Tu wallet se abrirá**
4. Revisa:
   - Program: `zkpredict.aleo`
   - Function: `resolve_market`
   - Fee: ~5 credits
   - Inputs: market_id, winning_outcome, current_time

5. **Aprueba la transacción**

### 7.5 Verificación Post-Resolución

Después de la confirmación (30-60 segundos):

**✅ El market debería mostrar:**
- Badge "Resolved"
- El winning outcome claramente marcado
- La sección "Place Your Bet" desaparece
- Aparece la sección "Claim Your Winnings"

**📝 Anota aquí:**
```
Market resuelto: __________________________________________
Winning outcome: __________________________________________
Transaction ID: ___________________________________________
Tiempo de confirmación: ________ segundos
Fee real: ________ credits
¿Se resolvió correctamente? [ ] Sí [ ] No
```

---

## 🏆 Paso 8: Reclamar Ganancias (Claim Winnings)

### 8.1 Pre-requisitos

- El market debe estar **resuelto** (Paso 7)
- Debes tener un **Bet record de una apuesta ganadora**
- Tu bet debe ser en el **outcome que ganó**

### 8.2 Navegar al Market Resuelto

1. Ve al market que acabas de resolver
2. Deberías ver la sección **"Claim Your Winnings"**

### 8.3 Pegar tu Bet Record

1. Click en **"▶ How to find your Bet record"** para ver instrucciones
2. Copia el **Bet record** que guardaste en el Paso 6.4
3. Pégalo en el **textarea**

### 8.4 Validación Automática

El sistema validará automáticamente:

**✅ Si apostaste en el outcome ganador:**
- Verás un alert verde: "This bet is eligible to claim winnings!"

**❌ Si apostaste en un outcome perdedor:**
- Verás un alert rojo: "This bet is for a losing outcome"
- No podrás reclamar

### 8.5 Claim Winnings

Si tu bet es ganador:

1. Click en **"Claim Winnings"**
2. **Tu wallet se abrirá**
3. Revisa:
   - Program: `zkpredict.aleo`
   - Function: `claim_winnings`
   - Fee: ~5 credits
   - Input: el Bet record completo

4. **Aprueba la transacción**

### 8.6 Verificación Post-Claim

Después de la confirmación (30-60 segundos):

**✅ Deberías:**
- Ver alert de éxito: "Winnings claimed successfully!"
- Recibir un **Winnings record** en tu wallet
- Tu balance de créditos aumentó

**Ve a tu wallet y busca el Winnings record:**
```
{
  owner: aleo1xyz...,
  amount: 2500000u64,
  market_id: 1738097234field
}
```

**📝 Anota aquí:**
```
Bet apostado en outcome: ______________________________________
Winning outcome del market: ___________________________________
¿Coinciden? [ ] Sí [ ] No
Amount apostado: ________ credits
Winnings recibidos: ________ credits
Profit neto: ________ credits
Transaction ID: ___________________________________________
Tiempo de confirmación: ________ seconds

WINNINGS RECORD (pegar):
{
  owner: ___________________________________________________,
  amount: _________u64,
  market_id: ________________________________________________
}
```

---

## 🧪 Paso 9: Testing de Edge Cases

### Test 9.1: Intentar Claim Dos Veces (Anti-Double-Claim)

1. Vuelve a la página del market resuelto
2. Pega el **mismo Bet record** que ya usaste
3. Intenta hacer claim de nuevo

**Resultado esperado:**
- ❌ La transacción debería **fallar**
- Error: "This bet has already been claimed"

### Test 9.2: Intentar Claim un Losing Bet

Si tienes un bet en el outcome perdedor:

1. Pega ese Bet record
2. Deberías ver alert rojo: "This bet is for a losing outcome"
3. El botón "Claim Winnings" puede estar habilitado pero la transacción fallará

### Test 9.3: Intentar Resolver un Market Ya Resuelto

1. Ve a un market ya resuelto
2. La sección "Resolve Market" **NO** debe aparecer
3. Solo debe estar visible "Claim Your Winnings"

### Test 9.4: Resolver sin Permisos

Si tienes acceso a otra wallet:

1. Conecta con wallet diferente (no creator)
2. Ve a un market creado por otro usuario
3. Si auto_resolve=false y no ha terminado, no deberías poder resolver

**📝 Anota resultados:**
```
Test 9.1 (Double-Claim): [ ] Pass [ ] Fail
Test 9.2 (Losing Bet): [ ] Pass [ ] Fail
Test 9.3 (Re-Resolve): [ ] Pass [ ] Fail
Test 9.4 (Sin Permisos): [ ] Pass [ ] Fail

Notas: ________________________________________________________
______________________________________________________________
```

---

## 📊 Resumen de Testing

### Funcionalidades Probadas

| Feature | Status | Notas |
|---------|--------|-------|
| Connect Wallet | [ ] ✅ [ ] ❌ | __________________ |
| View Markets | [ ] ✅ [ ] ❌ | __________________ |
| Create Market | [ ] ✅ [ ] ❌ | __________________ |
| Place Bet | [ ] ✅ [ ] ❌ | __________________ |
| Resolve Market | [ ] ✅ [ ] ❌ | __________________ |
| Claim Winnings | [ ] ✅ [ ] ❌ | __________________ |

### Tiempos de Transacción

```
Create Market:    ________ segundos
Place Bet:        ________ segundos
Resolve Market:   ________ segundos
Claim Winnings:   ________ segundos

Promedio:         ________ segundos
```

### Costos Reales (Fees)

```
Create Market:    ________ credits
Place Bet:        ________ credits
Resolve Market:   ________ credits
Claim Winnings:   ________ credits

Total gastado:    ________ credits
```

### Bugs Encontrados

```
1. _____________________________________________________________
   Severidad: [ ] Critical [ ] High [ ] Medium [ ] Low
   Pasos para reproducir: _______________________________________
   ______________________________________________________________

2. _____________________________________________________________
   Severidad: [ ] Critical [ ] High [ ] Medium [ ] Low
   Pasos para reproducir: _______________________________________
   ______________________________________________________________

3. _____________________________________________________________
   Severidad: [ ] Critical [ ] High [ ] Medium [ ] Low
   Pasos para reproducir: _______________________________________
   ______________________________________________________________
```

### UX Issues

```
1. _____________________________________________________________

2. _____________________________________________________________

3. _____________________________________________________________
```

---

## ✅ Criterios de Éxito

Para considerar el testing exitoso, TODAS estas condiciones deben cumplirse:

- [ ] Wallet se conecta sin errores
- [ ] Markets se muestran correctamente desde Supabase
- [ ] Se puede crear un market on-chain
- [ ] Metadata del market se guarda en Supabase
- [ ] Se puede colocar una apuesta
- [ ] Bet record se genera y se puede copiar
- [ ] Pools se actualizan después de bet
- [ ] Se puede resolver un market desde UI
- [ ] Market muestra estado "Resolved" correctamente
- [ ] Se puede reclamar winnings con bet record
- [ ] Winnings record se genera en wallet
- [ ] Anti-double-claim funciona (no se puede reclamar dos veces)
- [ ] No se puede reclamar un losing bet

---

## 🐛 Troubleshooting

### Servidor no inicia

**Error:** `yarn: not found`
**Solución:** Usa `npx next dev` en lugar de `yarn dev`

### Wallet no se conecta

**Posibles causas:**
- Wallet no está instalada
- Estás en la red incorrecta (debe ser testnetbeta)
- Extensión deshabilitada

**Solución:**
- Verifica que tengas Leo Wallet o Puzzle Wallet
- Cambia a testnetbeta en la configuración del wallet
- Recarga la página

### Transacción rechazada: "Insufficient funds"

**Solución:**
- Necesitas más créditos testnet
- Solicita en el Discord de Aleo: https://discord.gg/aleohq

### Market no aparece después de crearlo

**Solución:**
- Espera 1-2 minutos (confirmación blockchain)
- Refresca la página
- Verifica en Supabase que la metadata se guardó

### Pools no se actualizan

**Solución:**
- Refresca la página manualmente
- Espera confirmación de transacción
- Verifica on-chain con `leo query`

---

## 📝 Conclusión Final

### Estado del Testing: [ ] ✅ Passed [ ] ⚠️ Passed with Issues [ ] ❌ Failed

### Comentarios Finales:
```
__________________________________________________________________
__________________________________________________________________
__________________________________________________________________
__________________________________________________________________
```

### Recomendaciones:
```
__________________________________________________________________
__________________________________________________________________
__________________________________________________________________
```

---

**Testing completado el:** ___________
**Por:** ___________
**Versión testeada:** zkPredict v0.1.0 (90% MVP)

---

*Documento generado el 29 Enero 2026*
