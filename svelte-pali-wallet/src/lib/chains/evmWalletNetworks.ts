/**
 * Redes EVM para Pali (chainId en hex). Orden y nombres alineados con el selector de Pali Wallet.
 */
export type EvmWalletNetwork = {
  chainId: string
  name: string
  rpcUrls: string[]
  nativeCurrency: { name: string; symbol: string; decimals: number }
  blockExplorerUrls: string[]
}

export const EVM_WALLET_NETWORKS: EvmWalletNetwork[] = [
  {
    chainId: '0x23A',
    name: 'Rollux',
    rpcUrls: ['https://rpc.rollux.com'],
    nativeCurrency: { name: 'Syscoin', symbol: 'SYS', decimals: 18 },
    blockExplorerUrls: ['https://explorer.rollux.com'],
  },
  {
    chainId: '0x39',
    name: 'Syscoin NEVM',
    rpcUrls: ['https://rpc.syscoin.org'],
    nativeCurrency: { name: 'Syscoin', symbol: 'SYS', decimals: 18 },
    blockExplorerUrls: ['https://explorer.syscoin.org'],
  },
  {
    chainId: '0x1',
    name: 'Ethereum Mainnet',
    rpcUrls: ['https://ethereum-rpc.publicnode.com', 'https://cloudflare-eth.com', 'https://eth.llamarpc.com'],
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    blockExplorerUrls: ['https://etherscan.io'],
  },
  {
    chainId: '0x89',
    name: 'Polygon Mainnet',
    rpcUrls: ['https://polygon-rpc.com', 'https://polygon-bor-rpc.publicnode.com', 'https://polygon.llamarpc.com'],
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    blockExplorerUrls: ['https://polygonscan.com'],
  },
  {
    chainId: '0x1644',
    name: 'Syscoin NEVM Testnet',
    rpcUrls: ['https://rpc.tanenbaum.io'],
    nativeCurrency: { name: 'Syscoin', symbol: 'tSYS', decimals: 18 },
    blockExplorerUrls: ['https://tanenbaum.io'],
  },
  {
    chainId: '0xDEDA',
    name: 'zkSYS PoB Devnet',
    rpcUrls: ['https://rpc-pob.dev11.top/'],
    nativeCurrency: { name: 'Syscoin', symbol: 'TSYS', decimals: 18 },
    blockExplorerUrls: ['https://explorer-pob.dev11.top'],
  },
  {
    chainId: '0xDEE1',
    name: 'zkSYS Testnet',
    rpcUrls: ['https://rpc-zk.tanenbaum.io/'],
    nativeCurrency: { name: 'Syscoin', symbol: 'TSYS', decimals: 18 },
    blockExplorerUrls: ['https://explorer-zk.tanenbaum.io'],
  },
  {
    chainId: '0x88BB0',
    name: 'Ethereum Hoodi',
    rpcUrls: ['https://rpc.hoodi.ethpandaops.io'],
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    blockExplorerUrls: ['https://hoodi.etherscan.io'],
  },
  {
    chainId: '0xAA36A7',
    name: 'Ethereum Sepolia',
    rpcUrls: ['https://ethereum-sepolia-rpc.publicnode.com', 'https://rpc2.sepolia.org', 'https://sepolia.gateway.tenderly.co'],
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
  },
]

export const UTXO_WALLET_NETWORKS = [
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC' },
  { id: 'sys', name: 'Syscoin Mainnet', symbol: 'SYS' },
  { id: 'sys-test', name: 'Syscoin Testnet', symbol: 'tSYS' },
] as const

export function hexToDecimalChainId(hex: string): string {
  const h = hex.startsWith('0x') ? hex : `0x${hex}`
  return BigInt(h).toString()
}

export function explorerBaseFromNetwork(n: EvmWalletNetwork): string {
  const u = n.blockExplorerUrls[0] || ''
  return u.replace(/\/$/, '')
}

export function findEvmWalletNetworkByDecimal(decimalChainId: string): EvmWalletNetwork | undefined {
  return EVM_WALLET_NETWORKS.find((n) => hexToDecimalChainId(n.chainId) === decimalChainId)
}

/** Icono visual por nombre de red (como en Pali). */
export function networkDisplayIcon(name: string): string {
  if (name.includes('Bitcoin')) return '🟠'
  if (name.includes('Rollux')) return '🟡'
  if (name.includes('Ethereum')) return '🔷'
  if (name.includes('Polygon')) return '🟣'
  if (name.includes('zkSYS')) return '🟣'
  if (name.includes('Syscoin')) return '🔵'
  return '🔵'
}
