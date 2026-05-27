import { ethers } from 'ethers'
import { getBlockExplorerTxUrl } from '../chains/networks'
import { saveTransactionToStorage, type SaveTxInput, type StoredTx } from '../transactions/history'

type Eip1193 = import('ethers').Eip1193Provider

export type TransferSummaryLike = {
  from: string
  to: string
  amount: string | number
}

export async function sendNativeEvmTransfer(params: {
  ethereum: Eip1193
  summary: TransferSummaryLike
  address: string
  chainId: string
  currentNetwork: string
}): Promise<
  | {
      ok: true
      txHash: string
      receipt: import('ethers').ContractTransactionReceipt
      newBalance: string
      transactions: StoredTx[]
    }
  | { ok: false; message: string }
> {
  const { ethereum, summary, address, chainId, currentNetwork } = params

  try {
    const provider = new ethers.BrowserProvider(ethereum)
    const signer = await provider.getSigner()

    const tx = await signer.sendTransaction({
      to: summary.to,
      value: ethers.parseEther(String(summary.amount)),
    })

    const receipt = await tx.wait()
    if (!receipt) {
      return { ok: false, message: 'Sin recibo de transacción' }
    }

    const payload: SaveTxInput = {
      hash: tx.hash,
      from: summary.from,
      to: summary.to,
      value: String(summary.amount),
      status: receipt.status === 1 ? 'success' : 'failed',
      blockNumber: receipt.blockNumber,
      explorerUrl: getBlockExplorerTxUrl(chainId, tx.hash),
    }
    const transactions = saveTransactionToStorage(address, currentNetwork, chainId, payload)

    const rawBalance = await provider.getBalance(address)
    const newBalance = ethers.formatEther(rawBalance)

    const explorerUrl = getBlockExplorerTxUrl(chainId, tx.hash)
    if (explorerUrl) {
      const shouldOpenExplorer = confirm(
        `✅ Transferencia exitosa!\n\n` +
          `Hash: ${tx.hash.slice(0, 10)}...${tx.hash.slice(-8)}\n` +
          `Bloque: ${receipt.blockNumber}\n` +
          `Gas usado: ${receipt.gasUsed}\n\n` +
          `¿Deseas ver la transacción en el explorador de bloques?`
      )
      if (shouldOpenExplorer) window.open(explorerUrl, '_blank')
    } else {
      alert(`✅ Transferencia exitosa!\n\nHash: ${tx.hash}\nBloque: ${receipt.blockNumber}`)
    }

    return { ok: true, txHash: tx.hash, receipt, newBalance, transactions }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, message: msg }
  }
}
