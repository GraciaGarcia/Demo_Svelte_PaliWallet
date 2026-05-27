/**
 * Servicio para consultar la API de Etherscan
 * Obtiene historial de transacciones desde la blockchain
 */

import type { StoredTx } from '../transactions/history'

// API Keys para diferentes redes (puedes usar las gratuitas)
// Para producción, configura las variables de entorno en .env
const ETHERSCAN_API_KEYS = {
  // Sepolia Testnet - API Key gratuita (puedes obtener una en https://etherscan.io/apis)
  '11155111': import.meta.env.VITE_ETHERSCAN_API_KEY_SEPOLIA || 'YourApiKeyToken', // Sepolia
  '1': import.meta.env.VITE_ETHERSCAN_API_KEY_MAINNET || 'YourApiKeyToken', // Ethereum Mainnet
  '137': import.meta.env.VITE_POLYGONSCAN_API_KEY || 'YourApiKeyToken', // Polygon
  '56': import.meta.env.VITE_BSCSCAN_API_KEY || 'YourApiKeyToken', // BSC
  '43114': import.meta.env.VITE_SNOWTRACE_API_KEY || 'YourApiKeyToken', // Avalanche
}

// URLs base para diferentes redes
const ETHERSCAN_BASE_URLS = {
  '11155111': 'https://api-sepolia.etherscan.io/api', // Sepolia
  '1': 'https://api.etherscan.io/api', // Ethereum Mainnet
  '137': 'https://api.polygonscan.com/api', // Polygon
  '56': 'https://api.bscscan.com/api', // BSC
  '43114': 'https://api.snowtrace.io/api', // Avalanche
}

export type EtherscanTransaction = {
  blockNumber: string
  timeStamp: string
  hash: string
  nonce: string
  blockHash: string
  transactionIndex: string
  from: string
  to: string
  value: string
  gas: string
  gasPrice: string
  isError: string
  txreceipt_status: string
  input: string
  contractAddress: string
  cumulativeGasUsed: string
  gasUsed: string
  confirmations: string
  methodId: string
  functionName: string
}

export type EtherscanInternalTx = {
  blockNumber: string
  timeStamp: string
  hash: string
  from: string
  to: string
  value: string
  contractAddress: string
  input: string
  type: string
  gas: string
  gasUsed: string
  traceId: string
  isError: string
  errCode: string
}

/**
 * Obtiene transacciones normales de una dirección
 */
export async function fetchNormalTransactions(
  address: string,
  chainId: string,
  startBlock = 0,
  endBlock = 99999999
): Promise<{ ok: true; transactions: EtherscanTransaction[] } | { ok: false; error: string }> {
  const baseUrl = ETHERSCAN_BASE_URLS[chainId]
  const apiKey = ETHERSCAN_API_KEYS[chainId]

  if (!baseUrl) {
    return { ok: false, error: `Red no soportada: ${chainId}` }
  }

  try {
    const url = `${baseUrl}?module=account&action=txlist&address=${address}&startblock=${startBlock}&endblock=${endBlock}&page=1&offset=100&sort=desc&apikey=${apiKey}`

    const response = await fetch(url)
    const data = await response.json()

    if (data.status === '0' && data.message === 'No transactions found') {
      return { ok: true, transactions: [] }
    }

    if (data.status !== '1') {
      return { ok: false, error: data.message || 'Error al consultar Etherscan' }
    }

    return { ok: true, transactions: data.result }
  } catch (error) {
    console.error('Error fetching normal transactions:', error)
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  }
}

/**
 * Obtiene transacciones internas (de contratos) de una dirección
 */
export async function fetchInternalTransactions(
  address: string,
  chainId: string,
  startBlock = 0,
  endBlock = 99999999
): Promise<{ ok: true; transactions: EtherscanInternalTx[] } | { ok: false; error: string }> {
  const baseUrl = ETHERSCAN_BASE_URLS[chainId]
  const apiKey = ETHERSCAN_API_KEYS[chainId]

  if (!baseUrl) {
    return { ok: false, error: `Red no soportada: ${chainId}` }
  }

  try {
    const url = `${baseUrl}?module=account&action=txlistinternal&address=${address}&startblock=${startBlock}&endblock=${endBlock}&page=1&offset=100&sort=desc&apikey=${apiKey}`

    const response = await fetch(url)
    const data = await response.json()

    if (data.status === '0' && data.message === 'No transactions found') {
      return { ok: true, transactions: [] }
    }

    if (data.status !== '1') {
      return { ok: false, error: data.message || 'Error al consultar Etherscan' }
    }

    return { ok: true, transactions: data.result }
  } catch (error) {
    console.error('Error fetching internal transactions:', error)
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  }
}

