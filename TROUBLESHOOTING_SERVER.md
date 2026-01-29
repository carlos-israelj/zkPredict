# 🔧 Troubleshooting - Servidor No Carga

## ⚠️ Problema Identificado

El servidor Next.js está compilando pero tarda mucho tiempo. Esto puede deberse a:

1. El proyecto es grande y la compilación inicial es lenta
2. Falta `yarn` y el script `npm run dev` intenta usarlo
3. Los node_modules necesitan limpieza

---

## ✅ Solución Rápida (Recomendada)

### Paso 1: Limpiar y Reiniciar

```bash
# Detener todos los procesos Next.js
pkill -f "next dev"

# Limpiar cache
rm -rf .next node_modules/.cache

# Iniciar servidor directamente (sin yarn)
npx next dev
```

### Paso 2: Esperar la Compilación Inicial

La primera compilación puede tardar **2-5 minutos**. Verás:

```
▲ Next.js 15.2.4
- Local:        http://localhost:3000

✓ Ready in 180s
```

### Paso 3: Verificar

Abre tu navegador en: **http://localhost:3000**

---

## 🐛 Problema: Yarn No Encontrado

### Síntoma:
```
sh: 1: yarn: not found
```

### Solución A: Instalar Yarn
```bash
npm install -g yarn
```

### Solución B: Ejecutar sin Yarn (Más Rápido)
```bash
npx next dev
```

---

## 🐛 Problema: Puerto 3000 Ocupado

### Síntoma:
```
Error: Port 3000 is already in use
```

### Solución:
```bash
# Matar proceso en puerto 3000
lsof -ti:3000 | xargs kill -9

# O usar otro puerto
npx next dev -p 3001
```

---

## 🐛 Problema: Compilación Muy Lenta

### Causas Comunes:
1. **Archivos grandes**: CSS o node_modules grandes
2. **TypeScript errors**: Errores que bloquean la compilación
3. **Memory issues**: Falta de RAM

### Solución 1: Usar Turbopack (Más Rápido)
```bash
npx next dev --turbopack
```

### Solución 2: Verificar Errores TypeScript
```bash
npm run ts
```

Si hay errores críticos, arreglarlos primero.

### Solución 3: Aumentar Memoria
```bash
NODE_OPTIONS='--max-old-space-size=4096' npx next dev
```

---

## 🚀 Método Alternativo: Build de Producción

Si el modo dev es muy lento, puedes hacer un build de producción:

```bash
# 1. Build
npm run build

# 2. Start production server
npm start
```

**Nota**: Este método es más rápido pero no tiene hot-reload.

---

## 📊 Verificar Estado del Servidor

### Comando 1: Ver Procesos Next.js
```bash
ps aux | grep next | grep -v grep
```

**Esperado**: Deberías ver procesos de `next dev` o `next-server`

### Comando 2: Ver Logs en Tiempo Real
```bash
# Si iniciaste con log redirect:
tail -f /tmp/next-dev.log
```

### Comando 3: Test de Conexión
```bash
curl http://localhost:3000
```

**Esperado**: HTML de la página o "Compiling..."

---

## 🔍 Diagnóstico Avanzado

### Ver Qué Está Compilando
```bash
ls -lh .next/cache/webpack/
```

### Ver Errores de Build
```bash
cat .next/trace | grep "error" | tail -20
```

### Verificar Dependencias
```bash
npm list --depth=0 | grep "UNMET"
```

Si hay dependencias faltantes:
```bash
npm install
```

---

## ✅ Checklist de Verificación

Antes de reportar un bug, verifica:

- [ ] Node.js versión >= 18 (`node --version`)
- [ ] npm funciona (`npm --version`)
- [ ] node_modules existe (`ls node_modules | wc -l`)
- [ ] No hay errores TypeScript críticos (`npm run ts`)
- [ ] Puerto 3000 no está ocupado (`lsof -ti:3000`)
- [ ] Esperaste al menos 3 minutos para la compilación inicial

---

## 🆘 Si Nada Funciona

### Opción 1: Reinstalar Dependencias
```bash
# Limpiar todo
rm -rf node_modules .next package-lock.json

# Reinstalar
npm install

# Reiniciar
npx next dev
```

### Opción 2: Modo Producción
```bash
npm run build && npm start
```

### Opción 3: Verificar con Build Info
```bash
npm run build 2>&1 | tee build.log
```

Revisa `build.log` para errores específicos.

---

## 💡 Tips para Desarrollo

### Desarrollo más Rápido:
1. **Usar Turbopack**: `npx next dev --turbopack`
2. **Disable telemetry**: `npx next telemetry disable`
3. **Skip type checking durante dev**: Comentar `typescript: true` en `next.config.js`

### Monitorear Performance:
```bash
# Ver uso de memoria
watch -n 1 'ps aux | grep next'
```

---

## 📝 Estado Actual (29 Enero 2026)

**Problema**: Servidor Next.js está compilando pero tarda demasiado
**Causa**: Primera compilación después de nuevos componentes (ResolveMarket, ClaimWinnings)
**Solución Aplicada**: Reinicio con `npx next dev --turbopack`
**Tiempo Estimado**: 2-5 minutos para completar

### Qué Estás Esperando:
```
▲ Next.js 15.2.4
- Local:        http://localhost:3000

○ Compiling / ...
✓ Compiled / in 5s
✓ Compiled /_error in 2s
✓ Compiled /markets/[id] in 8s
✓ Ready in 180s
```

---

## 🎯 Próximos Pasos

Una vez que el servidor cargue:

1. **Abre**: http://localhost:3000
2. **Sigue**: `START_TESTING.md` para el testing
3. **Usa**: `TESTING_CHECKLIST.md` para documentar

---

**¿Servidor ya cargó?** → Ve a `START_TESTING.md`
**¿Aún no carga?** → Espera 2-3 minutos más y verifica con `curl http://localhost:3000`

---

*Última actualización: 29 Enero 2026*
