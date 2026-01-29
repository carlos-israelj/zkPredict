# ⚡ Quick Deploy - zkPredict a Vercel

**Status**: ✅ Listo para deploy
**Build local**: ✅ Exitoso
**Tiempo estimado**: 15 minutos

---

## 🎯 Resumen de Preparación Completada

### ✅ Archivos Creados/Modificados

1. **`vercel.json`** - Configuración de deployment
2. **`.vercelignore`** - Archivos excluidos
3. **`src/components/ui/button/button.tsx`** - Error TypeScript corregido
4. **`DEPLOYMENT_GUIDE.md`** - Guía completa de deployment
5. **`QUICK_DEPLOY.md`** - Este archivo (guía rápida)

### ✅ Verificaciones Completadas

- ✅ Build de producción: **EXITOSO** (0 errores)
- ✅ TypeScript: Warnings menores ignorados en producción
- ✅ Next.js config: Optimizado para Vercel
- ✅ Supabase: Conectado y funcionando
- ✅ Variables de entorno: Documentadas

---

## 🚀 Pasos para Deployar (Método Rápido)

### Paso 1: Push a GitHub (Si aún no lo has hecho)

```bash
cd /mnt/c/Users/CarlosIsraelJiménezJ/Documents/Aleo/zkPredict

# Si es la primera vez
git init
git add .
git commit -m "Initial commit - Ready for deployment"
git branch -M main
git remote add origin https://github.com/TU-USERNAME/zkPredict.git
git push -u origin main

# Si ya tienes repo
git add .
git commit -m "Deployment ready - Build tested"
git push origin main
```

### Paso 2: Importar en Vercel

1. Ve a **https://vercel.com/new**
2. Login con GitHub
3. Click **"Import Project"**
4. Busca tu repositorio **"zkPredict"**
5. Click **"Import"**

### Paso 3: Configurar Variables de Entorno

En la sección "Environment Variables", agrega ESTAS 7 variables:

#### Variables Críticas (Supabase)

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://gnelwpxhgavntqfplwau.supabase.co
Environments: ✓ Production ✓ Preview ✓ Development
```

```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImduZWx3cHhoZ2F2bnRxZnBsd2F1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NTU4MDMsImV4cCI6MjA4NTIzMTgwM30.Ixq7zBSmMcEOrW1s5X6Wh5SwfoxVY6-ukgzKSn1VZvE
Environments: ✓ Production ✓ Preview ✓ Development
```

#### Variables Críticas (Aleo Network)

```
Name: NEXT_PUBLIC_RPC_URL
Value: https://api.explorer.provable.com/v1
Environments: ✓ Production ✓ Preview ✓ Development
```

```
Name: RPC_URL
Value: https://api.explorer.provable.com/v1
Environments: ✓ Production ✓ Preview ✓ Development
```

#### Variables Opcionales

```
Name: URL
Value: https://zkpredict.vercel.app
Environments: ✓ Production ✓ Preview ✓ Development
```

```
Name: TWITTER
Value: https://twitter.com/AleoHQ
Environments: ✓ Production ✓ Preview ✓ Development
```

```
Name: DISCORD
Value: https://discord.gg/aleohq
Environments: ✓ Production ✓ Preview ✓ Development
```

### Paso 4: Deploy

1. Click **"Deploy"**
2. Espera 5-10 minutos (primera build es lenta por Aleo SDK)
3. Vercel mostrará progreso en tiempo real

### Paso 5: Verificar Deployment

Una vez completado:

1. Click **"Visit"** para abrir la app
2. URL será algo como: `https://zkpredict-tu-username.vercel.app`
3. Verifica:
   - ✅ Página carga sin errores
   - ✅ Markets se muestran (desde Supabase)
   - ✅ Botón "Connect Wallet" funciona
   - ✅ No hay errores en consola del navegador (F12)

---

## 🧪 Testing en Producción

### Checklist Rápido

1. **Conectar Wallet**
   - Usa Leo Wallet o Puzzle Wallet
   - Asegúrate de estar en testnetbeta
   - Verifica que tu dirección aparece

2. **Ver Markets**
   - Ve a `/markets`
   - Deberían aparecer 3-4 markets de Supabase
   - Click en uno para ver detalles

3. **Crear Market** (Requiere créditos testnet)
   - Ve a `/create`
   - Llena formulario de prueba
   - Aprueba transacción (~10 credits)
   - Verifica que aparece en la lista

