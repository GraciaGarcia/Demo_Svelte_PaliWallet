# 🚀 EJECUTAR PROYECTO LOCAL CON NEON POSTGRESQL

## ⚡ Inicio Rápido (2 pasos)

### 1️⃣ Terminal 1 - Servidor Backend (Node.js + Neon)
```bash
cd svelte-pali-wallet/server
npm install
npm start
```

Deberías ver:
```
🚀 ================================
✅ Servidor corriendo en http://localhost:3001
🗄️  Conectado a Neon PostgreSQL
📡 Endpoints disponibles:
   - POST http://localhost:3001/api/transactions
   - GET  http://localhost:3001/api/transactions/:wallet_address
🚀 ================================
```

### 2️⃣ Terminal 2 - Frontend (Svelte + Vite)
```bash
cd svelte-pali-wallet
npm install
npm run dev
```

Deberías ver:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## 🧪 Probar que Funciona

### Paso 1: Abrir la App
- Ve a http://localhost:5173

### Paso 2: Conectar Wallet
- Conecta tu Pali Wallet
- Asegúrate de estar en **Ethereum Sepolia**

### Paso 3: Ver Transacciones del Contrato
- Click en **"Tx Contrato"** (menú lateral)
- Click en **"🔄 Actualizar"**

### Paso 4: Verificar Consola del Navegador
Abre DevTools (F12) → Consola, deberías ver:
```
💾 Guardando 1 transacciones en Neon PostgreSQL...
✅ Transacción guardada en Neon: 0x7d5d...3950
✅ Proceso de guardado completado
```

### Paso 5: Verificar en la Base de Datos

**Opción A: Neon Console (Web)**
1. Ve a: https://console.neon.tech/
2. Selecciona tu proyecto
3. Click en **"SQL Editor"**
4. Ejecuta:
```sql
SELECT * FROM transactions 
ORDER BY created_at DESC 
LIMIT 10;
```

**Opción B: Terminal con psql**
```bash
psql 'postgresql://neondb_owner:npg_6v5yUDLqJQNf@ep-quiet-surf-apoert7a-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require'
```

Luego ejecuta:
```sql
SELECT hash, from_address, to_address, value, network, created_at 
FROM transactions 
ORDER BY created_at DESC 
LIMIT 5;
```

---

## 📊 Consultas SQL Útiles

### Ver todas las transacciones
```sql
SELECT * FROM transactions ORDER BY created_at DESC;
```

### Contar transacciones
```sql
SELECT COUNT(*) as total FROM transactions;
```

### Transacciones por wallet
```sql
SELECT * FROM transactions 
WHERE wallet_address = '0x1c0659e1e59edc901c9e78858f388968274a497b'
ORDER BY created_at DESC;
```

### Transacciones por red
```sql
SELECT network, COUNT(*) as total 
FROM transactions 
GROUP BY network;
```

### Volumen total
```sql
SELECT 
  network,
  COUNT(*) as cantidad,
  SUM(value::NUMERIC) as total_eth
FROM transactions
GROUP BY network;
```

---

## 🐛 Solución de Problemas

### ❌ Error: "Cannot connect to Neon"
**Causa:** Problema de red o credenciales incorrectas

**Solución:**
1. Verifica tu conexión a Internet
2. Verifica que la URL de conexión sea correcta en `server/index.js`
3. Prueba conectarte manualmente con psql

### ❌ Error: "fetch failed" en el frontend
**Causa:** El servidor backend no está corriendo

**Solución:**
1. Verifica que el servidor esté corriendo en http://localhost:3001
2. Abre http://localhost:3001/api/health en tu navegador
3. Deberías ver: `{"status":"ok","message":"Server running"}`

### ❌ Error: "CORS policy"
**Causa:** Problema de CORS entre frontend y backend

**Solución:**
- Ya está configurado `cors()` en el servidor
- Si persiste, verifica que el frontend esté en http://localhost:5173
- Reinicia ambos servidores

### ❌ Error: "Duplicate key value violates unique constraint"
**Causa:** Intentando guardar una transacción que ya existe

**Solución:**
- Esto es normal y esperado (el código usa `ON CONFLICT DO NOTHING`)
- La transacción ya está guardada, no hay problema

---

## 🔄 Flujo Completo

```
1. Usuario abre http://localhost:5173
          ↓
2. Conecta Pali Wallet → Ethereum Sepolia
          ↓
3. Va a "Tx Contrato" → Click "🔄 Actualizar"
          ↓
4. Frontend consulta blockchain (ethers.js)
   - Lee eventos del contrato
   - Formatea transacciones
          ↓
5. Muestra transacciones en UI
          ↓
6. Por cada transacción:
   fetch('http://localhost:3001/api/transactions', {
     method: 'POST',
     body: JSON.stringify(tx)
   })
          ↓
7. Servidor Node.js recibe request
   - Valida datos
   - Ejecuta INSERT en Neon PostgreSQL
   - ON CONFLICT (hash) DO NOTHING
          ↓
8. Neon PostgreSQL guarda la transacción
   - Si hash es nuevo → INSERT exitoso
   - Si hash existe → Ignora (no error)
          ↓
9. Verificar en Neon Console:
   SELECT * FROM transactions ORDER BY created_at DESC;
```

---

## 📋 Checklist

- [ ] Terminal 1: Servidor corriendo en puerto 3001
- [ ] Terminal 2: Frontend corriendo en puerto 5173
- [ ] Navegador: http://localhost:5173 abre correctamente
- [ ] Pali Wallet conectado en Ethereum Sepolia
- [ ] Vista "Tx Contrato" muestra transacciones
- [ ] Consola muestra "✅ Transacción guardada en Neon"
- [ ] Neon Console muestra datos en tabla transactions

---

## 🎉 ¡Listo!

Si completaste todos los pasos:
- ✅ El servidor está conectado a Neon PostgreSQL
- ✅ El frontend se comunica con el servidor
- ✅ Las transacciones se guardan automáticamente
- ✅ Puedes consultar los datos en Neon Console

**¡Tu sistema está funcionando perfectamente! 🚀**

---

## 📚 Archivos Modificados

- `server/index.js` → Servidor con conexión a Neon
- `src/lib/api/neon.ts` → Cliente para conectar con servidor
- `src/components/views/ContractTransactionsView.svelte` → Usa neon.ts
- `EJECUTAR_LOCAL.md` → Este archivo (instrucciones)

---

## 🔗 Enlaces Útiles

- **Neon Console**: https://console.neon.tech/
- **Frontend Local**: http://localhost:5173
- **Backend Local**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health
- **Contrato (Sepolia)**: https://sepolia.etherscan.io/address/0x1fC9203ECC40dFC072bd4b087FE70004A1D2340F
