# 🚀 DESPLIEGUE RÁPIDO - 5 MINUTOS

## MÉTODO MÁS RÁPIDO: Vercel (Sin instalar nada)

### Paso 1: Sube tu código a GitHub

```bash
# Si aún no tienes un repositorio, créalo:
git init
git add .
git commit -m "Initial commit - Pali Wallet DApp"

# Crea un repositorio en GitHub y luego:
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git branch -M main
git push -u origin main
```

### Paso 2: Despliega en Vercel

1. Ve a: **https://vercel.com/new**
2. Haz clic en **"Continue with GitHub"**
3. Autoriza a Vercel
4. Selecciona tu repositorio
5. Haz clic en **"Deploy"**
6. ¡Espera 2 minutos y listo! 🎉

Tu URL será algo como: `https://pali-wallet-dapp.vercel.app`

---

## ALTERNATIVA: Netlify Drop (Aún más rápido - Sin GitHub)

### Paso 1: Construye el proyecto

```bash
npm run build
```

### Paso 2: Arrastra y suelta

1. Ve a: **https://app.netlify.com/drop**
2. Arrastra la carpeta **`dist`** a la página
3. ¡Listo en 30 segundos! 🎉

Tu URL será algo como: `https://random-name-123.netlify.app`

Puedes cambiar el nombre después en la configuración.

---

## SOLUCIÓN DE PROBLEMAS

### Error: "Build failed"
```bash
# Verifica que el build funcione localmente:
npm run build

# Si hay errores, corrígelos primero
```

### Error: "Module not found"
```bash
# Asegúrate de que todas las dependencias estén instaladas:
npm install

# Y que estén en package.json (no solo en node_modules)
```

### La página carga pero está en blanco
- Verifica que el archivo `index.html` esté en la carpeta `dist`
- Revisa la consola del navegador (F12) para ver errores

---

## 🎯 RECOMENDACIÓN FINAL

**Para presentar tu proyecto:**
1. Usa **Vercel** (más profesional, URL bonita)
2. Comparte el enlace: `https://tu-proyecto.vercel.app`
3. Cada vez que hagas `git push`, se actualizará automáticamente

**Para pruebas rápidas:**
1. Usa **Netlify Drop** (sin necesidad de GitHub)
2. Perfecto para demos rápidos

---

## 📱 COMPARTIR TU PROYECTO

Una vez desplegado, puedes compartir:
- **URL directa**: `https://tu-proyecto.vercel.app`
- **QR Code**: Genera uno en https://qr-code-generator.com
- **Embed**: Puedes embeber tu DApp en otras páginas

¡Tu proyecto estará accesible desde cualquier dispositivo con internet! 🌍
