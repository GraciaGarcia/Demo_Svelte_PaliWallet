import { getBlockExplorerTxUrl } from '../chains/networks'
import { fetchAllTransactions } from '../api/etherscan'

export type StoredTx = {
  hash: string
  from: string
  to: string
  value: string
  network: string
  chainId: string
  status: string
  blockNumber?: number
  explorerUrl?: string | null
  timestamp: number
  date: string
  time: string
  isOutgoing: boolean
  type?: 'normal' | 'internal' | 'contract' // Tipo de transacción
}

export function historyStorageKey(address: string, currentNetwork: string): string {
  return `transactions_${address.toLowerCase()}_${currentNetwork}`
}

export function loadTransactionsFromStorage(
  address: string,
  currentNetwork: string
): { list: StoredTx[]; error?: string } {
  try {
    const key = historyStorageKey(address, currentNetwork)
    const raw = localStorage.getItem(key)
    if (!raw) return { list: [] }
    const list = JSON.parse(raw) as StoredTx[]
    return { list: Array.isArray(list) ? list : [] }
  } catch (e) {
    console.error('Error loading transaction history:', e)
    return { list: [], error: 'load_failed' }
  }
}

export type SaveTxInput = {
  hash: string
  from: string
  to: string
  value: string
  status?: string
  blockNumber?: number
  explorerUrl?: string | null
}

/** Guarda una tx y devuelve la lista completa actualizada (máx. 50). */
export function saveTransactionToStorage(
  address: string,
  currentNetwork: string,
  chainId: string,
  input: SaveTxInput
): StoredTx[] {
  const storageKey = historyStorageKey(address, currentNetwork)

  const transaction: StoredTx = {
    hash: input.hash,
    from: input.from,
    to: input.to,
    value: input.value,
    network: currentNetwork,
    chainId,
    status: input.status || 'success',
    blockNumber: input.blockNumber,
    explorerUrl: input.explorerUrl ?? getBlockExplorerTxUrl(chainId, input.hash),
    timestamp: Date.now(),
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString(),
    isOutgoing: input.from.toLowerCase() === address.toLowerCase(),
  }

  const existing: StoredTx[] = JSON.parse(localStorage.getItem(storageKey) || '[]')
  const exists = existing.some((tx) => tx.hash === transaction.hash)
  if (exists) return existing

  existing.unshift(transaction)
  const limited = existing.slice(0, 50)
  localStorage.setItem(storageKey, JSON.stringify(limited))
  console.log('💾 Transacción guardada en historial local:', transaction.hash)
  return limited
}

export function clearTransactionsStorage(address: string, currentNetwork: string): void {
  localStorage.removeItem(historyStorageKey(address, currentNetwork))
}

/**
 * Obtiene transacciones desde la blockchain usando Etherscan API
 * Combina con las transacciones locales para tener un historial completo
 */
export async function loadTransactionsFromBlockchain(
  address: string,
  chainId: string,
  currentNetwork: string,
  explorerBase: string
): Promise<{ ok: true; transactions: StoredTx[] } | { ok: false; error: string }> {
  try {
    // Obtener transacciones desde Etherscan API
    const result = await fetchAllTransactions(address, chainId, currentNetwork, explorerBase)
    
    if (!result.ok) {
      return { ok: false, error: result.error }
    }

    // Obtener transacciones locales
    const localTxs = loadTransactionsFromStorage(address, currentNetwork).list

    // Combinar transacciones de blockchain con locales
    const allTxs = [...result.transactions, ...localTxs]
    
    // Eliminar duplicados por hash
    const uniqueTxs = Array.from(new Map(allTxs.map((tx) => [tx.hash, tx])).values())
    
    // Ordenar por timestamp descendente
    uniqueTxs.sort((a, b) => b.timestamp - a.timestamp)

    // Guardar en localStorage para cache
    const storageKey = historyStorageKey(address, currentNetwork)
    localStorage.setItem(storageKey, JSON.stringify(uniqueTxs.slice(0, 100)))

    return { ok: true, transactions: uniqueTxs }
  } catch (error) {
    console.error('Error loading transactions from blockchain:', error)
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  }
}

/**
 * Verifica si una red soporta Etherscan API
 */
export function isEtherscanSupported(chainId: string): boolean {
  const supportedChains = ['1', '11155111', '137', '56', '43114']
  return supportedChains.includes(chainId)
}
