import { ethers } from 'ethers'

type Eip1193 = import('ethers').Eip1193Provider

/**
 * ABI del contrato ImprovedWalletContract (nuevo)
 */
const IMPROVED_WALLET_ABI = [
  'function deposit() external payable',
  'function withdraw(uint256 amount) external',
  'function withdrawAll() external',
  'function sendTo(address payable recipient, uint256 amount) external',
  'function getMyBalance() external view returns (uint256)',
  'function getBalanceOf(address account) external view returns (uint256)',
  'function getContractBalance() external view returns (uint256)',
  'function owner() external view returns (address)',
  'function totalBalance() external view returns (uint256)',
]

/**
 * ABI del contrato SimpleTransfer (antiguo)
 */
const SIMPLE_TRANSFER_ABI = [
  'function sendTo(address payable recipient) external payable',
  'function getBalance() external view returns (uint256)',
  'function owner() external view returns (address)',
]

/**
 * Envía ETH a través del contrato SimpleTransfer (antiguo)
 * Requiere mínimo 0.1 ETH
 */
export async function sendThroughContract(params: {
  ethereum: Eip1193
  contractAddress: string
  recipient: string
  amount: string
}): Promise<{ ok: true; txHash: string; receipt: any } | { ok: false; message: string }> {
  const { ethereum, contractAddress, recipient, amount } = params

  try {
    // Validar que sea al menos 0.1 ETH
    const amountFloat = parseFloat(amount)
    if (amountFloat < 0.1) {
      return { ok: false, message: 'Debes enviar al menos 0.1 ETH' }
    }

    const provider = new ethers.BrowserProvider(ethereum)
    const signer = await provider.getSigner()

    const contract = new ethers.Contract(contractAddress, SIMPLE_TRANSFER_ABI, signer)

    // Llamar a sendTo() con ETH
    const tx = await contract.sendTo(recipient, { value: ethers.parseEther(amount) })

    const receipt = await tx.wait()
    if (!receipt) {
      return { ok: false, message: 'Sin recibo de transacción' }
    }

    return { ok: true, txHash: tx.hash, receipt }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, message: msg }
  }
}

/**
 * Deposita ETH al contrato ImprovedWallet (nuevo)
 * Requiere mínimo 0.01 ETH
 */
export async function depositToImprovedWallet(params: {
  ethereum: Eip1193
  contractAddress: string
  amount: string | number
}): Promise<{ ok: true; txHash: string; receipt: any } | { ok: false; message: string }> {
  const { ethereum, contractAddress, amount } = params

  try {
    // Convertir a string si es número
    const amountStr = String(amount)
    console.log('🔍 Iniciando depósito:', { contractAddress, amount: amountStr })
    
    const amountFloat = parseFloat(amountStr)
    if (isNaN(amountFloat) || amountFloat < 0.01) {
      return { ok: false, message: 'Debes enviar al menos 0.01 ETH' }
    }

    const provider = new ethers.BrowserProvider(ethereum)
    const signer = await provider.getSigner()
    const signerAddress = await signer.getAddress()
    
    console.log('👤 Dirección del firmante:', signerAddress)

    const contract = new ethers.Contract(contractAddress, IMPROVED_WALLET_ABI, signer)

    console.log('📝 Llamando a deposit() con', amountStr, 'ETH')
    const tx = await contract.deposit({ value: ethers.parseEther(amountStr) })
    
    console.log('⏳ Transacción enviada, esperando confirmación...', tx.hash)
    const receipt = await tx.wait()
    
    if (!receipt) {
      return { ok: false, message: 'Sin recibo de transacción' }
    }

    console.log('✅ Depósito confirmado:', receipt)
    return { ok: true, txHash: tx.hash, receipt }
  } catch (err: unknown) {
    console.error('❌ Error en depositToImprovedWallet:', err)
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, message: msg }
  }
}

/**
 * Retira fondos del contrato ImprovedWallet (nuevo)
 */
export async function withdrawFromImprovedWallet(params: {
  ethereum: Eip1193
  contractAddress: string
  amount: string | number
}): Promise<{ ok: true; txHash: string; receipt: any } | { ok: false; message: string }> {
  const { ethereum, contractAddress, amount } = params

  try {
    // Convertir a string si es número
    const amountStr = String(amount)
    console.log('🔍 Iniciando retiro:', { contractAddress, amount: amountStr })
    
    const provider = new ethers.BrowserProvider(ethereum)
    const signer = await provider.getSigner()
    const signerAddress = await signer.getAddress()
    
    console.log('👤 Dirección del firmante:', signerAddress)

    const contract = new ethers.Contract(contractAddress, IMPROVED_WALLET_ABI, signer)

    console.log('📝 Llamando a withdraw() con', amountStr, 'ETH')
    const tx = await contract.withdraw(ethers.parseEther(amountStr))
    
    console.log('⏳ Transacción enviada, esperando confirmación...', tx.hash)
    const receipt = await tx.wait()
    
    if (!receipt) {
      return { ok: false, message: 'Sin recibo de transacción' }
    }

    console.log('✅ Retiro confirmado:', receipt)
    return { ok: true, txHash: tx.hash, receipt }
  } catch (err: unknown) {
    console.error('❌ Error en withdrawFromImprovedWallet:', err)
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, message: msg }
  }
}