/**
 * Obtiene transacciones de un contrato específico
 */
export async function fetchContractTransactions(
  contractAddress: string,
  chainId: string,
  startBlock = 0,
  endBlock = 99999999
): Promise<{ ok: true; transactions: EtherscanTransaction[] } | { ok: false; error: string }> {
  const baseUrl = ETHERSCAN_BASE_URLS[chainId]
  const apiKey = ETHERSCAN_API_KEYS[chainId]

  if (!baseUrl) {
    return { ok: false, error: `Red no soportada: ${chainId}` }
  }

  try {
    const url = `${baseUrl}?module=account&action=txlist&address=${contractAddress}&startblock=${startBlock}&endblock=${endBlock}&page=1&offset=100&sort=desc&apikey=${apiKey}`

    const response = await fetch(url)
    const data = await response.json()

    if (data.status === '0' && data.message === 'No transactions found') {
      return { ok: true, transactions: [] }
    }

    if (data.status !== '1') {
      return { ok: false, error: data.message || 'Error al consultar Etherscan' }
    }

    return { ok: true, transactions: data.result }
  } catch (error) {
    console.error('Error fetching contract transactions:', error)
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  }
}

/**
 * Convierte transacciones de Etherscan al formato StoredTx
 */
export function convertEtherscanTxToStoredTx(
  tx: EtherscanTransaction,
  userAddress: string,
  chainId: string,
  networkName: string,
  explorerBase: string
): StoredTx {
  const timestamp = parseInt(tx.timeStamp) * 1000
  const date = new Date(timestamp)
  const valueInEth = (parseInt(tx.value) / 1e18).toFixed(6)

  return {
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    value: valueInEth,
    network: networkName,
    chainId: chainId,
    status: tx.txreceipt_status === '1' ? 'success' : 'failed',
    blockNumber: parseInt(tx.blockNumber),
    explorerUrl: `${explorerBase}/tx/${tx.hash}`,
    timestamp: timestamp,
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString(),
    isOutgoing: tx.from.toLowerCase() === userAddress.toLowerCase(),
  }
}

/**
 * Convierte transacciones internas de Etherscan al formato StoredTx
 */
export function convertInternalTxToStoredTx(
  tx: EtherscanInternalTx,
  userAddress: string,
  chainId: string,
  networkName: string,
  explorerBase: string
): StoredTx {
  const timestamp = parseInt(tx.timeStamp) * 1000
  const date = new Date(timestamp)
  const valueInEth = (parseInt(tx.value) / 1e18).toFixed(6)

  return {
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    value: valueInEth,
    network: networkName,
    chainId: chainId,
    status: tx.isError === '0' ? 'success' : 'failed',
    blockNumber: parseInt(tx.blockNumber),
    explorerUrl: `${explorerBase}/tx/${tx.hash}`,
    timestamp: timestamp,
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString(),
    isOutgoing: tx.from.toLowerCase() === userAddress.toLowerCase(),
  }
}

/**
 * Obtiene todas las transacciones (normales + internas) de una dirección
 */
export async function fetchAllTransactions(
  address: string,
  chainId: string,
  networkName: string,
  explorerBase: string
): Promise<{ ok: true; transactions: StoredTx[] } | { ok: false; error: string }> {
  try {
    // Obtener transacciones normales
    const normalResult = await fetchNormalTransactions(address, chainId)
    if (!normalResult.ok) {
      return { ok: false, error: normalResult.error }
    }

    // Obtener transacciones internas
    const internalResult = await fetchInternalTransactions(address, chainId)
    if (!internalResult.ok) {
      console.warn('No se pudieron obtener transacciones internas:', internalResult.error)
    }

    // Convertir al formato StoredTx
    const normalTxs = normalResult.transactions.map((tx) =>
      convertEtherscanTxToStoredTx(tx, address, chainId, networkName, explorerBase)
    )

    const internalTxs = internalResult.ok
      ? internalResult.transactions.map((tx) =>
          convertInternalTxToStoredTx(tx, address, chainId, networkName, explorerBase)
        )
      : []

    // Combinar y eliminar duplicados por hash
    const allTxs = [...normalTxs, ...internalTxs]
    const uniqueTxs = Array.from(new Map(allTxs.map((tx) => [tx.hash, tx])).values())

    // Ordenar por timestamp descendente
    uniqueTxs.sort((a, b) => b.timestamp - a.timestamp)

    return { ok: true, transactions: uniqueTxs }
  } catch (error) {
    console.error('Error fetching all transactions:', error)
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  }
}
