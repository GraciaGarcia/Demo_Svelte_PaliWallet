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
  },
  
  // Sepolia Testnet (Ethereum) - Pendiente de desplegar
  '11155111': {
    address: '0x0000000000000000000000000000000000000000', // ⚠️ ACTUALIZAR después de desplegar
    explorerApi: 'https://api-sepolia.etherscan.io/api',
    explorerUrl: 'https://sepolia.etherscan.io',
    rpcUrl: 'https://rpc.sepolia.org',
    networkName: 'Sepolia',
    symbol: 'ETH',
    chainId: '11155111',
    apiKey: '', // Obtener en https://etherscan.io/apis
  },
  
  // Polygon Mumbai Testnet - Pendiente de desplegar
  '80001': {
    address: '0x0000000000000000000000000000000000000000', // ⚠️ ACTUALIZAR
    explorerApi: 'https://api-testnet.polygonscan.com/api',
    explorerUrl: 'https://mumbai.polygonscan.com',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    networkName: 'Mumbai',
    symbol: 'MATIC',
    chainId: '80001',
    apiKey: '', // Obtener en https://polygonscan.com/apis
  },
  
  // BSC Testnet - Pendiente de desplegar
  '97': {
    address: '0x0000000000000000000000000000000000000000', // ⚠️ ACTUALIZAR
    explorerApi: 'https://api-testnet.bscscan.com/api',
    explorerUrl: 'https://testnet.bscscan.com',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    networkName: 'BSC Testnet',
    symbol: 'BNB',
    chainId: '97',
    apiKey: '', // Obtener en https://bscscan.com/apis
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
