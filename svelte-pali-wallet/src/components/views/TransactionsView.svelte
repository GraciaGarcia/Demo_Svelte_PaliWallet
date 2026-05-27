<script>
  import { createEventDispatcher } from 'svelte'
  import { EVM_WALLET_NETWORKS } from '../../lib/chains/evmWalletNetworks'
  import TransactionHistorySection from '../wallet/TransactionHistorySection.svelte'
  import { isEtherscanSupported } from '../../lib/transactions/history'

  export let transactions = []
  export let loadingTransactions = false
  export let networkType = 'EVM'
  export let chainId = ''
  export let currentNetworkInfo = null
  export let currentNetwork = ''

  const dispatch = createEventDispatcher()

  // Filtrar solo redes activas (las que no están en removed_networks)
  let removedNetworks = []
  try {
    removedNetworks = JSON.parse(localStorage.getItem('removed_networks') || '[]')
  } catch {
    removedNetworks = []
  }

  $: activeNetworks = EVM_WALLET_NETWORKS.filter(
    (net) => !removedNetworks.includes(net.chainId)
  )

  $: etherscanSupported = isEtherscanSupported(chainId)

  function handleNetworkChange(event) {
    const selectedChainId = event.target.value
    const network = EVM_WALLET_NETWORKS.find((n) => n.chainId === selectedChainId)
    if (network) {
      dispatch('networkchange', {
        kind: 'EVM',
        chainId: network.chainId,
        name: network.name,
        explorerBase: network.blockExplorerUrls[0],
      })
    }
  }

  function handleRefreshFromBlockchain() {
    dispatch('refreshFromBlockchain')
  }
</script>

<div class="transactions-view">
  <div class="view-header">
    <h1 class="view-title">📊 Transacciones</h1>
    <p class="view-subtitle">Historial completo de tus transacciones</p>
  </div>

  <div class="network-selector-card">
    <label for="network-select" class="selector-label">
      <span class="label-icon">🌐</span>
      Seleccionar Red
    </label>
    <select
      id="network-select"
      class="network-select"
      value={chainId}
      on:change={handleNetworkChange}
    >
      {#each activeNetworks as network}
        <option value={network.chainId}>
          {network.name} ({network.nativeCurrency.symbol})
        </option>
      {/each}
    </select>
    <p class="current-network-info">
      Red actual: <strong>{currentNetwork}</strong> · {networkType}
    </p>
    {#if etherscanSupported}
      <div class="blockchain-info">
        <span class="info-icon">✅</span>
        <span class="info-text">Esta red soporta consulta de historial desde blockchain</span>
        <button
          type="button"
          class="btn-refresh-blockchain"
          on:click={handleRefreshFromBlockchain}
          disabled={loadingTransactions}
        >
          {#if loadingTransactions}
            <span class="spinner-small"></span>
          {:else}
            🔄 Actualizar desde Blockchain
          {/if}
        </button>
      </div>
    {:else}
      <div class="blockchain-info warning">
        <span class="info-icon">⚠️</span>
        <span class="info-text">Esta red no soporta consulta automática de historial</span>
      </div>
    {/if}
  </div>

  <div class="transactions-container">
    <TransactionHistorySection
      {transactions}
      {loadingTransactions}
      {networkType}
      {chainId}
      {currentNetworkInfo}
      on:refresh={() => dispatch('refreshTx')}
      on:clear={() => dispatch('clearTx')}
    />
  </div>
</div>

<style>
  .transactions-view {
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

  .network-selector-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .selector-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.75rem;
  }

  .label-icon {
    font-size: 1.2rem;
  }

  .network-select {
    width: 100%;
    padding: 0.75rem;
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 0.95rem;
    color: #1f2937;
    cursor: pointer;
    transition: all 0.2s;
  }

  .network-select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .current-network-info {
    margin: 0.75rem 0 0 0;
    font-size: 0.85rem;
    color: #6b7280;
  }

  .current-network-info strong {
    color: #3b82f6;
    font-weight: 600;
  }

  .transactions-container {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 1.5rem;
  }

  .blockchain-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 1rem;
    padding: 0.75rem;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 8px;
  }

  .blockchain-info.warning {
    background: #fef3c7;
    border: 1px solid #fde68a;
  }

  .info-icon {
    font-size: 1.2rem;
  }

  .info-text {
    font-size: 0.85rem;
    color: #374151;
    flex: 1;
  }

  .btn-refresh-blockchain {
    padding: 0.5rem 1rem;
    background: #10b981;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;
  }

  .btn-refresh-blockchain:hover:not(:disabled) {
    background: #059669;
  }

  .btn-refresh-blockchain:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .spinner-small {
    width: 14px;
    height: 14px;
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
</style>
