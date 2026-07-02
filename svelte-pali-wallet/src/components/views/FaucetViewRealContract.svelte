<script>
  import { onMount } from 'svelte'
  import { ethers } from 'ethers'
  import { getFaucetConfig, hasFaucetContract } from '../../lib/contracts/faucetConfig'
  import { FAUCET_ABI } from '../../lib/contracts/faucetABI'

  let recipientAddress = ''
  let selectedChainId = '560048' // Hoodi por defecto (Chain ID correcto)
  let loading = false
  let error = ''
  let success = false
  let successMessage = ''
  
  // Estado del contrato
  let contractBalance = '0'
  let amountPerRequest = '0'
  let cooldownTime = 0
  let canRequestNow = true
  let timeRemaining = 0
  
  // Historial desde el explorer
  let history = []
  let loadingHistory = false

  $: config = getFaucetConfig(selectedChainId)
  $: hasContract = hasFaucetContract(selectedChainId)
  
  onMount(() => {
    if (hasContract) {
      loadContractInfo()
      loadFaucetHistory()
    }
  })
  
  // Recargar cuando cambia la red
  $: if (selectedChainId && hasContract) {
    // Pequeño delay para asegurar que config se actualiza
    setTimeout(() => {
      loadContractInfo()
      loadFaucetHistory()
    }, 100)
  }

  function shortAddress(addr) {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  function isValidAddress(addr) {
    return addr && ethers.isAddress(addr)
  }

  /**
   * Cargar información del contrato (balance, amount, cooldown)
   */
  async function loadContractInfo() {
    if (!config) {
      console.log('❌ No hay config para cargar info del contrato')
      return
    }
    
    console.log('🔍 Cargando info del contrato...')
    console.log('📍 Chain ID:', selectedChainId)
    console.log('📍 Contrato:', config.address)
    console.log('📍 RPC:', config.rpcUrl)
    
    try {
      // Intentar primero con el provider del navegador si está disponible
      // @ts-ignore
      const ethereum = window.ethereum || window.pali
      let provider
      
      if (ethereum) {
        console.log('✅ Usando provider del navegador')
        provider = new ethers.BrowserProvider(ethereum)
      } else {
        console.log('⚠️ Usando JsonRpcProvider')
        provider = new ethers.JsonRpcProvider(config.rpcUrl)
      }
      
      const faucetContract = new ethers.Contract(
        config.address,
        FAUCET_ABI,
        provider
      )
      
      console.log('📞 Llamando a funciones del contrato...')
      
      const [balance, amount, cooldown] = await Promise.all([
        faucetContract.getBalance(),
        faucetContract.amount(),
        faucetContract.cooldown()
      ])
      
      console.log('✅ Respuestas del contrato:')
      console.log('  - Balance:', balance.toString())
      console.log('  - Amount:', amount.toString())
      console.log('  - Cooldown:', cooldown.toString())
      
      contractBalance = ethers.formatEther(balance)
      amountPerRequest = ethers.formatEther(amount)
      cooldownTime = Number(cooldown)
      
      console.log('✅ Info del contrato cargada:')
      console.log('  - Balance formateado:', contractBalance)
      console.log('  - Amount formateado:', amountPerRequest)
      console.log('  - Cooldown:', cooldownTime)
    } catch (err) {
      console.error('❌ Error cargando info del contrato:', err)
      console.error('Detalles del error:', err.message)
      console.error('Stack:', err.stack)
    }
  }

  /**
   * Verificar si una dirección puede solicitar tokens
   */
  async function checkCanRequest() {
    if (!config || !recipientAddress || !isValidAddress(recipientAddress)) {
      canRequestNow = true
      timeRemaining = 0
      return
    }
    
    try {
      const provider = new ethers.JsonRpcProvider(config.rpcUrl)
      const faucetContract = new ethers.Contract(
        config.address,
        FAUCET_ABI,
        provider
      )
      
      const [canReq, timeLeft] = await Promise.all([
        faucetContract.canRequest(recipientAddress),
        faucetContract.nextRequestTime(recipientAddress)  // ← Cambiado de timeUntilNextRequest
      ])
      
      canRequestNow = canReq
      timeRemaining = Number(timeLeft)
    } catch (err) {
      console.error('Error verificando cooldown:', err)
    }
  }
  
  // Verificar cooldown cuando cambia la dirección
  $: if (recipientAddress && isValidAddress(recipientAddress)) {
    checkCanRequest()
  }

  /**
   * Solicitar tokens del faucet (requiere firma de transacción)
   */
  async function requestFromFaucet() {
    if (!recipientAddress || !isValidAddress(recipientAddress)) {
      error = 'Dirección inválida. Debe ser una dirección válida (0x...)'
      return
    }
    
    if (!hasContract || !config) {
      error = 'No hay contrato faucet configurado para esta red'
      return
    }
    
    error = ''
    success = false
    loading = true

    try {
      // Verificar que hay una wallet disponible
      // @ts-ignore
      const ethereum = window.ethereum || window.pali
      
      if (!ethereum) {
        error = '❌ Se necesita Pali Wallet o MetaMask para solicitar tokens. Por favor, instala una wallet.'
        loading = false
        return
      }

      // Solicitar cuenta si no está conectada
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      
      if (!accounts || accounts.length === 0) {
        error = 'No se pudo conectar con la wallet'
        loading = false
        return
      }

      // Verificar que estamos en la red correcta
      const currentChainId = await ethereum.request({ method: 'eth_chainId' })
      const expectedChainId = '0x' + parseInt(selectedChainId).toString(16)
      
      console.log('🔍 Verificación de red:')
      console.log('  - Chain ID actual (hex):', currentChainId)
      console.log('  - Chain ID actual (dec):', parseInt(currentChainId, 16))
      console.log('  - Chain ID esperado (hex):', expectedChainId)
      console.log('  - Chain ID esperado (dec):', selectedChainId)
      
      if (currentChainId.toLowerCase() !== expectedChainId.toLowerCase()) {
        error = `⚠️ Red incorrecta. Tu wallet está en Chain ID ${parseInt(currentChainId, 16)}, pero necesitas estar en Chain ID ${selectedChainId} (Hoodi)`
        loading = false
        return
      }
      
      console.log('✅ Red correcta!')

      // Crear provider con firma
      const provider = new ethers.BrowserProvider(ethereum)
      const signer = await provider.getSigner()
      
      // Conectar al contrato con el signer para poder enviar transacciones
      const faucetContract = new ethers.Contract(
        config.address,
        FAUCET_ABI,
        signer
      )
      
      // Llamar a la función requestFunds con la dirección del destinatario
      console.log('📞 Llamando a requestFunds...')
      console.log('   Destinatario:', recipientAddress)
      console.log('   Contrato:', config.address)
      
      const tx = await faucetContract.requestFunds(recipientAddress)
      
      console.log('✅ Transacción enviada')
      console.log('   TX Hash:', tx.hash)
      console.log('   From:', tx.from)
      console.log('   To:', tx.to)
      console.log('   Value:', ethers.formatEther(tx.value || 0), 'ETH')
      
      successMessage = `⏳ Transacción enviada. Esperando confirmación...`
      success = true
      
      // Esperar confirmación
      console.log('⏳ Esperando confirmación...')
      const receipt = await tx.wait()
      
      console.log('✅ Transacción confirmada')
      console.log('   Block:', receipt.blockNumber)
      console.log('   Gas usado:', receipt.gasUsed.toString())
      console.log('   Status:', receipt.status === 1 ? 'SUCCESS' : 'FAILED')
      
      // Verificar eventos
      if (receipt.logs && receipt.logs.length > 0) {
        console.log('📜 Eventos emitidos:', receipt.logs.length)
        receipt.logs.forEach((log, index) => {
          console.log(`   Evento ${index}:`, log)
        })
      } else {
        console.log('⚠️ No se emitieron eventos')
      }
      
      successMessage = `✅ ¡Tokens enviados! ${amountPerRequest} ${config.symbol} transferidos a ${shortAddress(recipientAddress)}`
      
      // Recargar información
      await loadContractInfo()
      await loadFaucetHistory()
      
      // Limpiar después de 5 segundos
      setTimeout(() => {
        success = false
        recipientAddress = ''
      }, 5000)
      
    } catch (err) {
      console.error('Error en la solicitud:', err)
      if (err.code === 4001) {
        error = '❌ Transacción rechazada por el usuario'
      } else if (err.message.includes('cooldown') || err.message.includes('5 minutos')) {
        error = '⏰ Debes esperar 5 minutos antes de solicitar nuevamente'
      } else if (err.message.includes('Faucet sin fondos')) {
        error = '💧 El faucet no tiene fondos suficientes'
      } else if (err.message.includes('insufficient funds')) {
        error = '⚠️ No tienes suficiente saldo para pagar el gas de la transacción'
      } else {
        error = '❌ Error al solicitar tokens: ' + (err.reason || err.message)
      }
    } finally {
      loading = false
    }
  }

  /**
   * Cargar historial desde el explorer o directamente del contrato
   */
  async function loadFaucetHistory() {
    if (!config) {
      console.log('❌ No hay config para cargar historial')
      return
    }
    
    console.log('📜 Cargando historial del faucet...')
    loadingHistory = true
    
    try {
      // Intentar obtener eventos directamente del contrato usando el provider
      console.log('📡 Conectando al provider para obtener eventos...')
      
      // @ts-ignore
      const ethereum = window.ethereum || window.pali
      let provider
      
      if (ethereum) {
        console.log('✅ Usando provider del navegador')
        provider = new ethers.BrowserProvider(ethereum)
      } else {
        console.log('⚠️ Usando JsonRpcProvider')
        provider = new ethers.JsonRpcProvider(config.rpcUrl)
      }
      
      const faucetContract = new ethers.Contract(
        config.address,
        FAUCET_ABI,
        provider
      )
      
      console.log('🔍 Buscando eventos FaucetSent...')
      
      // Obtener eventos FaucetSent desde el bloque 0
      const filter = faucetContract.filters.FaucetSent()
      const events = await faucetContract.queryFilter(filter, 0, 'latest')
      
      console.log(`✅ Encontrados ${events.length} eventos`)
      
      if (events.length > 0) {
        history = await Promise.all(
          events.map(async (event) => {
            const block = await event.getBlock()
            return {
              recipient: event.args[0],
              amount: ethers.formatEther(event.args[1]),
              timestamp: Number(event.args[2]),
              txHash: event.transactionHash,
              blockNumber: event.blockNumber,
              blockTime: block.timestamp
            }
          })
        )
        
        // Ordenar por más reciente primero
        history = history
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 20) // Últimas 20 transacciones
        
        console.log('✅ Historial cargado:', history.length, 'transacciones')
      } else {
        console.log('⚠️ No se encontraron transacciones')
        history = []
      }
      
    } catch (err) {
      console.error('❌ Error cargando historial:', err)
      console.error('Detalles:', err.message)
      
      // Si falla, intentar con la API del explorer (método alternativo)
      try {
        console.log('🔄 Intentando con API del explorer...')
        const url = `${config.explorerApi}?module=logs&action=getLogs` +
          `&address=${config.address}` +
          `&fromBlock=0` +
          `&toBlock=latest` +
          `&topic0=0x` + ethers.id("FaucetSent(address,uint256,uint256)").slice(2) +
          (config.apiKey ? `&apikey=${config.apiKey}` : '')
        
        console.log('📡 URL:', url)
        
        const response = await fetch(url)
        const data = await response.json()
        
        console.log('📊 Respuesta del explorer:', data)
        
        if (data.status === '1' && data.result && Array.isArray(data.result)) {
          const iface = new ethers.Interface(FAUCET_ABI)
          
          history = data.result
            .map(log => {
              try {
                const decoded = iface.parseLog({
                  topics: log.topics,
                  data: log.data
                })
                
                return {
                  recipient: decoded.args[0],
                  amount: ethers.formatEther(decoded.args[1]),
                  timestamp: Number(decoded.args[2]),
                  txHash: log.transactionHash,
                  blockNumber: parseInt(log.blockNumber, 16)
                }
              } catch (err) {
                console.error('Error decodificando log:', err)
                return null
              }
            })
            .filter(e => e !== null)
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 20)
          
          console.log('✅ Historial cargado desde explorer:', history.length, 'transacciones')
        } else {
          console.log('⚠️ Explorer no devolvió resultados:', data)
          history = []
        }
      } catch (explorerErr) {
        console.error('❌ Error con API del explorer:', explorerErr)
        history = []
      }
    } finally {
      loadingHistory = false
    }
  }
  
  function formatDate(timestamp) {
    return new Date(timestamp * 1000).toLocaleString()
  }
  
  function formatTimeRemaining(seconds) {
    if (seconds === 0) return 'Disponible ahora'
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`
    if (minutes > 0) return `${minutes}m ${secs}s`
    return `${secs}s`
  }
</script>


<div class="faucet-view">
  <div class="view-header">
    <h1 class="view-title">🚰 Faucet Público con Smart Contract</h1>
    <p class="view-subtitle">Recibe tokens de prueba de contratos reales - Solo conecta tu wallet para firmar</p>
  </div>

  <!-- Selector de Red -->
  <div class="network-selector-card">
    <label for="network-select" class="selector-label">
      <span class="label-icon">🌐</span>
      Seleccionar Red
    </label>
    <select
      id="network-select"
      class="network-select"
      bind:value={selectedChainId}
      disabled={loading}
    >
      <option value="560048">Ethereum Hoodi EVM (Chain ID: 560048) ✅</option>
      <option value="11155111">Sepolia (Ethereum Testnet) - Próximamente</option>
      <option value="80001">Mumbai (Polygon Testnet) - Próximamente</option>
      <option value="97">BSC Testnet - Próximamente</option>
    </select>
  </div>


  {#if !hasContract}
    <div class="warning-card">
      <h3>⚠️ Contrato no configurado</h3>
      <p>El contrato de faucet no está desplegado en esta red.</p>
      <p>Por favor, despliega el contrato y actualiza la dirección en <code>faucetConfig.ts</code></p>
    </div>
  {:else}
    <div class="faucet-card">
      <!-- Info del Contrato -->
      <div class="contract-info">
        <div class="info-row">
          <span class="info-label">Dirección del Contrato:</span>
          <a 
            href="{config.explorerUrl}/address/{config.address}" 
            target="_blank"
            class="info-link"
          >
            {shortAddress(config.address)}
          </a>
        </div>
        <div class="info-row">
          <span class="info-label">Balance del Faucet:</span>
          <span class="info-value">{parseFloat(contractBalance).toFixed(4)} {config.symbol}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Cantidad por solicitud:</span>
          <span class="info-value">{parseFloat(amountPerRequest).toFixed(4)} {config.symbol}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Tiempo de espera:</span>
          <span class="info-value">{cooldownTime / 60} minutos</span>
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
          <p class="address-status">
            ✓ Dirección válida: {shortAddress(recipientAddress)}
          </p>
          {#if !canRequestNow}
            <p class="cooldown-warning">
              ⏰ Tiempo restante: {formatTimeRemaining(timeRemaining)}
            </p>
          {/if}
        {/if}
      </div>

      <!-- Botón de solicitud -->
      <button
        type="button"
        class="btn-request"
        class:disabled={!canRequestNow}
        on:click={requestFromFaucet}
        disabled={loading || !recipientAddress || !canRequestNow}
      >
        {#if loading}
          <span class="spinner"></span>
          Procesando...
        {:else if !canRequestNow}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Esperando cooldown
        {:else}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M7 10l5 5 5-5" />
            <path d="M12 15V3" />
            <rect x="3" y="19" width="18" height="2" />
          </svg>
          Solicitar {amountPerRequest} {config.symbol}
        {/if}
      </button>

      {#if error}
        <div class="message error-message">
          ⚠️ {error}
        </div>
      {/if}

      {#if success}
        <div class="message success-message">
          {successMessage}
        </div>
      {/if}
    </div>


    <!-- HISTORIAL DESDE BLOCKCHAIN -->
    <div class="history-section">
      <div class="history-header">
        <h2>📜 Historial de Transacciones (Blockchain)</h2>
        <button
          type="button"
          class="btn-refresh"
          on:click={loadFaucetHistory}
          disabled={loadingHistory}
        >
          {#if loadingHistory}
            <span class="spinner-small"></span>
          {:else}
            🔄
          {/if}
          Actualizar
        </button>
      </div>
      
      {#if loadingHistory}
        <p class="loading-text">Cargando historial desde blockchain...</p>
      {:else if history.length === 0}
        <p class="empty-text">No hay transacciones registradas aún</p>
      {:else}
        <div class="history-list">
          {#each history as entry}
            <div class="history-item">
              <div class="history-icon">🚰</div>
              <div class="history-info">
                <p class="history-recipient">
                  <strong>Para:</strong> {shortAddress(entry.recipient)}
                </p>
                <p class="history-amount">
                  <strong>Cantidad:</strong> {parseFloat(entry.amount).toFixed(4)} {config.symbol}
                </p>
                <p class="history-date">
                  {formatDate(entry.timestamp)}
                </p>
              </div>
              <div class="history-right">
                <a 
                  href="{config.explorerUrl}/tx/{entry.txHash}" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="history-link"
                >
                  Ver TX ↗
                </a>
                <p class="history-block">Block: {entry.blockNumber}</p>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}

  <!-- Información adicional -->
  <div class="info-section">
    <h3>ℹ️ Cómo funciona</h3>
    <ul>
      <li><strong>Contrato Real:</strong> Este faucet usa un smart contract desplegado en blockchain</li>
      <li><strong>Transacciones Verificables:</strong> Todas las transacciones son públicas y verificables</li>
      <li><strong>Conexión Rápida:</strong> Solo necesitas conectar tu wallet para firmar la transacción</li>
      <li><strong>No requiere iniciar sesión:</strong> Puedes usar el faucet sin estar autenticado en la aplicación</li>
      <li><strong>Cooldown:</strong> Debes esperar {cooldownTime / 60} minutos entre solicitudes</li>
      <li><strong>Historial Real:</strong> El historial se obtiene directamente desde la blockchain</li>
      <li><strong>Multi-Red:</strong> Puedes desplegar el contrato en diferentes testnets</li>
    </ul>
  </div>
</div>


<style>
  /* Tema oscuro inspirado en la imagen - Gradientes rosa/púrpura */
  
  .faucet-view {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
    background: transparent;
  }

  .view-header {
    margin-bottom: 2.5rem;
    text-align: center;
  }

  .view-title {
    font-size: 2.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, #e879f9 0%, #a855f7 50%, #ec4899 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 0.75rem;
    letter-spacing: -0.02em;
  }

  .view-subtitle {
    font-size: 1rem;
    color: #9ca3af;
    margin: 0;
  }

  .network-selector-card {
    background: rgba(30, 30, 46, 0.6);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(168, 85, 247, 0.2);
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 8px 32px rgba(168, 85, 247, 0.1);
  }

  .selector-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    font-weight: 500;
    color: #e5e7eb;
    margin-bottom: 0.75rem;
  }

  .label-icon {
    font-size: 1.2rem;
  }

  .network-select {
    width: 100%;
    padding: 0.875rem 1rem;
    background: rgba(17, 24, 39, 0.8);
    border: 1px solid rgba(168, 85, 247, 0.3);
    border-radius: 10px;
    font-size: 0.95rem;
    color: #e5e7eb;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .network-select:hover {
    border-color: rgba(236, 72, 153, 0.5);
    box-shadow: 0 0 20px rgba(168, 85, 247, 0.2);
  }

  .network-select:focus {
    outline: none;
    border-color: #a855f7;
    box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.2);
  }

  .warning-card {
    background: rgba(220, 38, 38, 0.1);
    border: 1px solid rgba(220, 38, 38, 0.3);
    border-radius: 16px;
    padding: 2rem;
    text-align: center;
  }

  .warning-card h3 {
    color: #ef4444;
    margin: 0 0 1rem;
  }

  .warning-card p {
    color: #fca5a5;
    margin: 0.5rem 0;
  }

  .warning-card code {
    background: rgba(220, 38, 38, 0.2);
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-family: 'SF Mono', Monaco, monospace;
    color: #fca5a5;
  }

  .faucet-card {
    background: rgba(30, 30, 46, 0.6);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(168, 85, 247, 0.2);
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 8px 32px rgba(168, 85, 247, 0.1);
  }

  .contract-info {
    background: rgba(17, 24, 39, 0.6);
    border: 1px solid rgba(168, 85, 247, 0.2);
    border-radius: 12px;
    padding: 1.25rem;
    margin-bottom: 1.5rem;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid rgba(168, 85, 247, 0.1);
  }

  .info-row:last-child {
    border-bottom: none;
  }

  .info-label {
    font-size: 0.9rem;
    color: #9ca3af;
  }

  .info-value {
    font-size: 0.95rem;
    font-weight: 600;
    color: #e879f9;
    font-family: 'SF Mono', Monaco, monospace;
  }

  .info-link {
    font-size: 0.9rem;
    color: #a855f7;
    text-decoration: underline;
    font-family: 'SF Mono', Monaco, monospace;
    transition: color 0.2s;
  }

  .info-link:hover {
    color: #e879f9;
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
    color: #e5e7eb;
    margin-bottom: 0.5rem;
  }

  .address-input {
    width: 100%;
    padding: 1rem;
    background: rgba(17, 24, 39, 0.8);
    border: 1px solid rgba(168, 85, 247, 0.3);
    border-radius: 10px;
    font-size: 0.95rem;
    font-family: 'SF Mono', Monaco, monospace;
    color: #e5e7eb;
    transition: all 0.3s ease;
  }

  .address-input:focus {
    outline: none;
    border-color: #a855f7;
    box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.2), 0 0 20px rgba(168, 85, 247, 0.3);
  }

  .address-input::placeholder {
    color: #6b7280;
  }

  .address-status {
    margin-top: 0.5rem;
    font-size: 0.85rem;
    color: #34d399;
    font-family: 'SF Mono', Monaco, monospace;
  }

  .cooldown-warning {
    margin-top: 0.25rem;
    font-size: 0.85rem;
    color: #fbbf24;
    font-weight: 500;
  }

  .btn-request {
    width: 100%;
    padding: 1.125rem;
    background: linear-gradient(135deg, #e879f9 0%, #a855f7 50%, #ec4899 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 1.05rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
    box-shadow: 0 4px 20px rgba(168, 85, 247, 0.4);
  }

  .btn-request:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 30px rgba(168, 85, 247, 0.6);
  }

  .btn-request:active:not(:disabled) {
    transform: translateY(0);
  }

  .btn-request:disabled,
  .btn-request.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .spinner {
    width: 18px;
    height: 18px;
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
    border-radius: 10px;
    font-size: 0.9rem;
    border: 1px solid;
  }

  .error-message {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.3);
    color: #fca5a5;
  }

  .success-message {
    background: rgba(52, 211, 153, 0.1);
    border-color: rgba(52, 211, 153, 0.3);
    color: #6ee7b7;
  }

  .history-section {
    background: rgba(30, 30, 46, 0.6);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(168, 85, 247, 0.2);
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 8px 32px rgba(168, 85, 247, 0.1);
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
    color: #e5e7eb;
    margin: 0;
  }

  .btn-refresh {
    padding: 0.5rem 1rem;
    background: rgba(17, 24, 39, 0.8);
    border: 1px solid rgba(168, 85, 247, 0.3);
    border-radius: 8px;
    color: #a855f7;
    font-size: 0.85rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
  }

  .btn-refresh:hover {
    background: rgba(168, 85, 247, 0.1);
    border-color: #a855f7;
  }

  .spinner-small {
    width: 12px;
    height: 12px;
    border: 2px solid rgba(168, 85, 247, 0.3);
    border-top-color: #a855f7;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  .loading-text, .empty-text {
    text-align: center;
    color: #6b7280;
    padding: 2rem;
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
    background: rgba(17, 24, 39, 0.6);
    border: 1px solid rgba(168, 85, 247, 0.15);
    border-radius: 10px;
    transition: all 0.3s ease;
  }

  .history-item:hover {
    background: rgba(17, 24, 39, 0.8);
    border-color: rgba(168, 85, 247, 0.3);
    transform: translateX(4px);
  }

  .history-icon {
    font-size: 1.5rem;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(168, 85, 247, 0.2);
    border-radius: 50%;
  }

  .history-info {
    flex: 1;
  }

  .history-recipient, .history-amount, .history-date {
    font-size: 0.85rem;
    margin: 0.15rem 0;
    color: #9ca3af;
  }

  .history-recipient strong, .history-amount strong {
    color: #e879f9;
  }

  .history-right {
    text-align: right;
  }

  .history-link {
    font-size: 0.85rem;
    color: #a855f7;
    text-decoration: underline;
    display: block;
    margin-bottom: 0.25rem;
    transition: color 0.2s;
  }

  .history-link:hover {
    color: #e879f9;
  }

  .history-block {
    font-size: 0.75rem;
    color: #6b7280;
    margin: 0;
  }

  .info-section {
    background: rgba(30, 30, 46, 0.6);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(168, 85, 247, 0.2);
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 8px 32px rgba(168, 85, 247, 0.1);
  }

  .info-section h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #e5e7eb;
    margin: 0 0 1rem;
  }

  .info-section ul {
    margin: 0;
    padding-left: 1.5rem;
  }

  .info-section li {
    font-size: 0.9rem;
    color: #9ca3af;
    margin-bottom: 0.5rem;
    line-height: 1.6;
  }

  .info-section strong {
    color: #e879f9;
  }

  /* Animaciones adicionales */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .faucet-card, .network-selector-card, .history-section, .info-section {
    animation: fadeIn 0.5s ease-out;
  }
</style>
