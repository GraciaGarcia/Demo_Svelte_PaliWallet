const STORAGE_KEY = 'network_switch_history_v1'
const MAX_ENTRIES = 40

export type NetworkSwitchEntry = {
  ts: number
  kind: 'EVM' | 'UTXO'
  /** EVM: chainId decimal; UTXO: id (p. ej. bitcoin) */
  chainId: string
  name: string
  /** Base del explorador para EVM (sin /tx/...) */
  explorerBase?: string | null
}

function readAll(): NetworkSwitchEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function writeAll(list: NetworkSwitchEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_ENTRIES)))
}

export function loadNetworkSwitchHistory(): NetworkSwitchEntry[] {
  return readAll()
}

export function appendNetworkSwitch(entry: Omit<NetworkSwitchEntry, 'ts'> & { ts?: number }): NetworkSwitchEntry[] {
  const row: NetworkSwitchEntry = {
    ts: entry.ts ?? Date.now(),
    kind: entry.kind,
    chainId: entry.chainId,
    name: entry.name,
    explorerBase: entry.explorerBase ?? null,
  }
  const next = [row, ...readAll()].slice(0, MAX_ENTRIES)
  writeAll(next)
  return next
}

export function clearNetworkSwitchHistory(): void {
  localStorage.removeItem(STORAGE_KEY)
}
