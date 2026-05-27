# 🚀 Guía de Despliegue - Pali Wallet DApp

## OPCIÓN 1: Vercel (Recomendado - Más Fácil) ⭐

### Pasos:

1. **Crear cuenta en Vercel**
   - Ve a: https://vercel.com
   - Haz clic en "Sign Up"
   - Regístrate con GitHub, GitLab o email

2. **Instalar Vercel CLI** (opcional pero recomendado)
   ```bash
   npm install -g vercel
   ```

3. **Desplegar desde la terminal**
   ```bash
   cd svelte-pali-wallet
   vercel
   ```
   - Sigue las instrucciones en pantalla
   - Acepta los valores por defecto
   - ¡Listo! Te dará una URL como: `https://tu-proyecto.vercel.app`

4. **O desplegar desde la web**
   - Ve a: https://vercel.com/new
   - Conecta tu repositorio de GitHub
   - Vercel detectará automáticamente que es un proyecto Vite
   - Haz clic en "Deploy"
   - ¡Listo en 2 minutos!

### Ventajas:
- ✅ Gratis para siempre
- ✅ HTTPS automático
- ✅ Despliegue en 2 minutos
- ✅ Actualizaciones automáticas con cada push a GitHub
- ✅ CDN global (súper rápido)

---

## OPCIÓN 2: Netlify (También Muy Fácil)

### Pasos:

1. **Crear cuenta en Netlify**
   - Ve a: https://netlify.com
   - Regístrate con GitHub o email

2. **Desplegar arrastrando carpeta**
   - Construye el proyecto localmente:
     ```bash
     npm run build
     ```
   - Ve a: https://app.netlify.com/drop
   - Arrastra la carpeta `dist` a la página
   - ¡Listo! Te dará una URL como: `https://tu-proyecto.netlify.app`

3. **O desplegar desde GitHub**
   - Ve a: https://app.netlify.com/start
   - Conecta tu repositorio
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Haz clic en "Deploy"

### Ventajas:
- ✅ Gratis
- ✅ Muy fácil de usar
- ✅ Drag & drop deployment
- ✅ HTTPS automático

---

## OPCIÓN 3: Railway (Ya Configurado en tu Proyecto)

### Pasos:

1. **Crear cuenta en Railway**
   - Ve a: https://railway.app
   - Regístrate con GitHub

2. **Crear nuevo proyecto**
   - Haz clic en "New Project"
   - Selecciona "Deploy from GitHub repo"
   - Elige tu repositorio

3. **Railway detectará automáticamente:**
   - El `Dockerfile`
   - El `railway.toml`
   - Configurará todo automáticamente

4. **Obtener URL**
   - Ve a Settings → Domains
   - Genera un dominio público
   - URL: `https://tu-proyecto.up.railway.app`

### Ventajas:
- ✅ Soporta Docker
- ✅ $5 de crédito gratis al mes
- ✅ Configuración ya lista en tu proyecto

---

## OPCIÓN 4: GitHub Pages (Gratis y Simple)

### Pasos:

1. **Instalar gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Agregar scripts en package.json**
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. **Configurar base en vite.config.js**
   ```javascript
   export default {
     base: '/nombre-de-tu-repo/'
   }
   ```

4. **Desplegar**
   ```bash
   npm run deploy
   ```

5. **Activar GitHub Pages**
   - Ve a tu repositorio en GitHub
   - Settings → Pages
   - Source: gh-pages branch
   - URL: `https://tu-usuario.github.io/nombre-repo/`

### Ventajas:
- ✅ Completamente gratis
- ✅ Integrado con GitHub
- ✅ Fácil de actualizar

---

## OPCIÓN 5: Render (Alternativa a Railway)

### Pasos:

1. **Crear cuenta en Render**
   - Ve a: https://render.com
   - Regístrate con GitHub

2. **Crear Web Service**
   - New → Static Site
   - Conecta tu repositorio
   - Build Command: `npm run build`
   - Publish Directory: `dist`

3. **Desplegar**
   - Haz clic en "Create Static Site"
   - URL: `https://tu-proyecto.onrender.com`

### Ventajas:
- ✅ Gratis para sitios estáticos
- ✅ HTTPS automático
- ✅ Fácil configuración

---

## 📋 COMPARACIÓN RÁPIDA

| Plataforma | Precio | Facilidad | Velocidad | Docker |
|------------|--------|-----------|-----------|--------|
| **Vercel** | Gratis | ⭐⭐⭐⭐⭐ | Muy rápido | No |
| **Netlify** | Gratis | ⭐⭐⭐⭐⭐ | Muy rápido | No |
| **Railway** | $5/mes gratis | ⭐⭐⭐⭐ | Rápido | Sí |
| **GitHub Pages** | Gratis | ⭐⭐⭐ | Rápido | No |
| **Render** | Gratis | ⭐⭐⭐⭐ | Rápido | Sí |

---

## 🎯 MI RECOMENDACIÓN

Para tu proyecto, te recomiendo **Vercel** porque:
1. Es el más fácil y rápido
2. Gratis para siempre
3. Perfecto para aplicaciones Svelte/Vite
4. Te da una URL bonita automáticamente
5. Actualizaciones automáticas con cada push

---

## 🔧 PREPARACIÓN ANTES DE DESPLEGAR

1. **Asegúrate de que el proyecto compile sin errores**
   ```bash
   npm run build
   ```

2. **Prueba el build localmente**
   ```bash
   npm install -g serve
   serve -s dist
   ```

3. **Sube tu código a GitHub** (si aún no lo has hecho)
   ```bash
   git add .
   git commit -m "Preparar para despliegue"
   git push origin main
   ```

---

## 📞 SOPORTE

Si tienes problemas con el despliegue, revisa:
- Los logs de build en la plataforma
- Que todas las dependencias estén en `package.json`
- Que el comando `npm run build` funcione localmente

¡Buena suerte con tu despliegue! 🚀
