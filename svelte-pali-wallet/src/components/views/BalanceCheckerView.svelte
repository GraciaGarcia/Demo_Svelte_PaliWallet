<script>
  import { ethers } from 'ethers'
  import { onMount } from 'svelte'
  import { EVM_WALLET_NETWORKS, hexToDecimalChainId } from '../../lib/chains/evmWalletNetworks'

  // Convertir todas las redes EVM a formato decimal con primera URL RPC
  const NETWORKS = EVM_WALLET_NETWORKS.map(net => ({
    chainId: hexToDecimalChainId(net.chainId),
    name: net.name,
    symbol: net.nativeCurrency.symbol,
    rpcUrl: net.rpcUrls[0] // Usar solo la primera URL
  }))

  let recipientAddress = ''
  let selectedNetwork = NETWORKS[0]?.chainId || '' // Primera red por defecto
  let balance = null
  let loading = false
  let error = ''
  let checkAll = false
  let multiBalances = []
  let history = []

  $: network = NETWORKS.find(n => n.chainId === selectedNetwork)

  // Cargar historial del localStorage
  onMount(() => {
    const saved = localStorage.getItem('balance_check_history')
    if (saved) {
      try {
        history = JSON.parse(saved)
      } catch (e) {
        history = []
      }
    }
  })

  function saveToHistory(data) {
    const entry = {
      ...data,
      timestamp: Date.now(),
      date: new Date().toLocaleString()
    }
    
    // Agregar al inicio
    history = [entry, ...history]
    
    // Mantener solo las últimas 10
    if (history.length > 10) {
      history = history.slice(0, 10)
    }
    
    // Guardar en localStorage
    localStorage.setItem('balance_check_history', JSON.stringify(history))
  }

  function clearHistory() {
    if (confirm('¿Estás seguro de eliminar todo el historial?')) {
      history = []
      localStorage.removeItem('balance_check_history')
    }
  }

  function shortAddress(addr) {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  async function checkBalance() {
    if (!recipientAddress || !ethers.isAddress(recipientAddress)) {
      error = 'Dirección inválida'
      return
    }

    error = ''
    loading = true
    balance = null

    try {
      const provider = new ethers.JsonRpcProvider(network.rpcUrl, undefined, {
        staticNetwork: true
      })
      const rawBalance = await provider.getBalance(recipientAddress)
      balance = ethers.formatEther(rawBalance)
      
      // Guardar en historial
      saveToHistory({
        address: recipientAddress,
        network: network.name,
        chainId: network.chainId,
        symbol: network.symbol,
        balance,
        type: 'single'
      })
    } catch (err) {
      console.error('Error en checkBalance:', err)
      error = 'Error al consultar el saldo en ' + network.name + ': ' + (err.message || 'Red no disponible')
    } finally {
      loading = false
    }
  }

  async function checkAllNetworks() {
    if (!recipientAddress || !ethers.isAddress(recipientAddress)) {
      error = 'Dirección inválida'
      return
    }

    error = ''
    loading = true
    multiBalances = []

    const promises = NETWORKS.map(async (net) => {
      try {
        const provider = new ethers.JsonRpcProvider(net.rpcUrl, undefined, {
          staticNetwork: true
        })
        const rawBalance = await provider.getBalance(recipientAddress)
        return {
          network: net.name,
          chainId: net.chainId,
          symbol: net.symbol,
          balance: ethers.formatEther(rawBalance),
          success: true
        }
      } catch (err) {
        console.error(`Error en ${net.name}:`, err)
        return {
          network: net.name,
          chainId: net.chainId,
          symbol: net.symbol,
          balance: '0',
          success: false,
          error: err.message || 'Red no disponible'
        }
      }
    })

    multiBalances = await Promise.all(promises)
    
    // Guardar en historial
    saveToHistory({
      address: recipientAddress,
      networks: multiBalances.filter(b => b.success).map(b => b.network).join(', '),
      type: 'multiple',
      count: multiBalances.filter(b => b.success).length
    })
    
    loading = false
  }

  function handleSubmit() {
    if (checkAll) {
      checkAllNetworks()
    } else {
      checkBalance()
    }
  }
</script>

<div class="balance-checker-view">
  <div class="view-header">
    <h1 class="view-title">💰 Consultar Saldo</h1>
    <p class="view-subtitle">Verifica el saldo de cualquier dirección sin conectar tu wallet</p>
  </div>

  <div class="checker-card">
    <div class="input-group">
      <label for="address-input" class="input-label">
        <span class="label-icon">📫</span>
        Dirección de Wallet
      </label>
      <input
        id="address-input"
        type="text"
        class="address-input"
        bind:value={recipientAddress}
        placeholder="0x..."
        disabled={loading}
      />
    </div>

    <div class="options-group">
      <div class="checkbox-group">
        <input
          id="check-all"
          type="checkbox"
          bind:checked={checkAll}
          disabled={loading}
        />
        <label for="check-all" class="checkbox-label">
          Consultar en todas las redes ({NETWORKS.length} redes disponibles)
        </label>
      </div>

      {#if !checkAll}
        <div class="network-selector">
          <label for="network-select" class="input-label">
            <span class="label-icon">🌐</span>
            Seleccionar Red
          </label>
          <select
            id="network-select"
            class="network-select"
            bind:value={selectedNetwork}
            disabled={loading}
          >
            {#each NETWORKS as net}
              <option value={net.chainId}>
                {net.name} ({net.symbol})
              </option>
            {/each}
          </select>
        </div>
      {/if}
    </div>

    <button
      type="button"
      class="btn-check"
      on:click={handleSubmit}
      disabled={loading || !recipientAddress}
    >
      {#if loading}
        <span class="spinner"></span>
        Consultando...
      {:else}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {checkAll ? 'Consultar en Todas las Redes' : 'Consultar Saldo'}
      {/if}
    </button>

    {#if error}
      <div class="error-message">
        ⚠️ {error}
      </div>
    {/if}

    {#if balance !== null && !checkAll}
      <div class="result-card">
        <div class="result-header">
          <span class="result-icon">✅</span>
          <h3>Saldo Encontrado</h3>
        </div>
        <div class="result-content">
          <p class="result-address">{shortAddress(recipientAddress)}</p>
          <p class="result-network">{network.name}</p>
          <p class="result-balance">{parseFloat(balance).toFixed(6)} {network.symbol}</p>
        </div>
      </div>
    {/if}

    {#if multiBalances.length > 0}
      <div class="multi-results">
        <div class="multi-header">
          <h3>📊 Saldos en Múltiples Redes</h3>
          <p class="multi-address">{shortAddress(recipientAddress)}</p>
        </div>
        <div class="balances-list">
          {#each multiBalances as item}
            <div class="balance-item" class:unavailable={!item.success}>
              <div class="balance-info">
                <p class="balance-network">{item.network}</p>
                <p class="balance-chain">Chain ID: {item.chainId}</p>
              </div>
              <div class="balance-amount">
                {#if item.success}
                  <span class="amount">{parseFloat(item.balance).toFixed(6)}</span>
                  <span class="symbol">{item.symbol}</span>
                {:else}
                  <span class="unavailable-text">{item.error}</span>
                {/if}
              </div>
            </div>
          {/each}
        </div>
        <div class="multi-summary">
          <p>Total de redes consultadas: {multiBalances.length}</p>
          <p>Redes disponibles: {multiBalances.filter(b => b.success).length}</p>
        </div>
      </div>
    {/if}
  </div>

  <!-- HISTORIAL DE CONSULTAS -->
  {#if history.length > 0}
    <div class="history-section">
      <div class="history-header">
        <h2>📜 Historial de Consultas</h2>
        <button
          type="button"
          class="btn-clear-history"
          on:click={clearHistory}
        >
          🗑️ Limpiar
        </button>
      </div>
      
      <div class="history-list">
        {#each history as entry}
          <div class="history-item">
            <div class="history-icon">
              {#if entry.type === 'single'}
                🔍
              {:else}
                📊
              {/if}
            </div>
            <div class="history-info">
              <p class="history-address">{shortAddress(entry.address)}</p>
              {#if entry.type === 'single'}
                <p class="history-network">{entry.network}</p>
                <p class="history-balance">{parseFloat(entry.balance).toFixed(6)} {entry.symbol}</p>
              {:else}
                <p class="history-network">Consulta múltiple</p>
                <p class="history-balance">{entry.count} redes consultadas</p>
              {/if}
            </div>
            <div class="history-date">
              <p>{entry.date}</p>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <div class="info-section">
    <h3>ℹ️ Información</h3>
    <ul>
      <li>Esta función te permite consultar el saldo de cualquier dirección sin necesidad de conectar tu wallet</li>
      <li>Puedes consultar el saldo en una red específica o en las 2 redes disponibles</li>
      <li>Los datos se obtienen directamente desde los nodos RPC de cada blockchain</li>
      <li>Las últimas 10 consultas se guardan en tu historial local</li>
    </ul>
  </div>
</div>

<style>
  .balance-checker-view {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }

  .view-header {
    margin-bottom: 2rem;
    text-align: center;
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

  .checker-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
  }

  .input-group {
    margin-bottom: 1.5rem;
  }

  .input-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.5rem;
  }

  .label-icon {
    font-size: 1.2rem;
  }

  .address-input {
    width: 100%;
    padding: 0.75rem;
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 0.95rem;
    font-family: 'SF Mono', Monaco, monospace;
    color: #1f2937;
    transition: all 0.2s;
  }

  .address-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .address-input:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }

  .options-group {
    margin-bottom: 1.5rem;
  }

  .checkbox-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .checkbox-label {
    font-size: 0.9rem;
    color: #374151;
    cursor: pointer;
  }

  .network-selector {
    margin-top: 1rem;
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

  .btn-check {
    width: 100%;
    padding: 1rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.2s;
  }

  .btn-check:hover:not(:disabled) {
    background: #2563eb;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  .btn-check:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
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
    to { transform: rotate(360deg); }
  }

  .error-message {
    margin-top: 1rem;
    padding: 0.75rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    color: #dc2626;
    font-size: 0.9rem;
  }

  .result-card {
    margin-top: 1.5rem;
    padding: 1.5rem;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 12px;
  }

  .result-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .result-icon {
    font-size: 1.5rem;
  }

  .result-header h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #166534;
    margin: 0;
  }

  .result-content {
    text-align: center;
  }

  .result-address {
    font-size: 0.9rem;
    color: #6b7280;
    font-family: 'SF Mono', Monaco, monospace;
    margin: 0 0 0.5rem;
  }

  .result-network {
    font-size: 0.85rem;
    color: #6b7280;
    margin: 0 0 1rem;
  }

  .result-balance {
    font-size: 2rem;
    font-weight: 600;
    color: #16a34a;
    font-family: 'SF Mono', Monaco, monospace;
    margin: 0;
  }

  .multi-results {
    margin-top: 1.5rem;
  }

  .multi-header {
    margin-bottom: 1rem;
    text-align: center;
  }

  .multi-header h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 0.5rem;
  }

  .multi-address {
    font-size: 0.9rem;
    color: #6b7280;
    font-family: 'SF Mono', Monaco, monospace;
    margin: 0;
  }

  .balances-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.5rem;
  }

  .balance-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .balance-item:hover {
    background: #f3f4f6;
    border-color: #d1d5db;
  }

  .balance-item.unavailable {
    opacity: 0.6;
  }

  .balance-info {
    flex: 1;
  }

  .balance-network {
    font-size: 0.95rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 0.25rem;
  }

  .balance-chain {
    font-size: 0.8rem;
    color: #6b7280;
    margin: 0;
  }

  .balance-amount {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .amount {
    font-size: 1.1rem;
    font-weight: 600;
    color: #16a34a;
    font-family: 'SF Mono', Monaco, monospace;
  }

  .symbol {
    font-size: 0.85rem;
    color: #6b7280;
    font-weight: 500;
  }

  .unavailable-text {
    font-size: 0.85rem;
    color: #ef4444;
  }

  .multi-summary {
    margin-top: 1rem;
    padding: 1rem;
    background: #f0f9ff;
    border: 1px solid #bfdbfe;
    border-radius: 8px;
    text-align: center;
  }

  .multi-summary p {
    margin: 0.25rem 0;
    font-size: 0.9rem;
    color: #1e40af;
  }

  /* HISTORIAL */
  .history-section {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .history-header h2 {
    font-size: 1.3rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }

  .btn-clear-history {
    padding: 0.5rem 1rem;
    background: white;
    border: 1px solid #dc2626;
    border-radius: 6px;
    color: #dc2626;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-clear-history:hover {
    background: #dc2626;
    color: white;
  }

  .history-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .history-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .history-item:hover {
    background: #f3f4f6;
    border-color: #d1d5db;
  }

  .history-icon {
    font-size: 1.5rem;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #dbeafe;
    border-radius: 50%;
  }

  .history-info {
    flex: 1;
  }

  .history-address {
    font-size: 0.95rem;
    font-weight: 600;
    color: #1f2937;
    font-family: 'SF Mono', Monaco, monospace;
    margin: 0 0 0.25rem;
  }

  .history-network {
    font-size: 0.85rem;
    color: #6b7280;
    margin: 0 0 0.25rem;
  }

  .history-balance {
    font-size: 0.9rem;
    font-weight: 600;
    color: #16a34a;
    font-family: 'SF Mono', Monaco, monospace;
    margin: 0;
  }

  .history-date {
    text-align: right;
  }

  .history-date p {
    font-size: 0.75rem;
    color: #9ca3af;
    margin: 0;
  }

  .info-section {
    background: #fffbeb;
    border: 1px solid #fef3c7;
    border-radius: 12px;
    padding: 1.5rem;
  }

  .info-section h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #92400e;
    margin: 0 0 1rem;
  }

  .info-section ul {
    margin: 0;
    padding-left: 1.5rem;
  }

  .info-section li {
    font-size: 0.9rem;
    color: #78350f;
    margin-bottom: 0.5rem;
  }
</style>