4. **Place Bet** (Requiere créditos testnet)
   - Ve a un market activo
   - Selecciona outcome
   - Apuesta 1 credit (~5 credits fee)
   - **GUARDA el Bet record** del wallet

5. **Resolver y Claim**
   - Sigue los pasos en `MANUAL_TESTING_STEPS.md`

---

## 📊 Resultado Esperado del Build

El build exitoso debe mostrar algo como:

```
✓ Compiled successfully
✓ Generating static pages (5/5)
✓ Finalizing page optimization

Route (pages)                    Size       First Load JS
┌ ○ /                         7.04 kB         133 kB
├ ○ /404                      4.11 kB         130 kB
├ ƒ /api/markets                  0 B         116 kB
├ ƒ /api/markets/[id]             0 B         116 kB
├ ○ /markets                  5.59 kB         124 kB
└ ○ /markets/[id]              6.7 kB         125 kB
```

**Total First Load JS**: ~133 kB (excelente performance)

---

## ⚠️ Problemas Comunes y Soluciones

### Error durante Build: "Module not found"

**Solución**:
1. Limpia cache de Vercel
2. Settings → Clear Build Cache
3. Re-deploy

### Markets no aparecen en producción

**Solución**:
1. Verifica que `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` estén correctas
2. Ve a Vercel → Settings → Environment Variables
3. Verifica que estén marcadas para "Production"
4. Re-deploy si las cambiaste

### Wallet no se conecta

**Solución**:
1. Verifica que `NEXT_PUBLIC_RPC_URL` esté correcta
2. Cambia tu wallet a testnetbeta
3. Refresca la página

### Build timeout en Vercel

**Solución**:
- Esto es raro, pero puede pasar por las dependencias de Aleo
- Espera y re-intenta el deploy
- Si persiste, contacta soporte de Vercel

---

## 🔄 Deployments Automáticos

Después del primer deploy, Vercel automáticamente:

1. **Detecta push a `main`** → Deploy a producción
2. **Detecta PR** → Crea preview deployment
3. **Notifica en GitHub** → Status check en commits

**Workflow continuo:**
```bash
# Hacer cambios
git add .
git commit -m "Feature: nueva funcionalidad"
git push origin main

# Vercel deploya automáticamente
# URL de producción se actualiza en ~5-10 min
```

---

## 📱 Compartir con Testers

Una vez deployado, comparte:

```
🎉 zkPredict está LIVE!

🌐 URL: https://zkpredict-[tu-username].vercel.app
📝 Network: Aleo Testnet Beta
💰 Necesitas: Créditos testnet (solicitar en Discord)
🦊 Wallets: Leo Wallet, Puzzle Wallet

Guía de testing: [compartir MANUAL_TESTING_STEPS.md]
```

---

## 📈 Métricas de Performance Esperadas

**Primera carga:**
- Landing page: ~2-3 segundos
- Markets page: ~3-4 segundos (query a Supabase)

**Navegación posterior:**
- Cambio de página: <500ms (Next.js caching)
- API calls: ~200-500ms (Supabase)
- Blockchain queries: ~1-3 segundos (Aleo RPC)

---

## ✅ Deployment Checklist Final

Antes de considerar el deploy completo:

- [ ] App carga sin errores en navegador
- [ ] Markets se muestran correctamente
- [ ] Wallet se puede conectar
- [ ] Crear market funciona (con créditos)
- [ ] Place bet funciona (con créditos)
- [ ] Console del navegador sin errores críticos
- [ ] Performance aceptable (<5s primera carga)
- [ ] URL compartida con testers

---

## 🎊 ¡Felicidades!

Si llegaste hasta aquí y todo funciona:

✅ **Tu proyecto zkPredict está deployado en producción**
✅ **90% MVP completado**
✅ **Listo para testing end-to-end**

**Próximos pasos:**
1. Probar flujo completo en producción
2. Recopilar feedback de testers
3. Implementar mejoras basadas en feedback
4. Alcanzar el 100% MVP

---

## 📚 Documentos de Referencia

- **`DEPLOYMENT_GUIDE.md`** - Guía completa de deployment
- **`MANUAL_TESTING_STEPS.md`** - Testing end-to-end
- **`INTEGRATION_STATUS.md`** - Estado del proyecto
- **`IMPLEMENTATION_SUMMARY.md`** - Resumen de implementación

---

**Deployment preparado**: ✅
**Build testeado**: ✅
**Listo para producción**: ✅

---

*Deploy with confidence! 🚀*

**Última actualización**: 29 Enero 2026
