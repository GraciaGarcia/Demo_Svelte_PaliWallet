<script>
  import { onMount } from 'svelte'

  // Solo Sepolia
  const NETWORK = {
    chainId: '11155111',
    name: 'Ethereum Sepolia',
    symbol: 'ETH',
    explorerUrl: 'https://sepolia.etherscan.io'
  }

  // Datos falsos del faucet
  const FAUCET_INFO = {
    balance: '10.5000',
    amountPerRequest: '0.1000',
    cooldownMinutes: 60
  }

  // Historial falso de solicitudes (solo Sepolia)
  const MOCK_HISTORY = [
    {
      recipient: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      amount: '0.1000',
      date: 'June 19, 2026 2:30:00 AM',
      txHash: '0xabc123def456789012345678901234567890abcd',
      status: 'Completado'
    },
    {
      recipient: '0x1C0659e1e59edc901c9e78858f388968274a497b',
      amount: '0.1000',
      date: 'June 19, 2026 1:15:00 AM',
      txHash: '0xdef456abc789012345678901234567890abcdef1',
      status: 'Completado'
    }
  ]

  let recipientAddress = ''
  let loading = false
  let error = ''
  let success = false
  let history = []

  // Cargar historial del localStorage
  onMount(() => {
    const saved = localStorage.getItem('faucet_history_sepolia')
    if (saved) {
      try {
        history = JSON.parse(saved)
      } catch (e) {
        history = [...MOCK_HISTORY]
      }
    } else {
      // Si no hay historial guardado, usar datos falsos
      history = [...MOCK_HISTORY]
    }
  })

  function shortAddress(addr) {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  function isValidAddress(addr) {
    return addr && addr.startsWith('0x') && addr.length === 42
  }

  function saveToHistory(data) {
    const entry = {
      ...data,
      date: new Date().toLocaleString(),
      status: 'Completado'
    }
    
    // Agregar al inicio
    history = [entry, ...history]
    
    // Mantener solo las últimas 10
    if (history.length > 10) {
      history = history.slice(0, 10)
    }
    
    // Guardar en localStorage
    localStorage.setItem('faucet_history_sepolia', JSON.stringify(history))
  }

  function clearHistory() {
    if (confirm('¿Estás seguro de eliminar todo el historial del faucet?')) {
      history = [...MOCK_HISTORY] // Restaurar datos falsos
      localStorage.setItem('faucet_history_sepolia', JSON.stringify(history))
    }
  }

  async function requestFromFaucet() {
    if (!recipientAddress || !isValidAddress(recipientAddress)) {
      error = 'Dirección inválida. Debe ser una dirección Ethereum válida (0x...)'
      return
    }

    error = ''
    success = false
    loading = true

    // Simular delay de transacción
    await new Promise(resolve => setTimeout(resolve, 1500))

    try {
      // Simular transacción exitosa
      const mockTxHash = '0x' + Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2)
      
      // Guardar en historial
      saveToHistory({
        recipient: recipientAddress,
        amount: FAUCET_INFO.amountPerRequest,
        txHash: mockTxHash
      })
      
      success = true
      
      // Limpiar form después de 3 segundos
      setTimeout(() => {
        success = false
        recipientAddress = ''
      }, 3000)
      
    } catch (err) {
      console.error('Error:', err)
      error = 'Error al solicitar tokens'
    } finally {
      loading = false
    }
  }
</script>

