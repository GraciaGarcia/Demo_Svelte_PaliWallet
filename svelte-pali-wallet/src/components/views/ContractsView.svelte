<script>
  import { createEventDispatcher } from 'svelte'
  import {
    depositToImprovedWallet,
    withdrawFromImprovedWallet,
    withdrawAllFromImprovedWallet,
    sendThroughImprovedWallet,
    getMyBalanceInContract,
    getContractBalance,
    getContractOwner,
  } from '../../lib/contracts/contractInteraction'

  export let chainId = ''
  export let currentNetwork = ''
  export let networkType = 'EVM'
  export let address = ''
  export let availableAccounts = []

  const dispatch = createEventDispatcher()

  // Detectar Pali Wallet o MetaMask
  // @ts-ignore
  const ethereum = window.ethereum || window.pali

  // Dirección del contrato ImprovedWalletContract
  const CONTRACT_ADDRESS = '0x1fC9203ECC40dFC072bd4b087FE70004A1D2340F'

  let contractBalance = '0.0000'
  let myBalance = '0.0000'
  let contractOwner = ''
  
  // Depositar
  let depositAmount = ''
  
  // Retirar
  let withdrawAmount = ''
  
  // Enviar
  let sendAmount = ''
  let sendRecipient = ''
  
  let loading = false
  let loadingBalance = false
  let error = ''
  let success = ''

  async function loadContractInfo() {
    loadingBalance = true
    error = ''
    try {
      console.log('🔍 Cargando información del contrato...')
      console.log('📍 Dirección del contrato:', CONTRACT_ADDRESS)
      console.log('👤 Dirección del usuario:', address)
      console.log('🔌 Ethereum provider:', ethereum ? 'Disponible' : 'No disponible')

      // Cargar balance del contrato
      const balanceResult = await getContractBalance({ 
        ethereum, 
        contractAddress: CONTRACT_ADDRESS,
        useImprovedABI: true 
      })
      console.log('💰 Balance del contrato:', balanceResult)
      if (balanceResult.ok) {
        contractBalance = balanceResult.balance
        console.log('✅ Balance del contrato cargado:', contractBalance, 'ETH')
      } else {
        console.error('❌ Error cargando balance del contrato:', balanceResult.message)
      }

      // Cargar mi balance en el contrato
      const myBalanceResult = await getMyBalanceInContract({ 
        ethereum, 
        contractAddress: CONTRACT_ADDRESS 
      })
      console.log('👛 Mi balance en el contrato:', myBalanceResult)
      if (myBalanceResult.ok) {
        myBalance = myBalanceResult.balance
        console.log('✅ Mi balance cargado:', myBalance, 'ETH')
      } else {
        console.error('❌ Error cargando mi balance:', myBalanceResult.message)
      }

      // Cargar owner
      const ownerResult = await getContractOwner({ 
        ethereum, 
        contractAddress: CONTRACT_ADDRESS,
        useImprovedABI: true 
      })
      console.log('👑 Owner del contrato:', ownerResult)
      if (ownerResult.ok) {
        contractOwner = ownerResult.owner
        console.log('✅ Owner cargado:', contractOwner)
      } else {
        console.error('❌ Error cargando owner:', ownerResult.message)
      }
    } catch (err) {
      console.error('❌ Error general cargando información del contrato:', err)
      error = err instanceof Error ? err.message : String(err)
    } finally {
      loadingBalance = false
    }
  }

  async function handleDeposit() {
    const amount = parseFloat(depositAmount)
    if (!depositAmount || amount <= 0) {
      error = 'Debes ingresar una cantidad válida mayor a 0'
      return
    }

    if (amount < 0.01) {
      error = 'El contrato requiere mínimo 0.01 ETH'
      return
    }

    loading = true
    error = ''
    success = ''

    try {
      console.log('💰 Depositando:', String(depositAmount), 'ETH al contrato')
      const result = await depositToImprovedWallet({
        ethereum,
        contractAddress: CONTRACT_ADDRESS,
        amount: String(depositAmount), // Convertir explícitamente a string
      })

      console.log('📝 Resultado del depósito:', result)

      if (result.ok) {
        success = `✅ Depósito exitoso! Hash: ${result.txHash.slice(0, 10)}...${result.txHash.slice(-8)}`
        depositAmount = ''
        await loadContractInfo()
        dispatch('refreshAccount')
      } else {
        error = result.message
      }
    } catch (err) {
      console.error('❌ Error en depósito:', err)
      error = err instanceof Error ? err.message : String(err)
    } finally {
      loading = false
    }
  }

  async function handleWithdraw() {
    const amount = parseFloat(withdrawAmount)
    
    if (!withdrawAmount || amount <= 0) {
      error = 'Ingresa una cantidad válida mayor a 0'
      return
    }

    const myBalanceFloat = parseFloat(myBalance)
    if (amount > myBalanceFloat) {
      error = `No tienes suficiente balance. Tu balance: ${myBalanceFloat.toFixed(4)} ETH`
      return
    }

    loading = true
    error = ''
    success = ''

    try {
      console.log('💸 Retirando:', withdrawAmount, 'ETH del contrato')
      const result = await withdrawFromImprovedWallet({
        ethereum,
        contractAddress: CONTRACT_ADDRESS,
        amount: String(withdrawAmount),
      })

      console.log('📝 Resultado del retiro:', result)

      if (result.ok) {
        success = `✅ Retiro exitoso! Hash: ${result.txHash.slice(0, 10)}...${result.txHash.slice(-8)}`
        withdrawAmount = ''
        await loadContractInfo()
        dispatch('refreshAccount')
      } else {
        error = result.message
      }
    } catch (err) {
      console.error('❌ Error en retiro:', err)
      error = err instanceof Error ? err.message : String(err)
    } finally {
      loading = false
    }
  }

  async function handleWithdrawAll() {
    if (parseFloat(myBalance) <= 0) {
      error = 'No tienes fondos para retirar'
      return
    }

    if (!confirm(`¿Estás seguro de retirar todo tu balance (${parseFloat(myBalance).toFixed(4)} ETH)?`)) {
      return
    }

    loading = true
    error = ''
    success = ''

    try {
      const result = await withdrawAllFromImprovedWallet({
        ethereum,
        contractAddress: CONTRACT_ADDRESS,
      })

      if (result.ok) {
        success = `✅ Retiro completo exitoso! Hash: ${result.txHash.slice(0, 10)}...${result.txHash.slice(-8)}`
        await loadContractInfo()
        dispatch('refreshAccount')
      } else {
        error = result.message
      }
    } catch (err) {
      error = err instanceof Error ? err.message : String(err)
    } finally {
      loading = false
    }
  }

  async function handleSendThrough() {
    const amount = parseFloat(sendAmount)
    
    if (!sendAmount || amount <= 0) {
      error = 'Debes ingresar una cantidad válida mayor a 0'
      return
    }

    if (amount < 0.01) {
      error = 'El contrato requiere mínimo 0.01 ETH para enviar'
      return
    }

    if (!sendRecipient) {
      error = 'Ingresa una dirección de destino'
      return
    }

    const myBalanceFloat = parseFloat(myBalance)
    if (amount > myBalanceFloat) {
      error = `No tienes suficiente balance. Tu balance: ${myBalanceFloat.toFixed(4)} ETH`
      return
    }

    loading = true
    error = ''
    success = ''

    try {
      console.log('📤 Enviando:', String(sendAmount), 'ETH a', sendRecipient)
      const result = await sendThroughImprovedWallet({
        ethereum,
        contractAddress: CONTRACT_ADDRESS,
        recipient: sendRecipient,
        amount: String(sendAmount), // Convertir explícitamente a string
      })

      console.log('📝 Resultado del envío:', result)

      if (result.ok) {
        success = `✅ Transferencia exitosa! Hash: ${result.txHash.slice(0, 10)}...${result.txHash.slice(-8)}`
        sendAmount = ''
        sendRecipient = ''
        await loadContractInfo()
        dispatch('refreshAccount')
      } else {
        error = result.message
      }
    } catch (err) {
      console.error('❌ Error en envío:', err)
      error = err instanceof Error ? err.message : String(err)
    } finally {
      loading = false
    }
  }

  // Cargar info al montar el componente
  loadContractInfo()