/**
 * Retira todos los fondos del contrato ImprovedWallet (nuevo)
 */
export async function withdrawAllFromImprovedWallet(params: {
  ethereum: Eip1193
  contractAddress: string
}): Promise<{ ok: true; txHash: string; receipt: any } | { ok: false; message: string }> {
  const { ethereum, contractAddress } = params

  try {
    const provider = new ethers.BrowserProvider(ethereum)
    const signer = await provider.getSigner()

    const contract = new ethers.Contract(contractAddress, IMPROVED_WALLET_ABI, signer)

    const tx = await contract.withdrawAll()

    const receipt = await tx.wait()
    if (!receipt) {
      return { ok: false, message: 'Sin recibo de transacción' }
    }

    return { ok: true, txHash: tx.hash, receipt }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, message: msg }
  }
}

/**
 * Envía fondos a través del contrato ImprovedWallet (nuevo)
 * Requiere mínimo 0.01 ETH
 */
export async function sendThroughImprovedWallet(params: {
  ethereum: Eip1193
  contractAddress: string
  recipient: string
  amount: string | number
}): Promise<{ ok: true; txHash: string; receipt: any } | { ok: false; message: string }> {
  const { ethereum, contractAddress, recipient, amount } = params

  try {
    // Convertir a string si es número
    const amountStr = String(amount)
    console.log('🔍 Iniciando envío:', { contractAddress, recipient, amount: amountStr })
    
    const amountFloat = parseFloat(amountStr)
    if (isNaN(amountFloat) || amountFloat < 0.01) {
      return { ok: false, message: 'Debes enviar al menos 0.01 ETH' }
    }

    const provider = new ethers.BrowserProvider(ethereum)
    const signer = await provider.getSigner()
    const signerAddress = await signer.getAddress()
    
    console.log('👤 Dirección del firmante:', signerAddress)

    const contract = new ethers.Contract(contractAddress, IMPROVED_WALLET_ABI, signer)

    console.log('📝 Llamando a sendTo() con', amountStr, 'ETH a', recipient)
    const tx = await contract.sendTo(recipient, ethers.parseEther(amountStr))
    
    console.log('⏳ Transacción enviada, esperando confirmación...', tx.hash)
    const receipt = await tx.wait()
    
    if (!receipt) {
      return { ok: false, message: 'Sin recibo de transacción' }
    }

    console.log('✅ Envío confirmado:', receipt)
    return { ok: true, txHash: tx.hash, receipt }
  } catch (err: unknown) {
    console.error('❌ Error en sendThroughImprovedWallet:', err)
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, message: msg }
  }
}

/**
 * Obtiene el balance del usuario en el contrato ImprovedWallet (nuevo)
 */
export async function getMyBalanceInContract(params: {
  ethereum: Eip1193
  contractAddress: string
}): Promise<{ ok: true; balance: string } | { ok: false; message: string }> {
  const { ethereum, contractAddress } = params

  try {
    const provider = new ethers.BrowserProvider(ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(contractAddress, IMPROVED_WALLET_ABI, signer)

    const balance = await contract.getMyBalance()
    return { ok: true, balance: ethers.formatEther(balance) }
  } catch (err: unknown) {
    console.error('Error obteniendo balance del usuario en contrato:', err)
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, message: msg }
  }
}

/**
 * Obtiene el balance del contrato (funciona con ambos contratos)
 */
export async function getContractBalance(params: {
  ethereum: Eip1193
  contractAddress: string
  useImprovedABI?: boolean
}): Promise<{ ok: true; balance: string } | { ok: false; message: string }> {
  const { ethereum, contractAddress, useImprovedABI = false } = params

  try {
    const provider = new ethers.BrowserProvider(ethereum)
    
    // Siempre obtener el balance directamente del provider (más confiable)
    const balance = await provider.getBalance(contractAddress)
    return { ok: true, balance: ethers.formatEther(balance) }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, message: msg }
  }
}

/**
 * Obtiene el owner del contrato (funciona con ambos contratos)
 */
