# Svelte Pali Wallet DApp - Neon PostgreSQL

## 🚀 Inicio Rápido

### Ejecutar Local (2 terminales)

**Terminal 1 - Backend (Node.js + Neon):**
```bash
cd svelte-pali-wallet/server
npm install
npm start
```

**Terminal 2 - Frontend (Svelte):**
```bash
cd svelte-pali-wallet
npm install
npm run dev
```

Abre http://localhost:5173

---

## 🗄️ Base de Datos - Neon PostgreSQL

### Conexión
```bash
psql 'postgresql://neondb_owner:npg_6v5yUDLqJQNf@ep-quiet-surf-apoert7a-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require'
```

### Tabla `transactions`
```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  hash VARCHAR(66) NOT NULL UNIQUE,
  from_address VARCHAR(42) NOT NULL,
  to_address VARCHAR(42) NOT NULL,
  value DECIMAL(20, 8) NOT NULL,
  network VARCHAR(50) NOT NULL,
  chain_id VARCHAR(20) NOT NULL,
  wallet_address VARCHAR(42) NOT NULL,
  status VARCHAR(20) DEFAULT 'success',
  block_number BIGINT,
  explorer_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_wallet_address ON transactions(wallet_address);
CREATE INDEX idx_network ON transactions(network);
CREATE INDEX idx_created_at ON transactions(created_at DESC);
```

---

## 📊 Arquitectura

```
Frontend (Svelte)                Backend (Node.js)           Neon PostgreSQL
http://localhost:5173            http://localhost:3001       Cloud Database
        │                                │                          │
        │ 1. Lee blockchain              │                          │
        │    (ethers.js)                 │                          │
        │                                │                          │
        │ 2. fetch('/api/transactions')  │                          │
        ├──────────────────────────────→ │                          │
        │                                │ 3. INSERT INTO           │
        │                                ├────────────────────────→ │
        │                                │                          │
        │                          4. OK │ ← ON CONFLICT DO NOTHING │
        │ ← 5. Guardado exitoso          │                          │
        │                                │                          │
```

---

## 🔍 Verificar que Funciona

1. **Conectar Wallet:** Abre http://localhost:5173 y conecta Pali Wallet
2. **Seleccionar Red:** Ethereum Sepolia
3. **Ver Transacciones:** Click en "Tx Contrato" → "🔄 Actualizar"
4. **Ver Consola:** F12 → Deberías ver "✅ Transacción guardada en Neon"
5. **Verificar BD:**
   ```sql
   SELECT * FROM transactions ORDER BY created_at DESC LIMIT 5;
   ```

---

## 📝 Consultas SQL Útiles

**Ver todas las transacciones:**
```sql
SELECT * FROM transactions ORDER BY created_at DESC;
```

**Contar transacciones:**
```sql
SELECT COUNT(*) as total FROM transactions;
```

**Por wallet:**
```sql
SELECT * FROM transactions 
WHERE wallet_address = '0x...' 
ORDER BY created_at DESC;
```

**Por red:**
```sql
SELECT network, COUNT(*) as total 
FROM transactions 
GROUP BY network;
```

---

## 📁 Archivos Importantes

| Archivo | Descripción |
|---------|-------------|
| `server/index.js` | Servidor Node.js con conexión a Neon |
| `server/package.json` | Dependencias del servidor (express, pg, cors) |
| `src/lib/api/neon.ts` | Cliente para conectar frontend → backend |
| `src/components/views/ContractTransactionsView.svelte` | Vista de transacciones |
| `EJECUTAR_LOCAL.md` | Guía detallada de ejecución |

---

## 🐛 Solución de Problemas

**❌ Backend no conecta a Neon:**
- Verifica tu conexión a Internet
- Prueba la conexión con `psql` manualmente

**❌ Frontend no conecta al backend:**
- Verifica que el backend esté corriendo en http://localhost:3001
- Abre http://localhost:3001/api/health (debería responder `{"status":"ok"}`)

**❌ CORS error:**
- Ya está configurado en `server/index.js` con `cors()`
- Reinicia ambos servidores

---

## 🔗 Enlaces Útiles

- **Neon Console**: https://console.neon.tech/
- **Contrato (Sepolia)**: https://sepolia.etherscan.io/address/0x1fC9203ECC40dFC072bd4b087FE70004A1D2340F
- **Guía Detallada**: [EJECUTAR_LOCAL.md](./EJECUTAR_LOCAL.md)
