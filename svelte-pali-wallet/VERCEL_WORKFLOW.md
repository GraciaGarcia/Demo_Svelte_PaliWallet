# 🔄 Flujo de Trabajo con Vercel

## CONFIGURACIÓN INICIAL (Solo una vez)

### 1. Sube tu código a GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU-USUARIO/pali-wallet-dapp.git
git push -u origin main
```

### 2. Conecta con Vercel
1. Ve a: https://vercel.com/new
2. Importa tu repositorio de GitHub
3. Vercel detecta automáticamente la configuración
4. Haz clic en "Deploy"
5. ¡Listo! Tu sitio está en línea

---

## FLUJO DIARIO (Cada vez que hagas cambios)

### Opción A: Despliegue Automático (Recomendado)

```bash
# 1. Haces cambios en tu código
# Editas archivos...

# 2. Pruebas localmente
npm run dev
# Verifica que todo funcione

# 3. Commiteas y subes
git add .
git commit -m "Descripción de tus cambios"
git push origin main

# 4. ¡Vercel despliega automáticamente!
# Recibirás un email cuando esté listo (1-2 minutos)
```

### Opción B: Despliegue Manual desde CLI

```bash
# Instala Vercel CLI (solo una vez)
npm install -g vercel

# Despliega cuando quieras
vercel --prod

# Vercel construye y despliega inmediatamente
```

---

## 📊 MONITOREO DE DESPLIEGUES

### Ver el estado de tus despliegues:

1. **Dashboard de Vercel**
   - Ve a: https://vercel.com/dashboard
   - Verás todos tus proyectos y despliegues

2. **Logs en tiempo real**
   - Haz clic en cualquier despliegue
   - Ve los logs completos del build
   - Identifica errores fácilmente

3. **Notificaciones por email**
   - ✅ Deployment Ready
   - ❌ Deployment Failed (con detalles del error)

---

## 🌿 TRABAJAR CON RAMAS

### Desarrollo en ramas separadas:

```bash
# Crear rama de desarrollo
git checkout -b desarrollo

# Hacer cambios
# Editar archivos...

# Commitear y subir
git add .
git commit -m "Nueva funcionalidad"
git push origin desarrollo

# Vercel crea un preview automático:
# https://tu-proyecto-git-desarrollo-tu-usuario.vercel.app
```

### Ventajas:
- **Rama main**: Sitio de producción (público)
- **Otras ramas**: Previews para probar (puedes compartir el link)
- **Pull Requests**: Vercel comenta con el link del preview

---

## 🚨 SOLUCIÓN DE PROBLEMAS

### Si el despliegue falla:

1. **Revisa los logs en Vercel**
   - Dashboard → Tu proyecto → Deployments → Click en el fallido
   - Lee el error en los logs

2. **Prueba el build localmente**
   ```bash
   npm run build
   ```
   - Si falla localmente, corrígelo antes de hacer push

3. **Errores comunes:**
   - **"Module not found"**: Falta una dependencia en `package.json`
   - **"Build failed"**: Error de sintaxis en el código
   - **"Out of memory"**: Proyecto muy grande (poco común)

### Rollback (volver a versión anterior):

1. Ve a Dashboard → Deployments
2. Encuentra el despliegue que funcionaba
3. Click en "..." → "Promote to Production"
4. ¡Tu sitio vuelve a la versión anterior!

---

## ⚙️ CONFIGURACIÓN AVANZADA

### Variables de entorno:

Si necesitas variables de entorno (API keys, etc.):

1. Dashboard → Settings → Environment Variables
2. Agrega tus variables
3. Vercel las inyecta automáticamente en el build

### Dominios personalizados:

1. Dashboard → Settings → Domains
2. Agrega tu dominio personalizado
3. Configura los DNS según las instrucciones
4. Tu sitio estará en: `https://tu-dominio.com`

---

## 📈 ESTADÍSTICAS

Vercel te muestra:
- 📊 Número de visitas
- ⚡ Tiempo de carga
- 🌍 Ubicación de tus usuarios
- 📱 Dispositivos usados

---

## 🎯 RESUMEN

### Flujo típico:

```
Código local → git push → GitHub → Vercel detecta → Build → Deploy → ✅ Sitio actualizado
```

### Tiempo total: **1-2 minutos** desde el push hasta que el sitio está actualizado

### Sin hacer nada extra:
- ✅ Despliegue automático
- ✅ HTTPS gratis
- ✅ CDN global
- ✅ Previews de ramas
- ✅ Rollback fácil
- ✅ Notificaciones

---

## 🔗 ENLACES ÚTILES

- **Dashboard**: https://vercel.com/dashboard
- **Documentación**: https://vercel.com/docs
- **Status**: https://vercel-status.com
- **Soporte**: https://vercel.com/support

¡Disfruta de tu despliegue automático! 🚀
