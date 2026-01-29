# 🧪 Testing Checklist - zkPredict End-to-End

**Fecha de Testing**: ___________
**Tester**: ___________
**Versión**: 90% MVP

---

## 🔧 Pre-requisitos

Antes de empezar, verifica:

- [ ] Node.js instalado (`node --version`)
- [ ] Leo Wallet o Puzzle Wallet instalado en el navegador
- [ ] Créditos testnet en tu wallet (solicitar en Discord de Aleo si es necesario)
- [ ] Repositorio clonado y dependencias instaladas

```bash
cd zkPredict
npm install
```

---

## 🚀 Paso 1: Iniciar el Servidor

### Comandos:
```bash
# Desde la raíz del proyecto
npm run dev
```

### Verificaciones:
- [ ] El servidor compila sin errores críticos
- [ ] Se muestra el mensaje: `ready - started server on 0.0.0.0:3000`
- [ ] Abrir http://localhost:3000 en el navegador
- [ ] La página carga correctamente
- [ ] No hay errores en la consola del navegador (F12)

**Notas:**
```
___________________________________________________________
___________________________________________________________
```

---

## 🔗 Paso 2: Conectar Wallet

### Acciones:
1. [ ] Click en el botón "Connect Wallet" (debe estar en el header/navbar)
2. [ ] Selecciona tu wallet (Leo Wallet o Puzzle Wallet)
3. [ ] Aprueba la conexión en el popup del wallet

### Verificaciones:
- [ ] Tu dirección de wallet se muestra en el header
- [ ] Tu balance de créditos es visible
- [ ] El botón cambió a "Connected" o muestra tu dirección truncada
- [ ] No hay errores en la consola

**Dirección de Wallet:**
```
aleo1___________________________________________________________
```

**Balance:**
```
________ credits
```

**Notas:**
```
___________________________________________________________
___________________________________________________________
```

---

## 🏪 Paso 3: Ver Markets Existentes

### Acciones:
1. [ ] Navegar a http://localhost:3000/markets
2. [ ] O click en "Markets" en el menú de navegación

### Verificaciones:
- [ ] Se muestra una lista de markets (pueden ser mock o reales)
- [ ] Cada market muestra:
  - [ ] Título
  - [ ] Descripción
  - [ ] Category badge (Sports, Crypto, Politics, etc.)
  - [ ] Status badge (Active, Resolved, Pending Resolution)
  - [ ] End date/time
- [ ] Los markets son clickeables
- [ ] No hay errores en consola

**Markets Visibles:**
```
1. ___________________________________________________________
2. ___________________________________________________________
3. ___________________________________________________________
```

**Notas:**
```
___________________________________________________________
___________________________________________________________
```

---

## 📝 Paso 4: Crear un Market (Create Market)

### Acciones:
1. [ ] Click en botón "Create Market"
2. [ ] Llenar el formulario:

**Datos del Formulario:**
```
Title: ___________________________________________________________
Description: ______________________________________________________
Category: [ ] Sports [ ] Politics [ ] Crypto [ ] Weather [ ] Other
Number of Outcomes: ____
Outcome Labels:
  - Outcome 1: ___________________
  - Outcome 2: ___________________
End Date: ____________
End Time: ____________
Auto-resolve: [ ] Yes [ ] No
```

3. [ ] Click en "Create Market"
4. [ ] Aprobar transacción en el wallet

### Verificaciones:
- [ ] Wallet popup aparece con detalles de la transacción
- [ ] Fee mostrado es ~10 credits
- [ ] Inputs se ven correctos (market_id, end_time, num_outcomes, category, auto_resolve)
- [ ] Transacción se envía sin errores
- [ ] Alert de éxito: "Market created successfully!"
- [ ] El formulario se limpia después de crear

### Esperar Confirmación (30-60 segundos):
- [ ] La transacción se confirma en el blockchain
- [ ] El nuevo market aparece en la lista de markets

**Transaction ID:**
```
___________________________________________________________
```

**Market ID generado:**
```
___________________________________________________________
```

**Tiempo de confirmación:**
```
________ segundos
```

**Notas/Errores:**
```
___________________________________________________________
___________________________________________________________
```

---

## 💰 Paso 5: Colocar una Apuesta (Place Bet)

### Acciones:
1. [ ] Navegar al market que acabas de crear
2. [ ] En la sección "Place Your Bet":
   - [ ] Seleccionar un outcome (ej: "Yes" o "No")
   - [ ] Ingresar cantidad: ________ credits
3. [ ] Click en "Place Bet"
4. [ ] Aprobar transacción en el wallet

