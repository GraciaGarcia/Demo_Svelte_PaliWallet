import { getRpcUrlsForChain, getBlockExplorerBaseUrl } from '../chains/networks'

type Eip1193 = {
  request: (args: { method: string; params?: unknown }) => Promise<unknown>
}

type NetworkRow = { name: string; chainId: string; symbol: string }

/** Añade red EVM a Pali (sin cambiar de red). */
export async function addEvmChainToWallet(ethereum: Eip1193, network: NetworkRow): Promise<void> {
  const chainIdHex = `0x${parseInt(network.chainId, 10).toString(16)}`
  await ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [
      {
        chainId: chainIdHex,
        chainName: network.name,
        nativeCurrency: {
          name: network.symbol,
          symbol: network.symbol,
          decimals: 18,
        },
        rpcUrls: getRpcUrlsForChain(network.chainId),
        blockExplorerUrls: [getBlockExplorerBaseUrl(network.chainId)],
      },
    ],
  })
}

/** Flujo completo “añadir red” del UI original (EVM + alertas UTXO). */
export async function addNetworkToPali(
  ethereum: Eip1193 | undefined,
  network: NetworkRow,
  type: 'EVM' | 'UTXO',
  switchNetwork: (n: NetworkRow, t: 'EVM' | 'UTXO') => Promise<void>
): Promise<void> {
  if (!ethereum) return

  if (type === 'EVM') {
    await addEvmChainToWallet(ethereum, network)
    alert(`Red "${network.name}" agregada a Pali Wallet`)
    await switchNetwork(network, type)
  } else {
    alert('Las redes UTXO deben agregarse manualmente desde Pali Wallet')
  }
}

export async function removeNetworkFromPali(
  ethereum: Eip1193 | undefined,
  network: NetworkRow,
  type: 'EVM' | 'UTXO'
): Promise<void> {
  if (!ethereum) return

  if (type === 'EVM') {
    const chainIdHex = `0x${parseInt(network.chainId, 10).toString(16)}`
    try {
      await ethereum.request({
        method: 'wallet_removeEthereumChain',
        params: [{ chainId: chainIdHex }],
      })
      alert(`✅ Red "${network.name}" eliminada de Pali Wallet`)
    } catch {
      try {
        await ethereum.request({
          method: 'sys_removeNetwork',
          params: [{ chainId: chainIdHex }],
        })
        alert(`✅ Red "${network.name}" eliminada de Pali Wallet`)
      } catch {
        try {
          await ethereum.request({
            method: 'eth_removeNetwork',
            params: [chainIdHex],
          })
          alert(`✅ Red "${network.name}" eliminada de Pali Wallet`)
        } catch {
          alert(
            `⚠️ Eliminación automática no disponible\n\n` +
              `Para eliminar la red "${network.name}" manualmente:\n\n` +
              `1. Abre la extensión Pali Wallet\n` +
              `2. Ve a Configuración ⚙️\n` +
              `3. Selecciona "Redes" o "Networks"\n` +
              `4. Busca "${network.name}"\n` +
              `5. Haz clic en "Eliminar" o "Delete"\n\n` +
              `Nota: Algunos wallets no permiten eliminar redes por seguridad.`
          )
        }
      }
    }
  } else {
    try {
      await ethereum.request({
        method: 'sys_removeUTXONetwork',
        params: [{ chainId: network.chainId }],
      })
      alert(`✅ Red UTXO "${network.name}" eliminada de Pali Wallet`)
    } catch {
      alert(
        `⚠️ Eliminación automática de UTXO no disponible\n\n` +
          `Para eliminar la red UTXO "${network.name}" manualmente:\n\n` +
          `1. Abre la extensión Pali Wallet\n` +
          `2. Ve a Configuración ⚙️\n` +
          `3. Selecciona "UTXO Networks"\n` +
          `4. Busca "${network.name}"\n` +
          `5. Haz clic en "Eliminar" o "Remove"\n\n` +
          `Nota: Las redes UTXO principales (Bitcoin) no se pueden eliminar.`
      )
    }
  }
}

