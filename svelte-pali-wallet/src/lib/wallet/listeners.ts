import type { Eip1193Provider } from 'ethers'

type Handlers = {
  onAccountsEmpty: () => void | Promise<void>
  onAccountChanged: (nextAddress: string) => void | Promise<void>
}

/**
 * Registra listeners de cuenta/red. Devuelve función para quitar listeners (best-effort).
 */
export function setupWalletListeners(ethereum: Eip1193Provider, handlers: Handlers): () => void {
  const onAccounts = async (accounts: string[]) => {
    if (accounts.length === 0) {
      await handlers.onAccountsEmpty()
    } else {
      await handlers.onAccountChanged(accounts[0])
    }
  }

  const onChain = () => {
    console.log('Red cambiada, recargando página...')
    window.location.reload()
  }

  ethereum.on('accountsChanged', onAccounts)
  ethereum.on('chainChanged', onChain)

  return () => {
    try {
      ethereum.removeListener('accountsChanged', onAccounts)
      ethereum.removeListener('chainChanged', onChain)
    } catch {
      /* ignore */
    }
  }
}
