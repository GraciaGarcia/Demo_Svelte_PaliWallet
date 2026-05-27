import {
  EVM_WALLET_NETWORKS,
  UTXO_WALLET_NETWORKS,
  hexToDecimalChainId,
  explorerBaseFromNetwork,
} from './evmWalletNetworks'

/** Cuentas de ejemplo para transferencias (demo). */
export const predefinedAccounts = [
  { name: 'Cuenta Importada', address: '0x1C0659e1E59EDC901C9e78858f388968274a497B' },
  { name: 'Mi Contrato (ImprovedWallet)', address: '0x1fC9203ECC40dFC072bd4b087FE70004A1D2340F' },
] as const

/** Redes UTXO y EVM mostradas / reconocidas en la DApp (EVM derivadas de `evmWalletNetworks.ts`). */
export const networks = {
  UTXO: UTXO_WALLET_NETWORKS.map((n) => ({
    name: n.name,
    chainId: n.id,
    symbol: n.symbol,
  })),
  EVM: EVM_WALLET_NETWORKS.map((n) => ({
    name: n.name,
    chainId: hexToDecimalChainId(n.chainId),
    symbol: n.nativeCurrency.symbol,
  })),
} as const

/** RPC por chainId decimal (alineado con el switcher). */
export const rpcUrls: Record<string, string[]> = Object.fromEntries(
  EVM_WALLET_NETWORKS.map((n) => [hexToDecimalChainId(n.chainId), n.rpcUrls])
)

const DEFAULT_EVM_RPC = 'https://rpc.syscoin.org'

/** Explorador base (sin /tx/...) por chainId decimal. */
export const blockExplorerBaseByChainId: Record<string, string> = Object.fromEntries(
  EVM_WALLET_NETWORKS.map((n) => [hexToDecimalChainId(n.chainId), explorerBaseFromNetwork(n)])
)

const DEFAULT_EXPLORER_BASE = 'https://explorer.syscoin.org'

export { EVM_WALLET_NETWORKS, UTXO_WALLET_NETWORKS, hexToDecimalChainId, explorerBaseFromNetwork }

export function getRpcUrlsForChain(chainId: string): string[] {
  return rpcUrls[chainId] ?? [DEFAULT_EVM_RPC]
}

export function getBlockExplorerBaseUrl(chainId: string): string {
  return blockExplorerBaseByChainId[chainId] ?? DEFAULT_EXPLORER_BASE
}

export function getBlockExplorerTxUrl(chainId: string, txHash: string): string | null {
  if (!chainId || !txHash) return null
  const base = blockExplorerBaseByChainId[chainId]
  if (!base) return null
  return `${base}/tx/${txHash}`
}
