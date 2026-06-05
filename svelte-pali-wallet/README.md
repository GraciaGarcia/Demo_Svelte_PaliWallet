# Svelte + TS + Vite (Pali Wallet DApp)

## 🗄️ Base de Datos PostgreSQL - Historial de Transacciones

Este proyecto guarda automáticamente las transacciones del contrato en una base de datos PostgreSQL (Neon) usando Netlify Functions.

### 📊 Configuración de Base de Datos

**Base de Datos:** Neon PostgreSQL  
**Conexión:**
```
postgresql://neondb_owner:npg_6v5yUDLqJQNf@ep-quiet-surf-a-poert7a-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Tabla:** `transactions`

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

-- Índices para optimizar consultas
CREATE INDEX idx_wallet_address ON transactions(wallet_address);
CREATE INDEX idx_network ON transactions(network);
CREATE INDEX idx_created_at ON transactions(created_at DESC);
```

### 🔧 Arquitectura de Persistencia

```
┌─────────────────────────────────────────────────────────┐
│  Frontend (Netlify)                                     │
│  src/components/views/ContractTransactionsView.svelte  │
│    - Lee transacciones desde blockchain (eventos)      │
│    - Muestra en UI                                      │
│    - Envía a Netlify Function para guardar             │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  Netlify Function (Serverless)                          │
│  netlify/functions/save-transaction.js                  │
│    - Recibe transacción del frontend                    │
│    - Valida datos                                       │
│    - Guarda en PostgreSQL                               │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  PostgreSQL (Neon)                                      │
│  Tabla: transactions                                    │
│    - Almacenamiento persistente                         │
│    - Índices optimizados                                │
│    - Constraint UNIQUE en hash (evita duplicados)       │
└─────────────────────────────────────────────────────────┘
```

### 📁 Archivos Importantes

| Archivo | Propósito |
|---------|-----------|
| `netlify/functions/save-transaction.js` | Función serverless que guarda en PostgreSQL |
| `netlify/functions/package.json` | Dependencia `pg` para PostgreSQL |
| `src/components/views/ContractTransactionsView.svelte` | Lee blockchain y envía a función |
| `netlify.toml` | Configuración de Netlify Functions |

### 🚀 Cómo Funciona

1. **Usuario ve "Transacciones del Contrato"**
   - El componente `ContractTransactionsView.svelte` se carga

2. **Click en "🔄 Actualizar"**
   - Se consultan los eventos del contrato en blockchain
   - Se obtienen: `Deposit`, `Withdrawal`, `Transfer`

3. **Transacciones se procesan**
   ```javascript
   // Ejemplo de transacción procesada
   {
     type: 'Depósito',
     hash: '0x7d5d...3950',
     from: '0x1C06...497B',
     to: '0x1fC9...340F', // Contrato
     amount: '0.2000',
     timestamp: 1717545772000,
     blockNumber: 10992379
   }
   ```

4. **Se guardan en PostgreSQL**
   - Llamada a `/.netlify/functions/save-transaction`
   - Función ejecuta INSERT en PostgreSQL
   - Si `hash` ya existe, se ignora (ON CONFLICT DO NOTHING)

5. **Verificación en BD**
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

### 🔍 Consultas SQL Útiles

**Ver todas las transacciones:**
```sql
SELECT * FROM transactions ORDER BY created_at DESC LIMIT 20;
```

**Transacciones por wallet:**
```sql
SELECT * FROM transactions 
WHERE wallet_address = '0x1c0659e1e59edc901c9e78858f388968274a497b' 
ORDER BY created_at DESC;
```

**Transacciones por red:**
```sql
SELECT network, COUNT(*) as total, SUM(value) as volumen
FROM transactions 
GROUP BY network 
ORDER BY total DESC;
```

**Transacciones del contrato específico:**
```sql
SELECT * FROM transactions 
WHERE from_address = '0x1fc9203ecc40dfc072bd4b087fe70004a1d2340f' 
   OR to_address = '0x1fc9203ecc40dfc072bd4b087fe70004a1d2340f'
ORDER BY created_at DESC;
```

**Volumen total por tipo:**
```sql
SELECT 
  CASE 
    WHEN from_address = '0x1fc9203ecc40dfc072bd4b087fe70004a1d2340f' THEN 'Retiro'
    WHEN to_address = '0x1fc9203ecc40dfc072bd4b087fe70004a1d2340f' THEN 'Depósito'
    ELSE 'Otro'
  END as tipo,
  COUNT(*) as cantidad,
  SUM(value) as total_eth
FROM transactions
GROUP BY tipo;
```

### 🧪 Testing Local

**1. Instalar dependencias de Netlify Functions:**
```bash
cd netlify/functions
npm install
```

