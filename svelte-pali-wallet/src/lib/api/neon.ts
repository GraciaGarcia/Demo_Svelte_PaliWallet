/**
 * Cliente para guardar transacciones en Neon PostgreSQL
 * Utiliza servidor Node.js local como intermediario
 */

const API_URL = 'http://localhost:3001/api'

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
 * Guarda una transacción en Neon PostgreSQL
 */
export async function saveTransactionToNeon(tx: Transaction): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hash: tx.hash,
        from_address: tx.from_address.toLowerCase(),
        to_address: tx.to_address.toLowerCase(),
        value: tx.value,
        network: tx.network,
        chain_id: tx.chain_id,
        wallet_address: tx.wallet_address.toLowerCase(),
        status: tx.status || 'success',
        block_number: tx.block_number || null,
        explorer_url: tx.explorer_url || null
      })
    })

    if (response.ok) {
      const data = await response.json()
      console.log('✅ Transacción guardada en Neon:', tx.hash)
      return true
    } else {
      const error = await response.text()
      console.error('❌ Error guardando en Neon:', error)
      return false
    }
  } catch (error) {
    console.error('❌ Error de conexión con servidor:', error)
    return false
  }
}

/**
 * Obtiene transacciones de un wallet desde Neon PostgreSQL
 */
export async function getTransactionsFromNeon(
  walletAddress: string
): Promise<Transaction[]> {
  try {
    const response = await fetch(`${API_URL}/transactions/${walletAddress.toLowerCase()}`)

    if (response.ok) {
      const data = await response.json()
      return data.data || []
    }
    return []
  } catch (error) {
    console.error('Error obteniendo transacciones:', error)
    return []
  }
}