export type SwitchContext = {
  ethereum: Eip1193
  ethers: typeof import('ethers')
  network: NetworkRow
  type: 'EVM' | 'UTXO'
  address: string
  /** Tras cambio EVM exitoso (p. ej. recargar historial). */
  onAfterEvmSwitch?: () => void | Promise<void>
  addNetwork: (n: NetworkRow, t: 'EVM' | 'UTXO') => Promise<void>
}

export type SwitchPaliNetworkResult =
  | {
      currentNetwork: string
      chainId: string
      balance: string
      error?: string
    }
  | { error: string }
  | null

export async function switchPaliNetwork(ctx: SwitchContext): Promise<SwitchPaliNetworkResult> {
  const { ethereum, ethers, network, type, address, onAfterEvmSwitch, addNetwork } = ctx

  try {
    if (type === 'UTXO') {
      try {
        await ethereum.request({
          method: 'sys_changeUTXOEVM',
          params: { chainId: network.chainId },
        })
      } catch {
        try {
          await ethereum.request({
            method: 'sys_changeUTXOEVM',
            params: [{ chainId: network.chainId }],
          })
        } catch {
          try {
            await ethereum.request({
              method: 'eth_changeUTXOEVM',
              params: [{ chainId: network.chainId }],
            })
          } catch {
            throw new Error('Métodos automáticos no disponibles')
          }
        }
      }
      alert(`✅ Cambiado a red UTXO: ${network.name}`)
      return {
        currentNetwork: network.name,
        chainId: network.chainId,
        balance: '0.0000',
      }
    }

    const hexChainId = `0x${parseInt(network.chainId, 10).toString(16)}`
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: hexChainId }],
    })

    const provider = new ethers.BrowserProvider(ethereum as import('ethers').Eip1193Provider)
    const rawBalance = await provider.getBalance(address)
    const balance = ethers.formatEther(rawBalance)
    if (onAfterEvmSwitch) await onAfterEvmSwitch()
    alert(`✅ Cambiado a red EVM: ${network.name}`)
    return {
      currentNetwork: network.name,
      chainId: network.chainId,
      balance,
    }
  } catch (err: unknown) {
    const e = err as { code?: number; message?: string }
    console.error('Error al cambiar red:', err)

    if (e.code === 4902) {
      const shouldAdd = confirm(
        `La red ${network.name} no está en tu Pali Wallet.\n\n¿Deseas agregarla ahora?`
      )
      if (shouldAdd) await addNetwork(network, type)
      // addNetwork + switch actualizan estado; no devolver parche aquí
      return null
    }
    if (e.code === 4001) {
      return { error: 'Cambio de red cancelado por el usuario' }
    }
    if (e.code === 4101) {
      const msg = `Método solo disponible para redes ${type}. Cambia manualmente en Pali Wallet.`
      alert(msg)
      return {
        currentNetwork: network.name,
        chainId: network.chainId,
        balance: '0.0000',
        error: msg,
      }
    }
    if (
      type === 'UTXO' &&
      (e.code === -32601 || (e.message && e.message.includes('Métodos automáticos')))
    ) {
      alert(
        `🔄 Cambio a Red UTXO: ${network.name}\n\n` +
          `⚠️ El cambio automático no está disponible.\n` +
          `Por favor cambia manualmente en Pali Wallet:\n\n` +
          `1. Abre la extensión Pali Wallet\n` +
          `2. Haz clic en el selector de red (arriba)\n` +
          `3. Selecciona "UTXO Networks"\n` +
          `4. Elige "${network.name}"\n` +
          `5. Recarga esta página (F5)\n\n` +
          `Nota: La aplicación detectará la nueva red automáticamente.`
      )
      return {
        currentNetwork: network.name,
        chainId: network.chainId,
        balance: '0.0000',
      }
    }

    const msg = `Error al cambiar de red: ${e.message || 'Error desconocido'}`
    alert(msg)
    return {
      currentNetwork: network.name,
      chainId: network.chainId,
      balance: '0.0000',
      error: msg,
    }
  }
}
