/**
 * Configuración de contratos Faucet por red
 * 
 * IMPORTANTE: Después de desplegar el contrato, actualiza las direcciones aquí
 */

export interface FaucetConfig {
  address: string
  explorerApi: string
  explorerUrl: string
  rpcUrl: string
  networkName: string
  symbol: string
  chainId: string
  apiKey?: string
  contractType?: 'faucet' | 'improved-wallet' // Tipo de contrato
  amountPerRequest?: string // Cantidad fija por solicitud
  defaultBalance?: string // Balance por defecto para mostrar
}

export const FAUCET_CONTRACTS: Record<string, FaucetConfig> = {
  // Hoodi (Red donde está tu contrato - Chain ID 560048)
  '560048': {
    address: '0x811278B0518bCE88a87de7f8E82c1Ac16649E6ac', // ✅ Desplegado
    explorerApi: 'https://hoodi.etherscan.io/api',
    explorerUrl: 'https://hoodi.etherscan.io',
    rpcUrl: 'https://rpc.hoodi.fi',
    networkName: 'Ethereum Hoodi EVM',
    symbol: 'HOODI',
    chainId: '560048',
    apiKey: '',
    contractType: 'faucet',
    amountPerRequest: '0.01',
    defaultBalance: '0.46',
  },
  
  // Sepolia Testnet (Ethereum) - ✅ Usando ImprovedWalletContract
  '11155111': {
    address: '0x1fC9203ECC40dFC072bd4b087FE70004A1D2340F', // ✅ ImprovedWalletContract
    explorerApi: 'https://api-sepolia.etherscan.io/api',
    explorerUrl: 'https://sepolia.etherscan.io',
    rpcUrl: 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161', // RPC público de Infura
    networkName: 'Sepolia',
    symbol: 'ETH',
    chainId: '11155111',
    apiKey: '', // Obtener en https://etherscan.io/apis
    contractType: 'improved-wallet',
    amountPerRequest: '0.01', // Mínimo del contrato
    defaultBalance: '0', // Se actualizará dinámicamente
  },
}

/**
 * Verificar si una red tiene faucet configurado
 */
export function hasFaucetContract(chainId: string): boolean {
  return chainId in FAUCET_CONTRACTS && 
         FAUCET_CONTRACTS[chainId].address !== '0x0000000000000000000000000000000000000000'
}

/**
 * Obtener configuración del faucet por chainId
 */
export function getFaucetConfig(chainId: string): FaucetConfig | null {
  if (!hasFaucetContract(chainId)) {
    return null
  }
  return FAUCET_CONTRACTS[chainId]
}

/**
 * Obtener todas las redes con faucet disponible
 */
export function getAvailableFaucetNetworks(): FaucetConfig[] {
  return Object.values(FAUCET_CONTRACTS).filter(
    config => config.address !== '0x0000000000000000000000000000000000000000'
  )
}