export async function getContractOwner(params: {
  ethereum: Eip1193
  contractAddress: string
  useImprovedABI?: boolean
}): Promise<{ ok: true; owner: string } | { ok: false; message: string }> {
  const { ethereum, contractAddress, useImprovedABI = false } = params

  try {
    const provider = new ethers.BrowserProvider(ethereum)
    const abi = useImprovedABI ? IMPROVED_WALLET_ABI : SIMPLE_TRANSFER_ABI
    const contract = new ethers.Contract(contractAddress, abi, provider)

    const owner = await contract.owner()
    return { ok: true, owner }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, message: msg }
  }
}

/**
 * ABI básico para recibir fondos (función receive o fallback)
 */
const BASIC_RECEIVE_ABI = [
  'function deposit() public payable',
  'function withdraw(uint256 amount) public',
  'function withdrawTo(address recipient, uint256 amount) public',
  'function getBalance() public view returns (uint256)',
]

/**
 * Envía ETH nativo a un contrato (sin llamar función específica)
 */
export async function sendEthToContract(params: {
  ethereum: Eip1193
  contractAddress: string
  amount: string
  from: string
}): Promise<{ ok: true; txHash: string; receipt: any } | { ok: false; message: string }> {
  const { ethereum, contractAddress, amount, from } = params

  try {
    const provider = new ethers.BrowserProvider(ethereum)
    const signer = await provider.getSigner()

    // Enviar ETH directamente al contrato
    const tx = await signer.sendTransaction({
      to: contractAddress,
      value: ethers.parseEther(amount),
    })

    const receipt = await tx.wait()
    if (!receipt) {
      return { ok: false, message: 'Sin recibo de transacción' }
    }

    return { ok: true, txHash: tx.hash, receipt }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, message: msg }
  }
}

/**
 * Llama a la función deposit() del contrato enviando ETH
 */
export async function depositToContract(params: {
  ethereum: Eip1193
  contractAddress: string
  amount: string
  abi?: string[]
}): Promise<{ ok: true; txHash: string; receipt: any } | { ok: false; message: string }> {
  const { ethereum, contractAddress, amount, abi = BASIC_RECEIVE_ABI } = params

  try {
    const provider = new ethers.BrowserProvider(ethereum)
    const signer = await provider.getSigner()

    const contract = new ethers.Contract(contractAddress, abi, signer)

    // Llamar a deposit() con ETH
    const tx = await contract.deposit({ value: ethers.parseEther(amount) })

    const receipt = await tx.wait()
    if (!receipt) {
      return { ok: false, message: 'Sin recibo de transacción' }
    }

    return { ok: true, txHash: tx.hash, receipt }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, message: msg }
  }
}

/**
 * Retira fondos del contrato a una dirección específica
 */
export async function withdrawFromContract(params: {
  ethereum: Eip1193
  contractAddress: string
  recipient: string
  amount: string
  abi?: string[]
}): Promise<{ ok: true; txHash: string; receipt: any } | { ok: false; message: string }> {
  const { ethereum, contractAddress, recipient, amount, abi = BASIC_RECEIVE_ABI } = params

  try {
    const provider = new ethers.BrowserProvider(ethereum)
    const signer = await provider.getSigner()

    const contract = new ethers.Contract(contractAddress, abi, signer)

    // Intentar withdrawTo primero (si existe)
    let tx
    try {
      tx = await contract.withdrawTo(recipient, ethers.parseEther(amount))
    } catch {
      // Si no existe withdrawTo, intentar withdraw
      tx = await contract.withdraw(ethers.parseEther(amount))
    }

    const receipt = await tx.wait()
    if (!receipt) {
      return { ok: false, message: 'Sin recibo de transacción' }
    }

    return { ok: true, txHash: tx.hash, receipt }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, message: msg }
  }
}

/**
 * Llama a una función personalizada del contrato
 */
export async function callContractFunction(params: {
  ethereum: Eip1193
  contractAddress: string
  abi: string[]
  functionName: string
  args: any[]
  value?: string
}): Promise<{ ok: true; txHash: string; receipt: any; result?: any } | { ok: false; message: string }> {
  const { ethereum, contractAddress, abi, functionName, args, value } = params

  try {
    const provider = new ethers.BrowserProvider(ethereum)
    const signer = await provider.getSigner()

    const contract = new ethers.Contract(contractAddress, abi, signer)

    const options = value ? { value: ethers.parseEther(value) } : {}
    const tx = await contract[functionName](...args, options)

    const receipt = await tx.wait()
    if (!receipt) {
      return { ok: false, message: 'Sin recibo de transacción' }
    }

    return { ok: true, txHash: tx.hash, receipt }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, message: msg }
  }
}
