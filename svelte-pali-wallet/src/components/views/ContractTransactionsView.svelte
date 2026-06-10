<script>
  import { createEventDispatcher, onMount } from 'svelte'
  import { ethers } from 'ethers'
  import { saveTransactionToNeon } from '../../lib/api/neon'

  export let chainId = ''
  export let currentNetwork = ''
  export let address = ''

  const dispatch = createEventDispatcher()

  // Detectar Pali Wallet o MetaMask
  // @ts-ignore
  const ethereum = window.ethereum || window.pali

  const CONTRACT_ADDRESS = '0x1fC9203ECC40dFC072bd4b087FE70004A1D2340F'

  let contractTransactions = []
  let loading = false
  let error = ''

  // ABI para eventos del contrato
  const CONTRACT_ABI = [
    'event Deposit(address indexed from, uint256 amount, uint256 timestamp)',
    'event Withdrawal(address indexed to, uint256 amount, uint256 timestamp)',
    'event Transfer(address indexed from, address indexed to, uint256 amount, uint256 timestamp)',
  ]

  async function loadContractTransactions() {
    if (!ethereum || !address) return

    loading = true
    error = ''
    
    try {
      const provider = new ethers.BrowserProvider(ethereum)
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)

      // Obtener eventos desde el bloque 0 (o un bloque reciente para optimizar)
      const currentBlock = await provider.getBlockNumber()
      const fromBlock = Math.max(0, currentBlock - 10000) // Últimos ~10000 bloques

      // Filtrar eventos relacionados con el usuario
      const depositFilter = contract.filters.Deposit(address)
      const withdrawFilter = contract.filters.Withdrawal(address)
      const transferFromFilter = contract.filters.Transfer(address, null)
      const transferToFilter = contract.filters.Transfer(null, address)

      const [deposits, withdrawals, transfersFrom, transfersTo] = await Promise.all([
        contract.queryFilter(depositFilter, fromBlock, currentBlock),
        contract.queryFilter(withdrawFilter, fromBlock, currentBlock),
        contract.queryFilter(transferFromFilter, fromBlock, currentBlock),
        contract.queryFilter(transferToFilter, fromBlock, currentBlock),
      ])

      // Combinar y formatear todas las transacciones
      const allTxs = []

      for (const event of deposits) {
        const block = await event.getBlock()
        allTxs.push({
          type: 'Depósito',
          hash: event.transactionHash,
          from: event.args.from,
          to: CONTRACT_ADDRESS,
          amount: ethers.formatEther(event.args.amount),
          timestamp: block.timestamp * 1000,
          blockNumber: event.blockNumber,
        })
      }

      for (const event of withdrawals) {
        const block = await event.getBlock()
        allTxs.push({
          type: 'Retiro',
          hash: event.transactionHash,
          from: CONTRACT_ADDRESS,
          to: event.args.to,
          amount: ethers.formatEther(event.args.amount),
          timestamp: block.timestamp * 1000,
          blockNumber: event.blockNumber,
        })
      }

      for (const event of transfersFrom) {
        const block = await event.getBlock()
        allTxs.push({
          type: 'Envío',
          hash: event.transactionHash,
          from: event.args.from,
          to: event.args.to,
          amount: ethers.formatEther(event.args.amount),
          timestamp: block.timestamp * 1000,
          blockNumber: event.blockNumber,
        })
      }

      for (const event of transfersTo) {
        const block = await event.getBlock()
        allTxs.push({
          type: 'Recibido',
          hash: event.transactionHash,
          from: event.args.from,
          to: event.args.to,
          amount: ethers.formatEther(event.args.amount),
          timestamp: block.timestamp * 1000,
          blockNumber: event.blockNumber,
        })
      }

      // Ordenar por timestamp descendente
      contractTransactions = allTxs.sort((a, b) => b.timestamp - a.timestamp)
      
      // Guardar en Neon PostgreSQL
      await saveTransactionsToNeon(allTxs)
    } catch (err) {
      console.error('Error cargando transacciones del contrato:', err)
      error = err instanceof Error ? err.message : String(err)
    } finally {
      loading = false
    }
  }

  async function saveTransactionsToNeon(transactions) {
    console.log(`💾 Guardando ${transactions.length} transacciones en Neon PostgreSQL...`)
    
    for (const tx of transactions) {
      try {
        const saved = await saveTransactionToNeon({
          hash: tx.hash,
          from_address: tx.from,
          to_address: tx.to,
          value: tx.amount,
          network: currentNetwork,
          chain_id: chainId,
          wallet_address: address.toLowerCase(),
          status: 'success',
          block_number: tx.blockNumber,
          explorer_url: `https://sepolia.etherscan.io/tx/${tx.hash}`
        })
        
        if (!saved) {
          console.warn('⚠️ No se guardó:', tx.hash)
        }
      } catch (err) {
        console.error('❌ Error guardando:', tx.hash, err)
      }
    }
    
    console.log('✅ Proceso de guardado completado')
  }

  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function formatAddress(addr) {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  function getTypeColor(type) {
    switch (type) {
      case 'Depósito':
        return '#10b981'
      case 'Retiro':
        return '#f59e0b'
      case 'Envío':
        return '#ef4444'
      case 'Recibido':
        return '#3b82f6'
      default:
        return '#6b7280'
    }
  }

  onMount(() => {
    loadContractTransactions()
  })
</script>

<div class="contract-transactions-view">
  <div class="view-header">
    <h1 class="view-title">📄 Transacciones del Contrato</h1>
    <p class="view-subtitle">Historial de interacciones con ImprovedWallet Contract</p>
  </div>

  <div class="contract-info-card">
    <div class="info-row">
      <span class="info-label">Contrato:</span>
      <span class="info-value">{formatAddress(CONTRACT_ADDRESS)}</span>
      <a
        href="https://sepolia.etherscan.io/address/{CONTRACT_ADDRESS}"
        target="_blank"
        rel="noopener noreferrer"
        class="explorer-link"
      >
        Ver en Etherscan
      </a>
    </div>
    <div class="info-row">
      <span class="info-label">Red:</span>
      <span class="info-value">{currentNetwork}</span>
    </div>
    <button
      type="button"
      class="btn-refresh"
      on:click={loadContractTransactions}
      disabled={loading}
    >
      {#if loading}
        <span class="spinner"></span>
      {:else}
        🔄 Actualizar
      {/if}
    </button>
  </div>

  {#if error}
    <div class="alert alert-error">
      <span>❌</span>
      <span>{error}</span>
      <button type="button" class="alert-close" on:click={() => (error = '')}>×</button>
    </div>
  {/if}

  <div class="transactions-container">
    {#if loading}
      <div class="loading-state">
        <div class="spinner-large"></div>
        <p>Cargando transacciones del contrato...</p>
      </div>
    {:else if contractTransactions.length === 0}
      <div class="empty-state">
        <span class="empty-icon">📭</span>
        <h3>No hay transacciones</h3>
        <p>Aún no has realizado ninguna transacción con este contrato</p>
      </div>
    {:else}
      <div class="transactions-list">
        <div class="transactions-header">
          <h3>Total: {contractTransactions.length} transacciones</h3>
        </div>
        {#each contractTransactions as tx}
          <div class="transaction-card">
            <div class="tx-header">
              <span class="tx-type" style="color: {getTypeColor(tx.type)}">
                {tx.type}
              </span>
              <span class="tx-date">{formatDate(tx.timestamp)}</span>
            </div>
            <div class="tx-details">
              <div class="tx-row">
                <span class="tx-label">De:</span>
                <span class="tx-value">{formatAddress(tx.from)}</span>
              </div>
              <div class="tx-row">
                <span class="tx-label">Para:</span>
                <span class="tx-value">{formatAddress(tx.to)}</span>
              </div>
              <div class="tx-row">
                <span class="tx-label">Cantidad:</span>
                <span class="tx-amount">{parseFloat(tx.amount).toFixed(4)} ETH</span>
              </div>
              <div class="tx-row">
                <span class="tx-label">Hash:</span>
                <a
                  href="https://sepolia.etherscan.io/tx/{tx.hash}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="tx-hash"
                >
                  {formatAddress(tx.hash)}
                </a>
              </div>
              <div class="tx-row">
                <span class="tx-label">Bloque:</span>
                <span class="tx-value">#{tx.blockNumber}</span>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .contract-transactions-view {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem;
  }

  .view-header {
    margin-bottom: 2rem;
  }

  .view-title {
    font-size: 2rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 0.5rem;
  }

  .view-subtitle {
    font-size: 1rem;
    color: #6b7280;
    margin: 0;
  }

  .contract-info-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .info-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .info-label {
    font-size: 0.9rem;
    font-weight: 500;
    color: #6b7280;
  }

  .info-value {
    font-size: 0.9rem;
    color: #1f2937;
    font-family: 'SF Mono', Monaco, monospace;
  }

  .explorer-link {
    font-size: 0.85rem;
    color: #3b82f6;
    text-decoration: none;
    transition: color 0.2s;
  }

  .explorer-link:hover {
    color: #2563eb;
    text-decoration: underline;
  }

  .btn-refresh {
    width: 100%;
    padding: 0.75rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .btn-refresh:hover:not(:disabled) {
    background: #2563eb;
  }

  .btn-refresh:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .alert {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: 8px;
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
  }

  .alert-error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #991b1b;
  }

  .alert-close {
    margin-left: auto;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: inherit;
    opacity: 0.6;
    transition: opacity 0.2s;
  }

  .alert-close:hover {
    opacity: 1;
  }

  .transactions-container {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 1.5rem;
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    gap: 1rem;
  }

  .spinner-large {
    width: 48px;
    height: 48px;
    border: 4px solid #e5e7eb;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    text-align: center;
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .empty-state h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 0.5rem;
  }

  .empty-state p {
    font-size: 0.95rem;
    color: #6b7280;
    margin: 0;
  }

  .transactions-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .transactions-header {
    margin-bottom: 0.5rem;
  }

  .transactions-header h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
    margin: 0;
  }

  .transaction-card {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1rem;
    transition: all 0.2s;
  }

  .transaction-card:hover {
    border-color: #d1d5db;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .tx-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .tx-type {
    font-size: 0.95rem;
    font-weight: 600;
  }

  .tx-date {
    font-size: 0.85rem;
    color: #6b7280;
  }

  .tx-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .tx-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .tx-label {
    font-size: 0.85rem;
    color: #6b7280;
    min-width: 80px;
  }

  .tx-value {
    font-size: 0.85rem;
    color: #1f2937;
    font-family: 'SF Mono', Monaco, monospace;
  }

  .tx-amount {
    font-size: 0.9rem;
    font-weight: 600;
    color: #10b981;
    font-family: 'SF Mono', Monaco, monospace;
  }

  .tx-hash {
    font-size: 0.85rem;
    color: #3b82f6;
    text-decoration: none;
    font-family: 'SF Mono', Monaco, monospace;
    transition: color 0.2s;
  }

  .tx-hash:hover {
    color: #2563eb;
    text-decoration: underline;
  }
</style>