### Verificaciones:
- [ ] Los odds se muestran para cada outcome
- [ ] El "Potential Return" se calcula automáticamente
- [ ] Wallet popup aparece con detalles de la transacción
- [ ] Fee mostrado es ~5 credits
- [ ] Inputs se ven correctos (market_id, outcome, amount, nonce)
- [ ] Transacción se envía sin errores
- [ ] Alert de éxito: "Bet placed successfully!"

### Esperar Confirmación (30-60 segundos):
- [ ] La transacción se confirma
- [ ] Los pools se actualizan en el market (puede requerir refresh)

**Bet Details:**
```
Market: ___________________________________________________________
Outcome Selected: __________________________________________________
Amount: ________ credits
Potential Return: ________ credits
```

**Transaction ID:**
```
___________________________________________________________
```

**Bet Record (COPIAR del wallet - MUY IMPORTANTE):**
```
{
  owner: aleo1________________________________________________,
  market_id: ____________________________field,
  bet_id: ________________________________field,
  outcome: ____u8,
  amount: __________u64,
  odds_at_bet: __________u64
}
```

**⚠️ IMPORTANTE: Guarda este Bet Record - lo necesitarás para Claim Winnings!**

**Tiempo de confirmación:**
```
________ segundos
```

**Notas/Errores:**
```
___________________________________________________________
___________________________________________________________
```

---

## ✅ Paso 6: Resolver Market (Resolve Market) ✨ NUEVO

### Pre-requisito:
- [ ] Ser el creator del market, O
- [ ] El market debe tener auto_resolve=true Y end_time debe haber pasado

### Acciones:
1. [ ] Navegar al market que creaste
2. [ ] Scroll hacia abajo hasta la sección "Resolve Market"
3. [ ] Verificar que puedes ver la UI de resolución
4. [ ] Seleccionar el winning outcome:
   - [ ] Outcome seleccionado: ___________________
5. [ ] Click en "Resolve Market"
6. [ ] Aprobar transacción en el wallet

### Verificaciones:
- [ ] La sección "Resolve Market" es visible
- [ ] Radio buttons muestran todos los outcomes
- [ ] Wallet popup aparece con detalles
- [ ] Fee mostrado es ~5 credits
- [ ] Inputs se ven correctos (market_id, winning_outcome, current_time)
- [ ] Transacción se envía sin errores
- [ ] Alert de éxito: "Market resolved successfully!"

### Después de Resolver:
- [ ] El market muestra badge "Resolved"
- [ ] El winning outcome se muestra claramente
- [ ] La sección "Place Your Bet" desaparece
- [ ] La sección "Claim Your Winnings" aparece
- [ ] El outcome ganador tiene color verde en la distribución

**Resolution Details:**
```
Market ID: ________________________________________________________
Winning Outcome: __________________________________________________
```

**Transaction ID:**
```
___________________________________________________________
```

**Tiempo de confirmación:**
```
________ segundos
```

**Notas/Errores:**
```
___________________________________________________________
___________________________________________________________
```

---

## 🏆 Paso 7: Reclamar Ganancias (Claim Winnings) ✨ NUEVO

### Pre-requisitos:
- [ ] El market debe estar resuelto
- [ ] Debes tener un Bet record de una apuesta GANADORA
- [ ] Tu bet debe ser en el outcome que ganó

### Acciones:
1. [ ] Navegar al market resuelto
2. [ ] En la sección "Claim Your Winnings":
   - [ ] Click en "▶ How to find your Bet record" (leer instrucciones)
   - [ ] Ir a tu wallet y buscar la transacción de "Place Bet"
   - [ ] Copiar el Bet record completo
3. [ ] Pegar el Bet record en el textarea
4. [ ] Verificar el feedback visual:
   - [ ] Si es winning bet → Alert verde ✅
   - [ ] Si es losing bet → Alert rojo ❌
5. [ ] Click en "Claim Winnings"
6. [ ] Aprobar transacción en el wallet

### Verificaciones:
- [ ] La sección "Claim Your Winnings" es visible
- [ ] Instrucciones expandibles funcionan
- [ ] Textarea acepta el bet record
- [ ] Validación automática funciona (verde para winning, rojo para losing)
- [ ] Wallet popup aparece con detalles
- [ ] Fee mostrado es ~5 credits
- [ ] Transacción se envía sin errores
- [ ] Alert de éxito: "Winnings claimed successfully!"

### Después de Claim:
- [ ] Recibes un Winnings record en tu wallet
- [ ] Tu balance de créditos aumenta
- [ ] El textarea se limpia

