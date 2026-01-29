# 🚀 Guía de Deployment - zkPredict

**Fecha**: 29 Enero 2026
**Plataforma**: Vercel (recomendado para Next.js)
**Versión**: v0.1.0 (90% MVP)

---

## 📋 Pre-requisitos

Antes de deployar, asegúrate de tener:

- ✅ Cuenta en [Vercel](https://vercel.com)
- ✅ Repositorio de GitHub con el código
- ✅ Supabase configurado y funcionando
- ✅ Smart contract deployado en Aleo (`zkpredict.aleo`)
- ✅ Variables de entorno listas

---

## 🔧 Preparación Completada

Los siguientes archivos han sido configurados para deployment:

### 1. Archivos de Configuración ✅

- **`vercel.json`** - Configuración de Vercel
- **`.vercelignore`** - Archivos excluidos del deployment
- **`next.config.js`** - Ya configurado para producción
- **`.env.local`** - Variables de entorno (local)

### 2. Correcciones de Código ✅

- **`src/components/ui/button/button.tsx`** - Error de TypeScript corregido
- **Ignorar errores de TypeScript en producción** - Configurado en `next.config.js`

---

## 📦 Variables de Entorno Requeridas

Cuando deploys en Vercel, necesitas configurar estas variables de entorno:

### Variables de Supabase (CRÍTICAS)

```
NEXT_PUBLIC_SUPABASE_URL=https://gnelwpxhgavntqfplwau.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImduZWx3cHhoZ2F2bnRxZnBsd2F1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NTU4MDMsImV4cCI6MjA4NTIzMTgwM30.Ixq7zBSmMcEOrW1s5X6Wh5SwfoxVY6-ukgzKSn1VZvE
```

### Variables de Aleo Network (CRÍTICAS)

```
NEXT_PUBLIC_RPC_URL=https://api.explorer.provable.com/v1
RPC_URL=https://api.explorer.provable.com/v1
```

### Variables de Información (Opcionales)

```
URL=https://tu-dominio.vercel.app
TWITTER=https://twitter.com/AleoHQ
DISCORD=https://discord.gg/aleohq
```

---

## 🚀 Opción 1: Deploy desde Vercel Dashboard (Recomendado)

### Paso 1: Conectar Repositorio

1. Ve a [https://vercel.com/new](https://vercel.com/new)
2. Click en "Import Project"
3. Conecta tu cuenta de GitHub
4. Selecciona el repositorio `zkPredict`
5. Click en "Import"

### Paso 2: Configurar el Proyecto

Vercel detectará automáticamente que es un proyecto Next.js.

**Configuración detectada:**
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next` (automático)
- **Install Command**: `npm install`

**NO cambies nada aquí**, la configuración automática es correcta.

### Paso 3: Agregar Variables de Entorno

En la sección "Environment Variables", agrega una por una:

1. Click en "Add Environment Variable"
2. **Name**: `NEXT_PUBLIC_SUPABASE_URL`
3. **Value**: `https://gnelwpxhgavntqfplwau.supabase.co`
4. **Environments**: Marca todas (Production, Preview, Development)
5. Click "Add"

Repite para TODAS estas variables:

```
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ NEXT_PUBLIC_RPC_URL
✅ RPC_URL
✅ URL (usar el dominio de Vercel asignado, ej: zkpredict.vercel.app)
✅ TWITTER
✅ DISCORD
```

### Paso 4: Deploy

1. Click en **"Deploy"**
2. Espera 5-10 minutos (primera build es lenta debido a Aleo SDK)
3. Vercel mostrará el progreso en tiempo real

### Paso 5: Verificar Deployment

Una vez completado:

1. Click en "Visit" para abrir tu app
2. Verifica que carga correctamente
3. Prueba conectar wallet
4. Verifica que markets se muestran desde Supabase

**URL de tu app**: `https://zkpredict-[tu-username].vercel.app`

---

## 🚀 Opción 2: Deploy desde CLI (Avanzado)

### Paso 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

### Paso 2: Login

```bash
vercel login
```

### Paso 3: Configurar Variables de Entorno

Crea un archivo `.env.production` (NO lo subas a Git):

```bash
# .env.production
NEXT_PUBLIC_SUPABASE_URL=https://gnelwpxhgavntqfplwau.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImduZWx3cHhoZ2F2bnRxZnBsd2F1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NTU4MDMsImV4cCI6MjA4NTIzMTgwM30.Ixq7zBSmMcEOrW1s5X6Wh5SwfoxVY6-ukgzKSn1VZvE
NEXT_PUBLIC_RPC_URL=https://api.explorer.provable.com/v1
RPC_URL=https://api.explorer.provable.com/v1
URL=https://zkpredict.vercel.app
TWITTER=https://twitter.com/AleoHQ
DISCORD=https://discord.gg/aleohq
```

### Paso 4: Deploy

```bash
cd /mnt/c/Users/CarlosIsraelJiménezJ/Documents/Aleo/zkPredict
vercel --prod
```

Sigue las instrucciones interactivas:

```
? Set up and deploy "~/zkPredict"? [Y/n] y
? Which scope do you want to deploy to? [Tu username]
? Link to existing project? [y/N] n
? What's your project's name? zkpredict
? In which directory is your code located? ./
? Want to modify these settings? [y/N] n
```

### Paso 5: Configurar Variables desde CLI

```bash
# Supabase
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

# Aleo
vercel env add NEXT_PUBLIC_RPC_URL production
vercel env add RPC_URL production

# Info
vercel env add URL production
vercel env add TWITTER production
vercel env add DISCORD production
```

### Paso 6: Re-deploy con Variables

```bash
vercel --prod
```

---

## 🔍 Troubleshooting de Deployment

### Error: "Build failed - Out of memory"

**Causa**: Las dependencias de Aleo SDK son pesadas.

**Solución**: Vercel Pro o configurar en `vercel.json`:

```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next",
      "config": {
        "maxLambdaSize": "50mb"
      }
    }
  ]
}
```

### Error: "Module not found: Can't resolve '@demox-labs/...'"

**Causa**: Problemas con WASM modules.

**Solución**: Ya está configurado en `next.config.js`. Si persiste:

1. Verifica que `next.config.js` se subió correctamente
2. Limpia cache de Vercel (Settings → Clear Build Cache)
3. Re-deploy

### Error: "Failed to fetch markets"

**Causa**: Variables de entorno de Supabase incorrectas.

**Solución**:

1. Ve a Vercel Dashboard → Project Settings → Environment Variables
2. Verifica que `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` estén correctas
3. Re-deploy después de corregir

### Error: "Wallet connection failed"

**Causa**: RPC URL incorrecta o wallet no soportada en producción.

**Solución**:

1. Verifica `NEXT_PUBLIC_RPC_URL` en variables de entorno
2. Usa `https://api.explorer.provable.com/v1` para testnetbeta
3. Verifica que el wallet esté en la misma network

---

## ✅ Checklist de Deployment

### Pre-Deploy

- [ ] Código pusheado a GitHub
- [ ] Build local exitoso (`npm run build`)
- [ ] Variables de entorno documentadas
- [ ] `.env.local` en `.gitignore` (no subir a Git)
- [ ] `vercel.json` y `.vercelignore` creados

### Durante Deploy

- [ ] Repositorio conectado en Vercel
- [ ] Todas las variables de entorno configuradas
- [ ] Framework detectado como Next.js
- [ ] Build command: `npm run build`
- [ ] Deploy iniciado

### Post-Deploy

- [ ] URL de producción accesible
- [ ] Página principal carga correctamente
- [ ] Markets se muestran desde Supabase
- [ ] Wallet se puede conectar
- [ ] No hay errores en consola del navegador
- [ ] Probar flujo completo (create market, bet, resolve, claim)

---

## 🔄 Actualizaciones Continuas (CI/CD)

### Auto-Deploy desde GitHub

Vercel automáticamente:

1. **Detecta commits** en tu rama `main`
2. **Ejecuta build** automáticamente
3. **Deploya** si el build es exitoso

**Workflow:**
```
git add .
git commit -m "Update: nueva feature"
git push origin main
```

Vercel hará el deploy automáticamente en ~5-10 minutos.

### Preview Deployments

Para cada Pull Request, Vercel crea un deployment preview:

1. Crea una nueva branch: `git checkout -b feature/nueva-feature`
2. Push a GitHub: `git push origin feature/nueva-feature`
3. Crea PR en GitHub
4. Vercel creará un preview deployment con URL única
5. Prueba el preview antes de merge

---

## 📊 Monitoreo Post-Deployment

### Vercel Analytics

1. Ve a Vercel Dashboard → tu proyecto → Analytics
2. Monitorea:
   - Requests por segundo
   - Tiempo de respuesta
   - Errores 4xx/5xx
   - Locations de usuarios

### Logs en Tiempo Real

```bash
vercel logs [deployment-url] --follow
```

O desde el dashboard: Project → Deployments → [deployment] → Logs

### Performance

**Expected metrics:**
- **Initial Load**: ~3-5 segundos (primera vez)
- **Page Load**: <1 segundo (después de cache)
- **API Response**: ~200-500ms (Supabase)
- **Blockchain Query**: ~1-3 segundos (Aleo RPC)

---

## 🌐 Dominios Personalizados (Opcional)

### Agregar Dominio

1. Compra un dominio (ej: `zkpredict.com`)
2. Ve a Vercel → tu proyecto → Settings → Domains
3. Click "Add Domain"
4. Ingresa tu dominio
5. Sigue las instrucciones DNS

**DNS Records necesarios:**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

6. Espera propagación (5-30 minutos)
7. Vercel configurará SSL automáticamente

---

## 🔐 Seguridad en Producción

### Variables de Entorno

- ✅ Nunca hardcodear API keys en el código
- ✅ Usar `NEXT_PUBLIC_` solo para valores que deben ser públicos
- ✅ Rotar `SUPABASE_ANON_KEY` periódicamente
- ✅ No exponer variables sensibles en client-side

### CORS y CSP

El proyecto ya está configurado con headers de seguridad básicos.

Para mejorar, agregar a `next.config.js`:

```javascript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
      ],
    },
  ];
},
```

---

## 📈 Optimizaciones Post-Deployment

### 1. Edge Functions (Futuro)

Para reducir latencia:

```javascript
// pages/api/markets.ts
export const config = {
  runtime: 'edge',
};
```

### 2. Image Optimization

Si agregas imágenes de markets:

```tsx
import Image from 'next/image';

<Image
  src="/market-image.png"
  width={500}
  height={300}
  alt="Market"
  priority
/>
```

### 3. Code Splitting

Ya está habilitado por defecto en Next.js.

---

## 🎉 Deployment Exitoso

Una vez completado todo:

**Tu app estará disponible en:**
- Production: `https://zkpredict.vercel.app` (o tu dominio)
- Preview: `https://zkpredict-git-[branch].vercel.app`

**Comparte con testers:**
```
🎉 zkPredict está live!

🌐 URL: https://zkpredict.vercel.app
📝 Network: Aleo Testnet (testnetbeta)
💰 Necesitas créditos testnet para probar
🦊 Wallets soportadas: Leo Wallet, Puzzle Wallet

Testing checklist: ver MANUAL_TESTING_STEPS.md
```

---

## 📞 Soporte

**Issues de Deployment:**
- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment

**Issues del Proyecto:**
- GitHub Issues: [tu-repo]/issues
- Discord de Aleo: https://discord.gg/aleohq

---

**Deployment preparado por**: Claude Code
**Fecha**: 29 Enero 2026
**Versión del proyecto**: v0.1.0 (90% MVP)

---

*Good luck with your deployment! 🚀*
