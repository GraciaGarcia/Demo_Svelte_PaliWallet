/**
 * Cliente de Supabase para guardar transacciones
 * Supabase proporciona una API REST automática sobre PostgreSQL
 */

// Configuración de Supabase
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://tyrlsmxwnzwdvrducobv.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_7l2PId3qBh8Ksi_1fckNWw_jg_HxnGl'

export type Transaction = {
  hash: string
  from_address: string
  to_address: string
  value: string
  network: string
  chain_id: string
  wallet_address: string
  status?: string
  block_number?: number
  explorer_url?: string
}

/**
 * Guarda una transacción en Supabase
 */
export async function saveTransactionToSupabase(tx: Transaction): Promise<boolean> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/transactions`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=ignore-duplicates' // Ignora duplicados por hash único
      },
      body: JSON.stringify({
        hash: tx.hash,
        from_address: tx.from_address,
        to_address: tx.to_address,
        value: tx.value,
        network: tx.network,
        chain_id: tx.chain_id,
        wallet_address: tx.wallet_address.toLowerCase(),
        status: tx.status || 'success',
        block_number: tx.block_number || null,
        explorer_url: tx.explorer_url || null
      })
    })

    if (response.ok || response.status === 409) {
      // 200 = guardado exitoso, 409 = ya existe (por UNIQUE constraint)
      console.log('✅ Transacción guardada:', tx.hash)
      return true
    } else {
      const error = await response.text()
      console.error('❌ Error guardando en Supabase:', error)
      return false
    }
  } catch (error) {
    console.error('❌ Error de conexión con Supabase:', error)
    return false
  }
}

/**
 * Obtiene transacciones de un wallet desde Supabase
 */
export async function getTransactionsFromSupabase(
  walletAddress: string,
  network?: string
): Promise<Transaction[]> {
  try {
    let url = `${SUPABASE_URL}/rest/v1/transactions?wallet_address=eq.${walletAddress.toLowerCase()}&order=created_at.desc&limit=100`
    
    if (network) {
      url += `&network=eq.${network}`
    }

    const response = await fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    })

    if (response.ok) {
      return await response.json()
    }
    return []
  } catch (error) {
    console.error('Error obteniendo transacciones:', error)
    return []
  }
}
