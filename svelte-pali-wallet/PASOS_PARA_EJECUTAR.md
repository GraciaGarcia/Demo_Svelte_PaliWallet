# ⚡ EJECUTAR PROYECTO LOCAL - PASOS EXACTOS

## 📋 Requisitos Previos
- Node.js instalado (v16 o superior)
- Pali Wallet instalado en tu navegador
- Tener algunas transacciones en tu contrato

---

## 🚀 PASO 1: Terminal 1 - Iniciar Backend

Abre una terminal y ejecuta:

```bash
cd svelte-pali-wallet/server
npm install
npm start
```

**Deberías ver algo como esto:**
```
🚀 ================================
✅ Servidor corriendo en http://localhost:3001
🗄️  Conectado a Neon PostgreSQL
📡 Endpoints disponibles:
   - POST http://localhost:3001/api/transactions
   - GET  http://localhost:3001/api/transactions/:wallet_address
🚀 ================================
```

**Si ves ✅ "Conectado a Neon PostgreSQL"** → El backend está listo!

**Si ves ❌ error de conexión:**
- Verifica tu conexión a Internet
- Verifica que la URL de Neon sea correcta en `server/index.js`

---

## 🚀 PASO 2: Terminal 2 - Iniciar Frontend

**NO CIERRES LA TERMINAL 1**, abre una SEGUNDA terminal y ejecuta:

```bash
cd svelte-pali-wallet
npm install
npm run dev
```

**Deberías ver algo como esto:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

---

## 🧪 PASO 3: Probar en el Navegador

### A. Abrir la App
1. Abre http://localhost:5173 en tu navegador

### B. Conectar Pali Wallet
2. Click en **"Conectar Wallet"**
3. Autoriza la conexión en Pali Wallet
4. **IMPORTANTE:** Asegúrate de estar en **Ethereum Sepolia**

### C. Ver Transacciones del Contrato
5. En el menú lateral izquierdo, click en **"Tx Contrato"**
6. Click en el botón **"🔄 Actualizar"**

### D. Verificar en la Consola
7. Presiona **F12** para abrir DevTools
8. Ve a la pestaña **"Console"**

**Deberías ver:**
```javascript
💾 Guardando 1 transacciones en Neon PostgreSQL...
✅ Transacción guardada en Neon: 0x7d5d...3950
✅ Proceso de guardado completado
```

---

## 🗄️ PASO 4: Verificar en la Base de Datos

### Opción A: Neon Console (Web - RECOMENDADO)

1. Ve a: https://console.neon.tech/
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto
4. Click en **"SQL Editor"** (menú lateral)
5. Pega esta consulta:

```sql
SELECT 
  hash, 
  from_address, 
  to_address, 
  value, 
  network, 
  created_at 
FROM transactions 
ORDER BY created_at DESC 
LIMIT 10;
```

6. Click en **"Run"** o presiona **Ctrl+Enter**

**Deberías ver tus transacciones listadas** ✅

### Opción B: Terminal con psql

Abre una tercera terminal y ejecuta:

```bash
psql 'postgresql://neondb_owner:npg_6v5yUDLqJQNf@ep-quiet-surf-apoert7a-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require'
```

Luego ejecuta:
```sql
SELECT * FROM transactions ORDER BY created_at DESC LIMIT 5;
```

---

## ✅ Checklist Final

- [ ] Terminal 1: Servidor corriendo (puerto 3001) ✅ "Conectado a Neon"
- [ ] Terminal 2: Frontend corriendo (puerto 5173)
- [ ] Navegador: http://localhost:5173 abre correctamente
- [ ] Pali Wallet: Conectado y en Ethereum Sepolia
- [ ] Vista "Tx Contrato": Muestra transacciones
- [ ] Consola del navegador: Muestra "✅ Transacción guardada"
- [ ] Base de datos: Neon Console muestra datos

---

## 🎉 ¡Todo Funciona!

Si completaste todos los pasos y todos tienen ✅:

**¡Tu sistema está funcionando perfectamente!** 🚀

Ahora cada vez que alguien use el contrato y actualices la vista, las transacciones se guardarán automáticamente en tu base de datos Neon PostgreSQL.

---

## 🐛 Problemas Comunes

### ❌ "Cannot find module 'express'"

**Solución:**
```bash
cd svelte-pali-wallet/server
npm install
```

### ❌ "Port 3001 is already in use"

**Solución:**
El puerto ya está ocupado. Cierra el proceso que lo está usando o cambia el puerto en `server/index.js`:
```javascript
const PORT = process.env.PORT || 3002; // Cambiar a 3002
```

Y en `src/lib/api/neon.ts`:
```typescript
const API_URL = 'http://localhost:3002/api' // Cambiar a 3002
```

### ❌ Frontend dice "fetch failed"

**Causa:** El backend no está corriendo

**Solución:**
1. Verifica que Terminal 1 esté corriendo
2. Abre http://localhost:3001/api/health
3. Deberías ver: `{"status":"ok","message":"Server running"}`

### ❌ "NetworkError when attempting to fetch resource"

**Causa:** Problema de CORS o el backend no está accesible

**Solución:**
1. Reinicia ambos servidores (Terminal 1 y 2)
2. Verifica que `cors()` esté en `server/index.js`
3. Limpia la caché del navegador (Ctrl+Shift+Delete)

---

## 📚 Archivos Clave

| Archivo | Para Qué Sirve |
|---------|----------------|
| `server/index.js` | Backend que conecta a Neon PostgreSQL |
| `server/package.json` | Dependencias del backend |
| `src/lib/api/neon.ts` | Cliente que conecta frontend con backend |
| `src/components/views/ContractTransactionsView.svelte` | Vista de transacciones |

---

## 🔗 Enlaces Útiles

- **Neon Console**: https://console.neon.tech/
- **Frontend Local**: http://localhost:5173
- **Backend Local**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health
- **Contrato (Sepolia)**: https://sepolia.etherscan.io/address/0x1fC9203ECC40dFC072bd4b087FE70004A1D2340F

---

## 💡 Siguiente Paso

Una vez que todo funcione local, si quieres deployar a producción, necesitarás:
1. Hostear el backend en algún servicio (Railway, Render, Heroku, etc.)
2. Actualizar la URL en `src/lib/api/neon.ts` con la URL del backend en producción
3. Deployar el frontend a Netlify con la nueva URL del backend

¡Pero eso es para después! Primero asegúrate de que todo funcione local. 🚀