**2. Probar localmente con Netlify CLI:**
```bash
npm install -g netlify-cli
netlify dev
```

Esto levantará:
- Frontend en `http://localhost:8888`
- Functions en `http://localhost:8888/.netlify/functions/save-transaction`

**3. Probar la función directamente:**
```bash
curl -X POST http://localhost:8888/.netlify/functions/save-transaction \
  -H "Content-Type: application/json" \
  -d '{
    "hash": "0xtest123",
    "from_address": "0x1C0659e1e59edc901c9e78858f388968274a497b",
    "to_address": "0x1fC9203ECC40dFC072bd4b087FE70004A1D2340F",
    "value": "0.1",
    "network": "Ethereum Sepolia",
    "chain_id": "11155111",
    "wallet_address": "0x1c0659e1e59edc901c9e78858f388968274a497b",
    "status": "success",
    "block_number": 10992379,
    "explorer_url": "https://sepolia.etherscan.io/tx/0xtest123"
  }'
```

### 🌐 Deployment (Netlify)

**Variables de entorno necesarias:**

En Netlify Dashboard → Site settings → Environment variables:

```
DATABASE_URL = postgresql://neondb_owner:npg_6v5yUDLqJQNf@ep-quiet-surf-a-poert7a-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Build settings:**
```
Build command: npm run build
Publish directory: dist
Functions directory: netlify/functions
```

**Despliegue automático:**
- Push a GitHub → Netlify detecta cambios → Build y deploy automático
- Las Netlify Functions se despliegan automáticamente

### 🔐 Seguridad

**Implementado:**
- ✅ Conexión SSL a PostgreSQL
- ✅ CORS habilitado en Netlify Function
- ✅ Constraint UNIQUE previene duplicados
- ✅ Validación básica de campos
- ✅ ON CONFLICT para manejar duplicados

**Recomendaciones futuras:**
- ⚠️ Agregar autenticación (JWT, API key)
- ⚠️ Rate limiting
- ⚠️ Validación más estricta de addresses (checksums)
- ⚠️ Sanitización de inputs

### 📈 Monitoreo

**Logs de Netlify Functions:**
```bash
netlify functions:log save-transaction
```

O en Netlify Dashboard → Functions → save-transaction → Function logs

**Verificar transacciones guardadas:**
```sql
-- Ver últimas transacciones
SELECT 
  hash, 
  value, 
  network, 
  created_at 
FROM transactions 
ORDER BY created_at DESC 
LIMIT 5;

-- Contar transacciones por día
SELECT 
  DATE(created_at) as fecha,
  COUNT(*) as total
FROM transactions 
GROUP BY DATE(created_at)
ORDER BY fecha DESC;
```

### 🐛 Troubleshooting

**Problema:** Las transacciones se muestran pero no se guardan en BD

**Solución:**
1. Verificar en consola del navegador (F12) → Console
2. Buscar mensajes: `✅ Transacción guardada en BD` o `❌ No se pudo guardar`
3. Si hay error de conexión, verificar Netlify Function logs
4. Verificar que `DATABASE_URL` esté configurada en Netlify

**Problema:** Error "Function invocation failed"

**Solución:**
1. Verificar `netlify/functions/package.json` tiene `pg` instalado
2. Re-deploy el sitio para que Netlify instale dependencias
3. Verificar logs: `netlify functions:log save-transaction`

**Problema:** Duplicados en la base de datos

**Solución:**
- No debería pasar gracias a `UNIQUE(hash)`
- Si pasa, verificar que el hash se esté enviando correctamente
- Limpiar duplicados:
```sql
DELETE FROM transactions a USING transactions b
WHERE a.id > b.id AND a.hash = b.hash;
```

### 🔄 Flujo Completo de Datos

```
1. Usuario conecta wallet Pali → Selecciona Ethereum Sepolia
                ↓
2. Va a "Tx Contrato" → Click "🔄 Actualizar"
                ↓
3. Frontend consulta eventos del contrato:
   - contract.queryFilter(depositFilter)
   - contract.queryFilter(withdrawFilter)
   - contract.queryFilter(transferFilter)
                ↓
4. Procesa eventos y formatea datos:
   {type, hash, from, to, amount, timestamp, blockNumber}
                ↓
5. Muestra en UI (lista de transacciones)
                ↓
6. Por cada transacción:
   - fetch('/.netlify/functions/save-transaction', {POST, body: tx})
                ↓
7. Netlify Function recibe:
   - Valida datos
   - pool.query(INSERT INTO transactions...)
   - ON CONFLICT (hash) DO NOTHING
                ↓
8. PostgreSQL guarda:
   - Si hash nuevo → INSERT exitoso
   - Si hash existe → Ignora (no error)
                ↓
