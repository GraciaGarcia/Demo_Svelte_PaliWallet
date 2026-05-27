import { networks, predefinedAccounts } from '../chains/networks'

export type TransferSummary = {
  from: string
  to: string
  toName: string
  amount: string
  symbol: string
  network: string
}

export function validateAndBuildTransferSummary(params: {
  transferDestination: string
  transferAmount: string
  balance: string
  address: string
  chainId: string
  currentNetwork: string
}): { ok: true; summary: TransferSummary } | { ok: false; error: string } {
  const {
    transferDestination,
    transferAmount,
    balance,
    address,
    chainId,
    currentNetwork,
  } = params

  if (!transferDestination || !transferAmount) {
    return { ok: false, error: 'Por favor completa todos los campos' }
  }
  if (transferDestination.toLowerCase() === address.toLowerCase()) {
    return { ok: false, error: 'No puedes transferir a la misma cuenta activa' }
  }
  if (parseFloat(transferAmount) <= 0) {
    return { ok: false, error: 'La cantidad debe ser mayor a 0' }
  }
  if (parseFloat(transferAmount) > parseFloat(balance)) {
    return { ok: false, error: 'Saldo insuficiente' }
  }

  const destAccount = predefinedAccounts.find(
    (acc) => acc.address.toLowerCase() === transferDestination.toLowerCase()
  )

  const summary: TransferSummary = {
    from: address,
    to: transferDestination,
    toName: destAccount ? destAccount.name : 'Dirección personalizada',
    amount: transferAmount,
    symbol: networks.EVM.find((n) => n.chainId === chainId)?.symbol || 'ETH',
    network: currentNetwork,
  }

  return { ok: true, summary }
}