<div class="faucet-view">
  <div class="view-header">
    <h1 class="view-title">🚰 Faucet Público</h1>
    <p class="view-subtitle">Recibe tokens de prueba sin necesidad de conectar tu wallet - Solo Sepolia</p>
  </div>

  <div class="faucet-card">
    <!-- Info de la red -->
    <div class="network-badge">
      <span class="network-icon">🌐</span>
      <span class="network-name">{NETWORK.name}</span>
    </div>

    <!-- Info del Faucet -->
    <div class="faucet-info">
      <div class="info-item">
        <span class="info-label">Balance del Faucet:</span>
        <span class="info-value">{FAUCET_INFO.balance} {NETWORK.symbol}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Cantidad por solicitud:</span>
        <span class="info-value">{FAUCET_INFO.amountPerRequest} {NETWORK.symbol}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Tiempo de espera:</span>
        <span class="info-value">{FAUCET_INFO.cooldownMinutes} minutos</span>
      </div>
    </div>

    <!-- Input de dirección -->
    <div class="input-group">
      <label for="recipient-input" class="input-label">
        <span class="label-icon">📫</span>
        Dirección de destino
      </label>
      <input
        id="recipient-input"
        type="text"
        class="address-input"
        bind:value={recipientAddress}
        placeholder="0x..."
        disabled={loading}
      />
      {#if recipientAddress && isValidAddress(recipientAddress)}
        <p class="address-preview">✓ {shortAddress(recipientAddress)}</p>
      {/if}
    </div>

    <!-- Botón de solicitud -->
    <button
      type="button"
      class="btn-request"
      on:click={requestFromFaucet}
      disabled={loading || !recipientAddress}
    >
      {#if loading}
        <span class="spinner"></span>
        Procesando solicitud...
      {:else}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M7 10l5 5 5-5" />
          <path d="M12 15V3" />
          <rect x="3" y="19" width="18" height="2" />
        </svg>
        Solicitar Tokens
      {/if}
    </button>

    {#if error}
      <div class="message error-message">
        ⚠️ {error}
      </div>
    {/if}

    {#if success}
      <div class="message success-message">
        <p>✅ ¡Solicitud exitosa!</p>
        <p>Se han enviado {FAUCET_INFO.amountPerRequest} {NETWORK.symbol} a {shortAddress(recipientAddress)}</p>
        <p class="hint-text">Revisa el historial abajo para ver los detalles</p>
      </div>
    {/if}
  </div>

  <!-- HISTORIAL DE SOLICITUDES -->
  {#if history.length > 0}
    <div class="history-section">
      <div class="history-header">
        <h2>📜 Historial de Solicitudes</h2>
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
            <div class="history-icon">🚰</div>
            <div class="history-info">
              <p class="history-recipient">
                <strong>Para:</strong> {shortAddress(entry.recipient)}
              </p>
              <p class="history-amount">
                <strong>Cantidad:</strong> {entry.amount} {NETWORK.symbol}
              </p>
              <p class="history-status">
                <span class="status-badge">{entry.status}</span>
              </p>
            </div>
            <div class="history-right">
              <p class="history-date">{entry.date}</p>
              <a 
                href="{NETWORK.explorerUrl}/tx/{entry.txHash}" 
                target="_blank" 
                rel="noopener noreferrer"
                class="history-link"
              >
                Ver TX: {shortAddress(entry.txHash)}
              </a>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Información adicional -->
  <div class="info-section">
    <h3>ℹ️ ¿Cómo funciona el Faucet?</h3>
    <ul>
      <li>Este faucet solo funciona en <strong>Ethereum Sepolia</strong> (red de prueba)</li>
      <li>Ingresa la dirección de wallet que recibirá los tokens</li>
      <li>Recibirás {FAUCET_INFO.amountPerRequest} {NETWORK.symbol} por solicitud</li>
      <li>Debes esperar {FAUCET_INFO.cooldownMinutes} minutos antes de solicitar nuevamente</li>
      <li>Los tokens son de prueba y no tienen valor real</li>
      <li>No necesitas conectar tu wallet para usar el faucet</li>
      <li>El historial muestra las últimas 10 solicitudes realizadas</li>
    </ul>
  </div>
</div>

<style>
  .faucet-view {
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
    font-size: 0.95rem;
    color: #6b7280;
    margin: 0;
  }

  .faucet-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
  }

  .network-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: #dbeafe;
    border: 1px solid #93c5fd;
    border-radius: 8px;
    margin-bottom: 1.5rem;
  }

  .network-icon {
    font-size: 1.2rem;
  }

  .network-name {
    font-size: 1rem;
    font-weight: 600;
    color: #1e40af;
  }

  .faucet-info {
    background: #f0f9ff;
    border: 1px solid #bfdbfe;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1.5rem;
  }

  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    border-bottom: 1px solid #e0f2fe;
  }

  .info-item:last-child {
    border-bottom: none;
  }

  .info-label {
    font-size: 0.9rem;
    color: #1e40af;
  }

  .info-value {
    font-size: 0.95rem;
    font-weight: 600;
    color: #1e3a8a;
    font-family: 'SF Mono', Monaco, monospace;
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

  .address-preview {
    margin-top: 0.5rem;
    font-size: 0.85rem;
    color: #10b981;
    font-family: 'SF Mono', Monaco, monospace;
    font-weight: 500;
  }

  .btn-request {
    width: 100%;
    padding: 1rem;
    background: #10b981;
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

  .btn-request:hover:not(:disabled) {
    background: #059669;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }

  .btn-request:disabled {
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

  .message {
    margin-top: 1rem;
    padding: 1rem;
    border-radius: 8px;
    font-size: 0.9rem;
  }

  .error-message {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
  }

  .success-message {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    color: #166534;
  }

  .success-message p {
    margin: 0.25rem 0;
  }

  .hint-text {
    font-size: 0.85rem;
    color: #059669;
    font-style: italic;
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
    flex-shrink: 0;
  }

  .history-info {
    flex: 1;
  }

  .history-recipient, .history-amount, .history-status {
    font-size: 0.85rem;
    margin: 0.15rem 0;
    color: #374151;
  }

  .status-badge {
    display: inline-block;
    padding: 0.15rem 0.5rem;
    background: #dcfce7;
    color: #166534;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .history-right {
    text-align: right;
    flex-shrink: 0;
  }

  .history-date {
    font-size: 0.75rem;
    color: #9ca3af;
    margin: 0 0 0.5rem 0;
  }

  .history-link {
    font-size: 0.8rem;
    color: #3b82f6;
    text-decoration: underline;
    font-family: 'SF Mono', Monaco, monospace;
  }

  .history-link:hover {
    color: #2563eb;
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

  .info-section strong {
    color: #92400e;
  }
</style>