9. Verificar en Neon Console:
   SELECT * FROM transactions ORDER BY created_at DESC;
```

---

## Estructura del código

| Ruta | Rol |
|------|-----|
| `src/App.svelte` | Orquestación: estado global, conexión y eventos entre vistas |
| `src/components/layout/` | Barra lateral (`AppSidebar.svelte`) |
| `src/components/views/` | Pantallas informativas (home, conectar, descripción, objetivos, etc.) |
| `src/components/wallet/` | `WalletPanel`, `NetworkSwitcher`, historial de redes y de tx |
| `src/components/transfer/` | Formulario y resumen de transferencia (`TransferView`) |
| `src/components/ui/` | Piezas reutilizables (`ErrorToast`) |
| `src/lib/chains/` | `evmWalletNetworks.ts` (hex + RPC), `networks.ts` (derivado) |
| `src/lib/wallet/` | Detección, listeners, desconexión, **historial de cambios de red** |
| `src/lib/transactions/` | Historial de tx en `localStorage` (`history.ts`) |
| `src/lib/transfers/` | Validación y envío EVM (`prepare.ts`, `evmTransfer.ts`) |
| `src/lib/format/` | Utilidades de texto (`address.ts`) |

### Cumplimiento vs rúbrica (resumen)

| Requisito | Estado |
|-----------|--------|
| Login Web3 con Pali | Sí |
| Cambio de red (zkSYS, Hoodi, Sepolia…) + añadir si no existe | Sí: `NetworkSwitcher` con `wallet_switchEthereumChain` y en **4902** `wallet_addEthereumChain` usando **chainId en hex** y los datos de tu archivo (+ Syscoin NEVM 57). |
| Retirar redes de la DApp | Sí: `removed_networks` en `localStorage` + sección retiradas + **Sincronizar** como en tu código. |
| Historial de tx por red + enlace a explorador | Las tx **enviadas desde la DApp** se guardan por cuenta+red y enlazan a `/tx/...`. **No** se importa aún el historial completo vía API del explorador (requeriría API keys / backend). |
| Historial de **redes** + explorador | Sí: se registra cada cambio real de red y en EVM hay enlace a la base del explorador. |
| Docker / cloud | Sin cambio aquí (ya tienes Dockerfile / compose). |

---

This template should help get you started developing with Svelte and TypeScript in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Svelte](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode).

## Need an official Svelte framework?

Check out [SvelteKit](https://github.com/sveltejs/kit#readme), which is also powered by Vite. Deploy anywhere with its serverless-first approach and adapt to various platforms, with out of the box support for TypeScript, SCSS, and Less, and easily-added support for mdsvex, GraphQL, PostCSS, Tailwind CSS, and more.

## Technical considerations

**Why use this over SvelteKit?**

- It brings its own routing solution which might not be preferable for some users.
- It is first and foremost a framework that just happens to use Vite under the hood, not a Vite app.

This template contains as little as possible to get started with Vite + TypeScript + Svelte, while taking into account the developer experience with regards to HMR and intellisense. It demonstrates capabilities on par with the other `create-vite` templates and is a good starting point for beginners dipping their toes into a Vite + Svelte project.

Should you later need the extended capabilities and extensibility provided by SvelteKit, the template has been structured similarly to SvelteKit so that it is easy to migrate.

**Why `global.d.ts` instead of `compilerOptions.types` inside `jsconfig.json` or `tsconfig.json`?**

Setting `compilerOptions.types` shuts out all other types not explicitly listed in the configuration. Using triple-slash references keeps the default TypeScript setting of accepting type information from the entire workspace, while also adding `svelte` and `vite/client` type information.

**Why include `.vscode/extensions.json`?**

Other templates indirectly recommend extensions via the README, but this file allows VS Code to prompt the user to install the recommended extension upon opening the project.

**Why enable `allowJs` in the TS template?**

While `allowJs: false` would indeed prevent the use of `.js` files in the project, it does not prevent the use of JavaScript syntax in `.svelte` files. In addition, it would force `checkJs: false`, bringing the worst of both worlds: not being able to guarantee the entire codebase is TypeScript, and also having worse typechecking for the existing JavaScript. In addition, there are valid use cases in which a mixed codebase may be relevant.

**Why is HMR not preserving my local component state?**

HMR state preservation comes with a number of gotchas! It has been disabled by default in both `svelte-hmr` and `@sveltejs/vite-plugin-svelte` due to its often surprising behavior. You can read the details [here](https://github.com/rixo/svelte-hmr#svelte-hmr).

If you have state that's important to retain within a component, consider creating an external store which would not be replaced by HMR.

```ts
// store.ts
// An extremely simple external store
import { writable } from 'svelte/store'
export default writable(0)
```
