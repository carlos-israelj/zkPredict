# 🚀 Cómo Empezar el Testing - zkPredict

## ✅ Estado Actual

**Servidor**: ✅ Ya está corriendo en `http://localhost:3000`
**Progreso MVP**: 90%
**Nuevas Features**: Resolve Market UI + Claim Winnings UI

---

## 📋 Documentos de Testing Disponibles

1. **`TESTING_CHECKLIST.md`** - Checklist completo para testing manual (USAR ESTE)
2. **`TESTING_GUIDE.md`** - Guía detallada con troubleshooting
3. **`RESOLVE_CLAIM_GUIDE.md`** - Guía específica de los nuevos componentes

---

## 🎯 Testing Rápido (15 minutos)

Si quieres hacer un testing rápido, sigue estos pasos:

### 1. Abrir la Aplicación
```
Abre tu navegador en: http://localhost:3000
```

### 2. Conectar Wallet
- Click en "Connect Wallet"
- Selecciona Leo Wallet o Puzzle Wallet
- Aprueba la conexión

### 3. Ver Markets
- Navega a http://localhost:3000/markets
- Verifica que se muestran markets

### 4. Probar Crear Market
- Click en "Create Market"
- Llena el formulario:
  ```
  Title: Testing Market - Will Aleo reach $50?
  Description: Test market for development
  Category: Crypto
  Outcomes: 2 (Yes, No)
  End Date: [Mañana]
  Auto-resolve: Sí
  ```
- Click "Create Market"
- Aprobar en wallet
- Esperar confirmación (30-60 segundos)

### 5. Probar Place Bet
- Abrir el market que creaste
- Seleccionar "Yes" o "No"
- Ingresar: `1` credit
- Click "Place Bet"
- Aprobar en wallet
- **MUY IMPORTANTE**: Guardar el Bet record que aparece en tu wallet

### 6. Probar Resolve Market ✨ NUEVO
- En el mismo market, scroll hacia abajo
- Verás la sección "Resolve Market" (porque eres el creator)
- Selecciona el outcome ganador (ej: "Yes")
- Click "Resolve Market"
- Aprobar en wallet
- Esperar confirmación

### 7. Probar Claim Winnings ✨ NUEVO
- Después de resolver, verás "Claim Your Winnings"
- Click en "▶ How to find your Bet record" para ver instrucciones
- Ve a tu wallet y copia el Bet record de cuando hiciste la apuesta
- Pega el Bet record en el textarea
- Verifica que aparezca alert verde (si apostaste en el ganador)
- Click "Claim Winnings"
- Aprobar en wallet
- ¡Deberías recibir tus ganancias!

---

## 🧪 Testing Completo (1-2 horas)

Si quieres hacer testing exhaustivo, usa el **`TESTING_CHECKLIST.md`**:

```bash
# Abrir el checklist
code TESTING_CHECKLIST.md
# o
cat TESTING_CHECKLIST.md
```

Este checklist incluye:
- ✅ Todos los pasos detallados
- ✅ Verificaciones para cada paso
- ✅ Espacios para documentar resultados
- ✅ Testing de edge cases
- ✅ Sección para reportar bugs

---

## 🔍 Qué Verificar Específicamente

### Nuevas Funcionalidades (Resolve & Claim)

#### ResolveMarket Component
- [ ] La UI aparece solo cuando el market NO está resuelto
- [ ] Verifica permisos correctamente:
  - [ ] Creator puede resolver en cualquier momento
  - [ ] No-creator puede resolver solo si auto_resolve=true y end_time pasó
- [ ] Radio buttons muestran todos los outcomes
- [ ] Transacción se envía correctamente
- [ ] Market se marca como "Resolved" después
- [ ] UI se actualiza automáticamente

#### ClaimWinnings Component
- [ ] La UI aparece solo cuando el market ESTÁ resuelto
- [ ] Instrucciones expandibles funcionan
- [ ] Textarea acepta el bet record
- [ ] Validación automática funciona:
  - [ ] Alert verde si es winning bet
  - [ ] Alert rojo si es losing bet
- [ ] Transacción se envía correctamente
- [ ] Winnings record se recibe en el wallet
- [ ] Balance de créditos aumenta

### Validaciones de Edge Cases
- [ ] No puedes resolver un market dos veces
- [ ] No puedes claim un losing bet
- [ ] No puedes claim el mismo bet dos veces (anti-double-claim)
- [ ] No puedes resolver un market si no tienes permisos

---

## 📊 Checklist Rápido de Funcionalidades

```
Funcionalidad          | Status | Notas
-----------------------|--------|------------------------
Connect Wallet         | [ ]    |
View Markets           | [ ]    |
Create Market          | [ ]    |
Place Bet              | [ ]    |
Resolve Market (UI)    | [ ]    | ✨ NUEVO
Claim Winnings (UI)    | [ ]    | ✨ NUEVO
```

---

## 🐛 Errores Comunes y Soluciones

### "Wallet does not support transactions"
**Solución**: Actualiza tu wallet a la última versión

### "Insufficient funds"
**Solución**: Necesitas más créditos testnet. Solicita en Discord de Aleo.

### "Failed to broadcast transaction"
**Solución**: El RPC puede estar caído. Espera unos minutos.

### "Market no aparece después de crearlo"
**Solución**: Espera 1-2 minutos y refresca la página.

### "This bet has already been claimed"
**Solución**: Ya reclamaste este bet. Es el sistema anti-double-claim funcionando correctamente (Wave 2 feature).

### "Invalid bet record format"
**Solución**: Asegúrate de copiar el record COMPLETO desde tu wallet, incluyendo las llaves `{}`.

---

## 💡 Tips para Testing Efectivo

1. **Guarda Todo**: Guarda todos los Transaction IDs y Bet records
2. **Usa el Checklist**: Marca cada paso en `TESTING_CHECKLIST.md`
3. **Documenta Bugs**: Anota cualquier comportamiento extraño
4. **Prueba Edge Cases**: Intenta hacer cosas "incorrectas" a propósito
5. **Verifica On-Chain**: Usa Leo CLI para verificar el estado real del blockchain

---

## 📱 Abrir la Aplicación

El servidor ya está corriendo. Solo necesitas:

```
1. Abrir tu navegador
2. Ir a: http://localhost:3000
3. ¡Empezar a probar!
```

---

## 📞 Ayuda Adicional

Si encuentras problemas:

1. **Revisa la consola del navegador** (F12)
2. **Revisa los logs del servidor** (terminal donde corre `npm run dev`)
3. **Consulta `TESTING_GUIDE.md`** para troubleshooting detallado
4. **Consulta `RESOLVE_CLAIM_GUIDE.md`** para detalles de los nuevos componentes

---

## 🎉 ¡Listo para Empezar!

**Siguiente paso**: Abre http://localhost:3000 y sigue el **Testing Rápido** arriba.

Para testing completo, usa **`TESTING_CHECKLIST.md`**.

**¡Buena suerte con el testing!** 🚀

---

*Última actualización: 29 Enero 2026*
*Servidor corriendo en: http://localhost:3000*
