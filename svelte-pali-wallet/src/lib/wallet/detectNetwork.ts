import { ethers } from 'ethers'
import { networks } from '../chains/networks'

type Eip1193 = import('ethers').Eip1193Provider

export type DetectedNetwork = {
  currentNetwork: string
  chainId: string
  networkType: 'EVM' | 'UTXO'
  balance: string
}

export async function detectCurrentNetwork(ethereum: Eip1193 | undefined): Promise<DetectedNetwork> {
  if (!ethereum) {
    const d = networks.EVM[0]
    return {
      currentNetwork: d.name,
      chainId: d.chainId,
      networkType: 'EVM',
      balance: '0.0000',
    }
  }

  try {
    // Primero intentar obtener chainId directamente (más rápido y funciona en EVM)
    const chainIdHex = await ethereum.request({ method: 'eth_chainId' }).catch(() => null)
    
    if (chainIdHex) {
      // Es una red EVM
      const chainIdStr = BigInt(chainIdHex as string).toString()
      const evmNetwork = networks.EVM.find((n) => n.chainId === chainIdStr)
      
      if (evmNetwork) {
        return {
          currentNetwork: evmNetwork.name,
          chainId: chainIdStr,
          networkType: 'EVM',
          balance: '0.0000',
        }
      }
      
      return {
        currentNetwork: `EVM (chain ${chainIdStr})`,
        chainId: chainIdStr,
        networkType: 'EVM',
        balance: '0.0000',
      }
    }
    
    // Si eth_chainId falla, es probablemente UTXO
    console.log('No es red EVM, asumiendo UTXO...')
    const defaultUtxo = networks.UTXO[0]
    return {
      currentNetwork: defaultUtxo.name,
      chainId: defaultUtxo.chainId,
      networkType: 'UTXO',
      balance: '0.0000',
    }
  } catch (err) {
    console.error('Error detectando red:', err)
    // Por defecto, asumir UTXO si hay error
    const defaultUtxo = networks.UTXO[0]
    return {
      currentNetwork: defaultUtxo.name,
      chainId: defaultUtxo.chainId,
      networkType: 'UTXO',
      balance: '0.0000',
    }
  }
}
