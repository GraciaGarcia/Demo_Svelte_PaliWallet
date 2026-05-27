/**
 * Gestiona el historial de cambios de cuenta para permitir deshacer
 */

export type AccountHistoryEntry = {
  address: string
  balance: string
  timestamp: number
  network: string
  chainId: string
}

const ACCOUNT_HISTORY_KEY = 'account_history_v1'
const MAX_HISTORY_ENTRIES = 20

/**
 * Carga el historial de cuentas desde localStorage
 */
export function loadAccountHistory(): AccountHistoryEntry[] {
  try {
    const stored = localStorage.getItem(ACCOUNT_HISTORY_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Guarda una nueva entrada en el historial de cuentas
 */
export function appendAccountToHistory(entry: AccountHistoryEntry): AccountHistoryEntry[] {
  const history = loadAccountHistory()

  // Evitar duplicados consecutivos (misma cuenta y red)
  if (
    history.length > 0 &&
    history[history.length - 1].address.toLowerCase() === entry.address.toLowerCase() &&
    history[history.length - 1].network === entry.network
  ) {
    return history
  }

  history.push(entry)

  // Mantener solo las últimas MAX_HISTORY_ENTRIES
  if (history.length > MAX_HISTORY_ENTRIES) {
    history.shift()
  }

  localStorage.setItem(ACCOUNT_HISTORY_KEY, JSON.stringify(history))
  return history
}

/**
 * Obtiene la cuenta anterior en el historial
 */
export function getPreviousAccount(): AccountHistoryEntry | null {
  const history = loadAccountHistory()
  if (history.length < 2) return null
  return history[history.length - 2]
}

/**
 * Limpia el historial de cuentas
 */
export function clearAccountHistory(): void {
  localStorage.removeItem(ACCOUNT_HISTORY_KEY)
}

/**
 * Obtiene el historial completo
 */
export function getAccountHistory(): AccountHistoryEntry[] {
  return loadAccountHistory()
}