**Claim Details:**
```
Market ID: ________________________________________________________
Your Bet Outcome: _________________________________________________
Winning Outcome: __________________________________________________
Bet Amount: ________ credits
Winnings Received: ________ credits
Profit: ________ credits
```

**Winnings Record (del wallet):**
```
{
  owner: aleo1________________________________________________,
  amount: __________u64,
  market_id: ____________________________field
}
```

**Transaction ID:**
```
___________________________________________________________
```

**Tiempo de confirmación:**
```
________ segundos
```

**Notas/Errores:**
```
___________________________________________________________
___________________________________________________________
```

---

## 🔍 Paso 8: Verificación On-Chain (Opcional)

Si tienes Leo CLI instalado, puedes verificar el estado on-chain:

```bash
cd program

# Verificar market
leo query markets "[MARKET_ID]field" --network testnetbeta

# Verificar pools
leo query yes_pool "[MARKET_ID]field" --network testnetbeta
leo query no_pool "[MARKET_ID]field" --network testnetbeta
```

**Resultados:**
```
___________________________________________________________
___________________________________________________________
___________________________________________________________
```

---

## 🧪 Testing de Edge Cases

### Test 1: Intentar Resolver un Market Ya Resuelto
- [ ] Navegar a un market ya resuelto
- [ ] La sección "Resolve Market" NO debe aparecer
- [ ] Solo debe aparecer "Claim Your Winnings"

**Resultado:** ✅ Pass / ❌ Fail
**Notas:**
```
___________________________________________________________
```

### Test 2: Intentar Claim un Losing Bet
- [ ] Pegar un bet record de un outcome que NO ganó
- [ ] Debe aparecer alert rojo: "This bet is for a losing outcome"
- [ ] El botón "Claim Winnings" debe estar habilitado pero fallar

**Resultado:** ✅ Pass / ❌ Fail
**Notas:**
```
___________________________________________________________
```

### Test 3: Intentar Claim Dos Veces el Mismo Bet
- [ ] Después de claim exitoso, volver a la página
- [ ] Pegar el mismo bet record de nuevo
- [ ] Intentar claim
- [ ] Debe fallar con error: "This bet has already been claimed"

**Resultado:** ✅ Pass / ❌ Fail
**Notas:**
```
___________________________________________________________
```

### Test 4: Resolver sin Permisos
- [ ] Conectar con una wallet diferente (no creator)
- [ ] Navegar a un market creado por otro usuario
- [ ] Si auto_resolve=false, no debe poder resolver
- [ ] Debe mostrar alert: "Cannot Resolve Market"

**Resultado:** ✅ Pass / ❌ Fail
**Notas:**
```
___________________________________________________________
```

---

## 📊 Resumen de Testing

### Funcionalidades Core
- [ ] ✅ Connect Wallet
- [ ] ✅ View Markets
- [ ] ✅ Create Market
- [ ] ✅ Place Bet
- [ ] ✅ Resolve Market (UI)
- [ ] ✅ Claim Winnings (UI)

### Performance
- **Tiempo promedio Create Market:** ________ segundos
- **Tiempo promedio Place Bet:** ________ segundos
- **Tiempo promedio Resolve Market:** ________ segundos
- **Tiempo promedio Claim Winnings:** ________ segundos

### Costos Reales
- **Create Market fee:** ________ credits
- **Place Bet fee:** ________ credits
- **Resolve Market fee:** ________ credits
- **Claim Winnings fee:** ________ credits

### Bugs Encontrados
```
1. ___________________________________________________________
   Severidad: [ ] Critical [ ] High [ ] Medium [ ] Low

2. ___________________________________________________________
   Severidad: [ ] Critical [ ] High [ ] Medium [ ] Low

3. ___________________________________________________________
   Severidad: [ ] Critical [ ] High [ ] Medium [ ] Low
```

### UX Issues
```
1. ___________________________________________________________

2. ___________________________________________________________

3. ___________________________________________________________
```

### Mejoras Sugeridas
```
1. ___________________________________________________________

2. ___________________________________________________________

3. ___________________________________________________________
```

---

## ✅ Conclusión

### Estado del Testing: [ ] ✅ Passed [ ] ⚠️ Passed with Issues [ ] ❌ Failed

### Comentarios Finales:
```
___________________________________________________________
___________________________________________________________
___________________________________________________________
___________________________________________________________
```

### Siguiente Paso:
```
[ ] Reportar bugs encontrados
[ ] Implementar fixes
[ ] Re-testing después de fixes
[ ] Deploy a producción
```

---

**Testing completado por:** ___________
**Fecha:** ___________
**Firma:** ___________

---

*Checklist basado en zkPredict v0.1.0 - 90% MVP*
