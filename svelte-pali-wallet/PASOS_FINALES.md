# ✅ PASOS FINALES PARA COMPLETAR LA CONFIGURACIÓN

## 🔗 Enlaces Rápidos
- **Base de Datos**: https://supabase.com/dashboard/project/tyrlsmxwnzwdvrducobv
- **Tabla Transactions**: https://supabase.com/dashboard/project/tyrlsmxwnzwdvrducobv/editor
- **SQL Editor**: https://supabase.com/dashboard/project/tyrlsmxwnzwdvrducobv/sql

---

## 1️⃣ Configurar Variables en Netlify (OBLIGATORIO - 3 minutos)

### Paso A: Ir a Environment Variables
1. Abre tu sitio en **Netlify Dashboard**
2. Click en **"Site settings"**
3. En el menú izquierdo, click en **"Environment variables"**

### Paso B: Agregar Primera Variable
1. Click en **"Add a variable"** → **"Add a single variable"**
2. Completa:
   - **Key**: `VITE_SUPABASE_URL`
   - **Value**: `https://tyrlsmxwnzwdvrducobv.supabase.co`
   - **Scopes**: Marca "All" o al menos "Production"
3. Click **"Create variable"**

### Paso C: Agregar Segunda Variable  
1. Click en **"Add a variable"** → **"Add a single variable"**
2. Completa:
   - **Key**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: `sb_publishable_7l2PId3qBh8Ksi_1fckNWw_jg_HxnGl`
   - **Scopes**: Marca "All" o al menos "Production"
3. Click **"Create variable"**

### Paso D: Re-deploy el Sitio
1. Ve a la pestaña **"Deploys"** en Netlify
2. Click en **"Trigger deploy"** →  **"Deploy site"**
3. **IMPORTANTE**: Espera 2-3 minutos a que el deploy termine
4. Verifica que el estado sea **"Published"** (verde)

---

## 2️⃣ Verificar que Todo Funciona (2 minutos)

### Paso A: Probar la App
1. Abre tu app en el navegador (tu URL de Netlify)
2. Conecta tu wallet Pali
3. Asegúrate de estar en **Ethereum Sepolia**
4. Ve a **"Tx Contrato"** (en el menú lateral izquierdo)
5. Click en el botón **"🔄 Actualizar"**

### Paso B: Verificar Consola del Navegador
1. Presiona **F12** para abrir DevTools
2. Ve a la pestaña **"Console"**
3. Deberías ver mensajes como:
   ```
   💾 Guardando 1 transacciones en Supabase...
   ✅ Transacción guardada: 0x7d5d...3950
   ✅ Proceso de guardado completado
   ```

**Si ves errores:**
- ❌ `401 Unauthorized` → Verifica la API Key en Netlify
- ❌ `Failed to fetch` → Verifica la URL en Netlify
- ❌ `Network error` → Re-deploya el sitio

### Paso C: Verificar en Supabase
1. Abre: https://supabase.com/dashboard/project/tyrlsmxwnzwdvrducobv/editor
2. Click en la tabla **"transactions"** (menú izquierdo)
3. Deberías ver las transacciones guardadas
4. Cada fila tendrá: `hash`, `from_address`, `to_address`, `value`, `network`, etc.

---

## 3️⃣ Consultas SQL para Verificar

Abre el SQL Editor: https://supabase.com/dashboard/project/tyrlsmxwnzwdvrducobv/sql

### Ver todas las transacciones:
```sql
SELECT * FROM transactions 
ORDER BY created_at DESC 
LIMIT 10;
```

### Contar transacciones:
```sql
SELECT COUNT(*) as total FROM transactions;
```

### Ver por wallet:
```sql
SELECT * FROM transactions 
WHERE wallet_address = '0x1c0659e1e59edc901c9e78858f388968274a497b'
ORDER BY created_at DESC;
```

### Ver por red:
```sql
SELECT network, COUNT(*) as total 
FROM transactions 
GROUP BY network;
```

---

## ✅ Checklist Final

- [ ] Variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` agregadas en Netlify
- [ ] Sitio re-deployado después de agregar variables
- [ ] Build de Netlify exitoso (Published)
- [ ] App abre correctamente
- [ ] Wallet conectado en Sepolia
- [ ] Vista "Tx Contrato" muestra transacciones
- [ ] Consola muestra "✅ Transacción guardada"
- [ ] Supabase Table Editor muestra datos

---

## 🐛 Solución de Problemas

### "No se guardan las transacciones"

**Causa 1: Variables no configuradas**
1. Verifica en Netlify → Site settings → Environment variables
2. Deben existir `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
3. Re-deploya el sitio

**Causa 2: Variables agregadas DESPUÉS del build**
- Las variables deben existir ANTES del build
- Si las agregaste después, debes hacer **Trigger deploy** de nuevo

**Causa 3: Consola muestra errores**
- Abre F12 → Console
- Si ves error 401 → API Key incorrecta
- Si ves error 404 → URL incorrecta
- Si ves CORS → Verifica RLS policies en Supabase

### Verificar RLS Policies

Si persiste el problema:
1. Ve a: https://supabase.com/dashboard/project/tyrlsmxwnzwdvrducobv/auth/policies
2. Verifica que existan estas policies para la tabla `transactions`:
   - ✅ "Allow public insert" - Activa
   - ✅ "Allow public select" - Activa

---

## 🎉 ¡Listo!

Si completaste todos los pasos y:
- ✅ La consola muestra "✅ Transacción guardada"
- ✅ Supabase muestra las transacciones

**¡Tu sistema está funcionando perfectamente!** 🚀

Ahora cada vez que alguien use el contrato y vea las transacciones, se guardarán automáticamente en tu base de datos Supabase.