</script>

<div class="contracts-view">
  <div class="view-header">
    <h1 class="view-title">📄 Contratos</h1>
    <p class="view-subtitle">Interacciones con contratos inteligentes</p>
  </div>

  <div class="network-info-card">
    <span class="info-icon">🌐</span>
    <div>
      <p class="info-label">Red actual</p>
      <p class="info-value">{currentNetwork} · {networkType}</p>
    </div>
  </div>

  <div class="contracts-container">
    <!-- Información del Contrato -->
    <div class="contract-card">
      <div class="contract-header">
        <h3 class="contract-title">📄 ImprovedWallet Contract</h3>
        <button
          type="button"
          class="btn-refresh-balance"
          on:click={loadContractInfo}
          disabled={loadingBalance}
        >
          {#if loadingBalance}
            <span class="spinner-small"></span>
          {:else}
            🔄
          {/if}
        </button>
      </div>
      <div class="contract-info">
        <p class="contract-label">Dirección del contrato:</p>
        <div class="contract-address-row">
          <p class="contract-address">{CONTRACT_ADDRESS}</p>
          <a
            href="https://sepolia.etherscan.io/address/{CONTRACT_ADDRESS}"
            target="_blank"
            rel="noopener noreferrer"
            class="contract-explorer-link"
            title="Ver contrato en Sepolia Etherscan"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Ver en Explorador
          </a>
        </div>
        {#if contractOwner}
          <p class="contract-label">Owner:</p>
          <p class="contract-address">{contractOwner}</p>
        {/if}
        <div class="balance-grid">
          <div class="balance-item">
            <span class="balance-label">Tu balance en el contrato:</span>
            <span class="balance-value">{parseFloat(myBalance).toFixed(4)} ETH</span>
          </div>
          <div class="balance-item">
            <span class="balance-label">Balance total del contrato:</span>
            <span class="balance-value">{parseFloat(contractBalance).toFixed(4)} ETH</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Mensajes -->
    {#if error}
      <div class="alert alert-error">
        <span>❌</span>
        <span>{error}</span>
        <button type="button" class="alert-close" on:click={() => (error = '')}>×</button>
      </div>
    {/if}

    {#if success}
      <div class="alert alert-success">
        <span>✅</span>
        <span>{success}</span>
        <button type="button" class="alert-close" on:click={() => (success = '')}>×</button>
      </div>
    {/if}

    <!-- Formulario de Depósito -->
    <div class="action-card">
      <h3 class="action-title">💰 Depositar al Contrato</h3>
      <p class="action-description">
        Envía ETH al contrato para guardarlo (mínimo 0.01 ETH)
      </p>
      <div class="form-group">
        <label for="deposit-amount">Cantidad (ETH) - Mínimo 0.01</label>
        <input
          id="deposit-amount"
          type="number"
          bind:value={depositAmount}
          placeholder="0.01"
          step="0.01"
          min="0.01"
          class="input-field"
          disabled={loading}
        />
        <p class="input-hint">⚠️ El contrato requiere mínimo 0.01 ETH</p>
      </div>
      <button
        type="button"
        class="btn-action-primary"
        on:click={handleDeposit}
        disabled={loading || !depositAmount || parseFloat(depositAmount) < 0.01}
      >
        {#if loading}
          <span class="spinner-small"></span>
          Procesando...
        {:else}
          Depositar
        {/if}
      </button>
    </div>

    <!-- Formulario de Retiro -->
    <div class="action-card">
      <h3 class="action-title">💸 Retirar del Contrato</h3>
      <p class="action-description">
        Retira tus fondos del contrato a tu cuenta
      </p>
      <div class="form-group">
        <label for="withdraw-amount">Cantidad (ETH)</label>
        <input
          id="withdraw-amount"
          type="number"
          bind:value={withdrawAmount}
          placeholder="0.0"
          step="0.01"
          class="input-field"
          disabled={loading}
        />
        <p class="input-hint">Tu balance: {parseFloat(myBalance).toFixed(4)} ETH</p>
      </div>
      <div class="button-group">
        <button
          type="button"
          class="btn-action-secondary"
          on:click={handleWithdraw}
          disabled={loading || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
        >
          {#if loading}
            <span class="spinner-small"></span>
            Procesando...
          {:else}
            Retirar
          {/if}
        </button>
        <button
          type="button"
          class="btn-action-warning"
          on:click={handleWithdrawAll}
          disabled={loading || parseFloat(myBalance) <= 0}
        >
          Retirar Todo
        </button>
      </div>
    </div>

    <!-- Formulario de Envío a través del Contrato -->
    <div class="action-card">
      <h3 class="action-title">📤 Enviar a través del Contrato</h3>
      <p class="action-description">
        Envía fondos desde tu balance en el contrato a otra cuenta (mínimo 0.01 ETH)
      </p>
      <div class="form-group">
        <label for="send-recipient-select">Transferir a</label>
        <select id="send-recipient-select" bind:value={sendRecipient} class="select-field">
          <option value="">Selecciona una cuenta o ingresa dirección</option>
          {#each availableAccounts as account}
            <option value={account.address}>
              {account.name} ({account.address.slice(0, 6)}...{account.address.slice(-4)})
            </option>
          {/each}
        </select>
        <p class="or-text">O ingresa una dirección manualmente:</p>
        <input
          id="send-recipient"
          type="text"
          bind:value={sendRecipient}
          placeholder="0x..."
          class="input-field"
          disabled={loading}
        />
      </div>
      <div class="form-group">
        <label for="send-amount">Cantidad (ETH) - Mínimo 0.01</label>
        <input
          id="send-amount"
          type="number"
          bind:value={sendAmount}
          placeholder="0.01"
          step="0.01"
          min="0.01"
          class="input-field"
          disabled={loading}
        />
        <p class="input-hint">Tu balance: {parseFloat(myBalance).toFixed(4)} ETH</p>
      </div>
      <button
        type="button"
        class="btn-action-primary"
        on:click={handleSendThrough}
        disabled={loading || !sendAmount || !sendRecipient || parseFloat(sendAmount) < 0.01}
      >
        {#if loading}
          <span class="spinner-small"></span>
          Procesando...
        {:else}
          Enviar
        {/if}
      </button>
    </div>

    <!-- Información del Contrato -->
    <div class="info-card">
      <h3 class="info-title">ℹ️ Cómo funciona</h3>
      <div class="info-list">
        <div class="info-item">
          <span class="info-icon">1️⃣</span>
          <div>
            <p class="info-item-title">Deposita ETH</p>
            <p class="info-item-text">Envía ETH al contrato (mínimo 0.01). Se guarda en tu balance.</p>
          </div>
        </div>
        <div class="info-item">
          <span class="info-icon">2️⃣</span>
          <div>
            <p class="info-item-title">Usa tus fondos</p>
            <p class="info-item-text">Envía a otras cuentas o retira cuando quieras.</p>
          </div>
        </div>
        <div class="info-item">
          <span class="info-icon">3️⃣</span>
          <div>
            <p class="info-item-title">Retira cuando quieras</p>
            <p class="info-item-text">Retira parcial o totalmente tus fondos a tu cuenta.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .contracts-view {
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

  .network-info-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 1rem 1.5rem;
    margin-bottom: 2rem;
  }

  .info-icon {
    font-size: 1.5rem;
  }

  .info-label {
    font-size: 0.75rem;
    color: #6b7280;
    margin: 0 0 0.25rem;
  }

  .info-value {
    font-size: 0.95rem;
    font-weight: 600;
    color: #3b82f6;
    margin: 0;
  }

  .contracts-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .contract-card {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border-radius: 12px;
    padding: 1.5rem;
    color: white;
  }

  .contract-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .contract-title {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0;
  }

  .btn-refresh-balance {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    padding: 0.5rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
  }

  .btn-refresh-balance:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.3);
  }

  .btn-refresh-balance:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .contract-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .contract-label {
    font-size: 0.85rem;
    margin: 0;
    opacity: 0.9;
  }

  .contract-address {
    font-size: 0.9rem;
    font-family: 'SF Mono', Monaco, monospace;
    margin: 0 0 1rem;
    word-break: break-all;
    background: rgba(255, 255, 255, 0.1);
    padding: 0.5rem;
    border-radius: 6px;
  }

  .contract-address-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .contract-address-row .contract-address {
    flex: 1;
    margin: 0;
  }

  .contract-explorer-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.15);
    color: white;
    text-decoration: none;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 500;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .contract-explorer-link:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-1px);
  }

  .contract-balance-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(255, 255, 255, 0.1);
    padding: 1rem;
    border-radius: 8px;
  }

  .balance-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .balance-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.1);
    padding: 1rem;
    border-radius: 8px;
  }

  .balance-label {
    font-size: 0.9rem;
  }

  .balance-value {
    font-size: 1.3rem;
    font-weight: 600;
    font-family: 'SF Mono', Monaco, monospace;
  }

  .alert {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: 8px;
    font-size: 0.9rem;
  }

  .alert-error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #991b1b;
  }

  .alert-success {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    color: #166534;
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

  .action-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 1.5rem;
  }

  .action-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 0.5rem;
  }

  .action-description {
    font-size: 0.9rem;
    color: #6b7280;
    margin: 0 0 1.5rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    display: block;
    font-size: 0.9rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.5rem;
  }

  .input-field {
    width: 100%;
    padding: 0.75rem;
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 0.95rem;
    color: #1f2937;
    transition: all 0.2s;
  }

  .input-field:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .input-field:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }

  .input-hint {
    font-size: 0.8rem;
    color: #f59e0b;
    margin: 0.5rem 0 0 0;
  }

  .select-field {
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

  .select-field:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .or-text {
    font-size: 0.8rem;
    color: #6b7280;
    text-align: center;
    margin: 0.75rem 0 0.5rem;
  }

  .btn-action-primary,
  .btn-action-secondary {
    width: 100%;
    padding: 0.75rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .btn-action-primary {
    background: #10b981;
    color: white;
  }

  .btn-action-primary:hover:not(:disabled) {
    background: #059669;
  }

  .btn-action-secondary {
    background: #f59e0b;
    color: white;
  }

  .btn-action-secondary:hover:not(:disabled) {
    background: #d97706;
  }

  .btn-action-primary:disabled,
  .btn-action-secondary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .spinner-small {
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

  .info-card {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 1.5rem;
  }

  .info-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 1rem;
  }

  .info-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .info-item {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
  }

  .info-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .info-item-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: #374151;
    margin: 0 0 0.25rem;
  }

  .info-item-text {
    font-size: 0.85rem;
    color: #6b7280;
    margin: 0;
    line-height: 1.4;
  }

  .btn-action-warning {
    width: 100%;
    padding: 0.75rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: #f59e0b;
    color: white;
  }

  .btn-action-warning:hover:not(:disabled) {
    background: #d97706;
  }

  .btn-action-warning:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .button-group {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

</style>