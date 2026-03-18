<script>
  import { ethers } from 'ethers'

  let address = ''
  let balance = ''
  let error = ''
  let connected = false
  let loading = false
  let copied = false

  async function connectWallet() {
    error = ''
    loading = true
    try {
      if (!window.ethereum) {
        error = 'Pali Wallet no detectada. Instálala como extensión del navegador.'
        return
      }
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      address = await signer.getAddress()
      const rawBalance = await provider.getBalance(address)
      balance = ethers.formatEther(rawBalance)
      connected = true
    } catch (err) {
      error = err.message || 'Error al conectar la wallet'
    } finally {
      loading = false
    }
  }

  function disconnect() {
    address = ''
    balance = ''
    connected = false
  }

  function shortAddress(addr) {
    return addr ? addr.slice(0, 6) + '...' + addr.slice(-4) : ''
  }

  async function copyAddress() {
    await navigator.clipboard.writeText(address)
    copied = true
    setTimeout(() => copied = false, 2000)
  }
</script>

<div class="bg">
  <div class="card">

    <!-- Header logo -->
    <div class="logo-wrap">
      <div class="logo-circle">
        <!-- Wallet icon -->
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2"/>
          <path d="M16 12h.01"/>
          <path d="M2 10h20"/>
        </svg>
      </div>
    </div>

    <h1>Pali Wallet</h1>
    <p class="subtitle">Conecta tu wallet y gestiona tus activos en la blockchain</p>

    {#if !connected}
      <!-- PANTALLA LOGIN -->
      <div class="divider"></div>

      <div class="trust-row">
        <div class="trust-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span>Seguro</span>
        </div>
        <div class="trust-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          <span>Rápido</span>
        </div>
        <div class="trust-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
          </svg>
          <span>Web3</span>
        </div>
        <div class="trust-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
          <span>Privado</span>
        </div>
      </div>

      <button class="btn-connect" on:click={connectWallet} disabled={loading}>
        {#if loading}
          <span class="spinner"></span>
          <span>Conectando...</span>
        {:else}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          <span>Iniciar sesión con Pali Wallet</span>
        {/if}
      </button>

    {:else}
      <!-- PANTALLA CONECTADO -->
      <div class="connected-badge">
        <span class="dot"></span>
        Conectado
      </div>

      <!-- Layout dos columnas -->
      <div class="wallet-layout">

        <!-- Columna izquierda: balance card -->
        <div class="col-left">
          <div class="balance-card">
            <div class="bc-shine"></div>
            <div class="bc-shine2"></div>
            <div class="bc-top">
              <div class="bc-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                </svg>
              </div>
              <span class="bc-label">Saldo disponible</span>
            </div>
            <p class="bc-amount">{parseFloat(balance).toFixed(4)}</p>
            <p class="bc-sym">SYS · Syscoin Network</p>
            <div class="bc-footer">
              <div class="bc-dots">
                <span></span><span></span><span></span><span></span>
                <span></span><span></span><span></span><span></span>
              </div>
              <span class="bc-last4">{address.slice(-4).toUpperCase()}</span>
            </div>
          </div>

          <!-- Botón desconectar debajo de la card -->
          <button class="btn-disconnect" on:click={disconnect}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Desconectar
          </button>
        </div>

        <!-- Columna derecha: info -->
        <div class="col-right">

          <!-- Info boxes -->
          <div class="info-box">
            <div class="info-icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <p class="info-label">Dirección</p>
              <p class="info-value mono">{shortAddress(address)}</p>
            </div>
          </div>

          <div class="info-box">
            <div class="info-icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <path d="M2 10h20"/>
              </svg>
            </div>
            <div>
              <p class="info-label">Saldo</p>
              <p class="info-value mono">{parseFloat(balance).toFixed(6)} SYS</p>
            </div>
          </div>

          <!-- Address completo -->
          <button class="address-box" on:click={copyAddress}>
            <div class="addr-left">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#be185d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
              </svg>
              <div>
                <p class="info-label">Address completo</p>
                <p class="addr-text mono">{address}</p>
              </div>
            </div>
            <div class="copy-icon">
              {#if copied}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              {:else}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#be185d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
              {/if}
            </div>
          </button>

          <!-- Red activa -->
          <div class="network-box">
            <div class="network-dot"></div>
            <div>
              <p class="info-label">Red activa</p>
              <p class="info-value">Syscoin Network</p>
            </div>
            <div class="network-badge">Mainnet</div>
          </div>

        </div>
      </div>
    {/if}

    {#if error}
      <div class="error-box">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {error}
      </div>
    {/if}

  </div>
</div>

<style>
  :global(body) { margin: 0; font-family: 'Georgia', 'Segoe UI', 'Helvetica Neue', sans-serif; }

  .bg {
    min-height: 100vh;
    background: linear-gradient(135deg, #1a1a1a, #2d2d2d, #1a1a1a);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .card {
    background: rgba(255,255,255,0.95);
    backdrop-filter: blur(20px);
    border: 12px solid #1a1a1a;
    border-radius: 45px;
    padding: 2rem 1.5rem;
    width: 100%;
    max-width: 390px;
    text-align: center;
    color: #831843;
    box-shadow: 0 30px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.5);
    position: relative;
    min-height: 750px;
  }

  /* Notch del celular */
  .card::before {
    content: '';
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    width: 150px;
    height: 30px;
    background: #1a1a1a;
    border-radius: 0 0 20px 20px;
    z-index: 10;
  }

  /* Botón de encendido */
  .card::after {
    content: '';
    position: absolute;
    right: -15px;
    top: 120px;
    width: 3px;
    height: 60px;
    background: #0a0a0a;
    border-radius: 2px;
  }

  /* Logo */
  .logo-wrap { margin-bottom: 1.25rem; margin-top: 1.5rem; }

  .logo-circle {
    width: 55px;
    height: 55px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ec4899, #f472b6);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    box-shadow: 0 8px 24px rgba(236,72,153,0.45);
  }

  h1 {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
    background: linear-gradient(90deg, #ec4899, #f472b6, #fb7185);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: 0.5px;
    font-family: 'Georgia', 'Playfair Display', serif;
  }

  .subtitle {
    font-size: 0.85rem;
    color: #9f1239;
    margin: 0 0 1.5rem;
    line-height: 1.5;
    font-weight: 400;
    padding: 0 0.5rem;
  }

  .divider {
    height: 1px;
    background: rgba(236,72,153,0.15);
    margin-bottom: 1.5rem;
  }

  /* Trust row */
  .trust-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .trust-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    color: #be185d;
    font-size: 0.7rem;
    letter-spacing: 0.03em;
    font-weight: 500;
    padding: 0.75rem;
    background: rgba(236,72,153,0.05);
    border-radius: 12px;
  }

  /* Botón conectar */
  .btn-connect {
    width: 100%;
    padding: 0.95rem 1.5rem;
    background: linear-gradient(135deg, #ec4899, #f472b6);
    color: white;
    border: none;
    border-radius: 16px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    transition: transform 0.15s, box-shadow 0.2s;
    box-shadow: 0 8px 24px rgba(236,72,153,0.4);
    letter-spacing: 0.5px;
  }

  .btn-connect:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(236,72,153,0.5);
  }

  .btn-connect:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Badge conectado */
  .connected-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    background: rgba(74,222,128,0.1);
    border: 1px solid rgba(74,222,128,0.25);
    border-radius: 20px;
    padding: 0.3rem 0.85rem;
    font-size: 0.75rem;
    color: #4ade80;
    font-weight: 600;
    letter-spacing: 0.04em;
    margin-bottom: 1.5rem;
  }

  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #4ade80;
    box-shadow: 0 0 6px #4ade80;
    animation: pulse 2s infinite;
  }
  .connected-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    background: rgba(74,222,128,0.1);
    border: 1px solid rgba(74,222,128,0.25);
    border-radius: 20px;
    padding: 0.3rem 0.85rem;
    font-size: 0.75rem;
    color: #4ade80;
    font-weight: 600;
    letter-spacing: 0.04em;
    margin-bottom: 1.5rem;
  }

  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #4ade80;
    box-shadow: 0 0 6px #4ade80;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  /* Balance card */
  .balance-card {
    background: linear-gradient(135deg, #db2777 0%, #ec4899 40%, #f472b6 100%);
    border-radius: 20px;
    padding: 1.5rem;
    flex: 1;
    position: relative;
    overflow: hidden;
    text-align: left;
    box-shadow: 0 12px 32px rgba(219,39,119,0.4);
  }

  .bc-shine {
    position: absolute;
    top: -60px; right: -60px;
    width: 200px; height: 200px;
    background: rgba(255,255,255,0.06);
    border-radius: 50%;
    pointer-events: none;
  }

  .bc-shine2 {
    position: absolute;
    bottom: -80px; left: -40px;
    width: 220px; height: 220px;
    background: rgba(255,255,255,0.03);
    border-radius: 50%;
    pointer-events: none;
  }

  .bc-top {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .bc-icon {
    width: 32px; height: 32px;
    background: rgba(255,255,255,0.12);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
  }

  .bc-label {
    font-size: 0.75rem;
    color: rgba(255,255,255,0.6);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .bc-amount {
    margin: 0;
    font-size: 2.5rem;
    font-weight: 800;
    color: white;
    letter-spacing: -1px;
    line-height: 1;
  }

  .bc-sym {
    margin: 0.3rem 0 1.25rem;
    font-size: 0.8rem;
    color: rgba(255,255,255,0.55);
    font-weight: 500;
  }

  .bc-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .bc-dots { display: flex; gap: 5px; }
  .bc-dots span {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: rgba(255,255,255,0.3);
  }

  .bc-last4 {
    font-family: monospace;
    font-size: 0.85rem;
    color: rgba(255,255,255,0.6);
    font-weight: 600;
    letter-spacing: 0.1em;
  }

  /* Layout una columna para móvil */
  .wallet-layout {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    text-align: left;
  }

  .col-left {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .col-right {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  /* Info grid */
  .info-box {
    background: rgba(236,72,153,0.05);
    border: 1px solid rgba(236,72,153,0.15);
    border-radius: 16px;
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 0.65rem;
    text-align: left;
    transition: background 0.2s;
  }

  .info-box:hover { background: rgba(236,72,153,0.1); }

  .info-icon-wrap {
    width: 34px; height: 34px;
    background: rgba(236,72,153,0.15);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .info-label {
    font-size: 0.7rem;
    color: #9f1239;
    margin: 0 0 3px;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    font-weight: 500;
  }

  .info-value {
    font-size: 1rem;
    color: #831843;
    margin: 0;
    font-weight: 700;
  }

  /* Network box */
  .network-box {
    background: rgba(236,72,153,0.05);
    border: 1px solid rgba(236,72,153,0.15);
    border-radius: 16px;
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .network-dot {
    width: 10px; height: 10px;
    border-radius: 50%;
    background: #4ade80;
    box-shadow: 0 0 8px #4ade80;
    flex-shrink: 0;
    animation: pulse 2s infinite;
  }

  .network-badge {
    margin-left: auto;
    background: rgba(74,222,128,0.1);
    border: 1px solid rgba(74,222,128,0.2);
    border-radius: 20px;
    padding: 0.2rem 0.65rem;
    font-size: 0.7rem;
    color: #4ade80;
    font-weight: 600;
    letter-spacing: 0.05em;
  }

  /* Address box */
  .address-box {
    width: 100%;
    background: rgba(236,72,153,0.05);
    border: 1px solid rgba(236,72,153,0.15);
    border-radius: 16px;
    padding: 0.9rem 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
    text-align: left;
    color: #831843;
    box-sizing: border-box;
  }

  .address-box:hover {
    background: rgba(236,72,153,0.1);
    border-color: rgba(236,72,153,0.3);
  }

  .addr-left {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    flex: 1;
    min-width: 0;
  }

  .addr-left svg { flex-shrink: 0; margin-top: 2px; }

  .addr-text {
    font-size: 0.68rem;
    color: #9f1239;
    word-break: break-all;
    margin: 0;
    line-height: 1.5;
  }

  .copy-icon { flex-shrink: 0; }

  /* Botón desconectar */
  .btn-disconnect {
    width: 100%;
    padding: 0.8rem;
    background: transparent;
    color: #be185d;
    border: 1px solid rgba(236,72,153,0.35);
    border-radius: 16px;
    font-size: 0.88rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: background 0.2s, border-color 0.2s;
    letter-spacing: 0.5px;
  }

  .btn-disconnect:hover {
    background: rgba(236,72,153,0.08);
    border-color: rgba(236,72,153,0.6);
  }

  /* Error */
  .error-box {
    margin-top: 1rem;
    background: rgba(248,113,113,0.1);
    border: 1px solid rgba(248,113,113,0.25);
    border-radius: 12px;
    padding: 0.75rem 1rem;
    color: #fca5a5;
    font-size: 0.82rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-align: left;
  }

  .mono { font-family: 'Courier New', monospace; }

  .spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
    flex-shrink: 0;
  }

  @keyframes spin { to { transform: rotate(360deg); } }
</style>
