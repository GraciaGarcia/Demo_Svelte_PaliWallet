<script>
  import { createEventDispatcher } from 'svelte'
  import { networks } from '../../lib/chains/networks'
  import { shortAddress } from '../../lib/format/address'

  export let currentNetwork = ''
  export let chainId = ''
  export let address = ''
  export let balance = ''
  export let networkType = 'EVM'
  export let copied = false

  const dispatch = createEventDispatcher()
</script>

<div class="wallet-dashboard">
  <div class="view-header">
    <h1 class="view-title">💼 Mi Wallet</h1>
    <p class="view-subtitle">Información general de tu cuenta</p>
  </div>

  <div class="dashboard-grid">
    <!-- Tarjeta de Cuenta -->
    <div class="info-card account-card">
      <div class="card-header">
        <span class="card-icon">👤</span>
        <h3 class="card-title">Cuenta Conectada</h3>
      </div>
      <div class="card-content">
        <p class="account-address-full">{address}</p>
        <p class="account-address-short">{shortAddress(address)}</p>
        <div class="card-actions">
          <button
            type="button"
            class="btn-action"
            on:click={() => dispatch('copyAddress')}
          >
            {#if copied}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copiado
            {:else}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              Copiar
            {/if}
          </button>
          <button
            type="button"
            class="btn-action"
            on:click={() => dispatch('refreshAccount')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
            </svg>
            Actualizar
          </button>
        </div>
      </div>
    </div>

    <!-- Tarjeta de Red -->
    <div class="info-card network-card">
      <div class="card-header">
        <span class="card-icon">🌐</span>
        <h3 class="card-title">Red Actual</h3>
      </div>
      <div class="card-content">
        <p class="network-name">{currentNetwork}</p>
        <p class="network-type">{networkType}</p>
        <p class="network-chain-id">Chain ID: {chainId}</p>
      </div>
    </div>

    <!-- Tarjeta de Saldo -->
    <div class="balance-card-large">
      <div class="balance-header">
        <span class="balance-icon">💰</span>
        <h3 class="balance-title">Saldo Total</h3>
      </div>
      <div class="balance-content">
        <p class="balance-amount-large">{parseFloat(balance || '0').toFixed(4)}</p>
        <p class="balance-currency-large">
          {networks.EVM.find((n) => n.chainId === chainId)?.symbol ||
            networks.UTXO.find((n) => n.chainId === chainId)?.symbol ||
            'ETH'}
        </p>
        <p class="balance-usd-large">≈ $0.00 USD</p>
      </div>
      <button
        type="button"
        class="btn-transfer-large"
        on:click={() => dispatch('openTransfer')}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <polyline points="19 12 12 19 5 12" />
        </svg>
        Transferir Fondos
      </button>
    </div>
  </div>

  <!-- Accesos Rápidos -->
  <div class="quick-actions">
    <h3 class="quick-actions-title">Accesos Rápidos</h3>
    <div class="actions-grid">
      <button
        type="button"
        class="action-button"
        on:click={() => dispatch('navigate', { view: 'transactions' })}
      >
        <span class="action-icon">📊</span>
        <span class="action-label">Ver Transacciones</span>
      </button>
      <button
        type="button"
        class="action-button"
        on:click={() => dispatch('navigate', { view: 'contracts' })}
      >
        <span class="action-icon">📄</span>
        <span class="action-label">Ver Contratos</span>
      </button>
      <button
        type="button"
        class="action-button"
        on:click={() => dispatch('navigate', { view: 'networks' })}
      >
        <span class="action-icon">🌐</span>
        <span class="action-label">Cambiar Red</span>
      </button>
      <button
        type="button"
        class="action-button"
        on:click={() => dispatch('navigate', { view: 'network-history' })}
      >
        <span class="action-icon">🕐</span>
        <span class="action-label">Historial Redes</span>
      </button>
    </div>
  </div>
</div>

<style>
  .wallet-dashboard {
    max-width: 1200px;
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

  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .info-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 1.5rem;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .card-icon {
    font-size: 1.5rem;
  }

  .card-title {
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
    margin: 0;
  }

  .card-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .account-address-full {
    font-size: 0.85rem;
    color: #6b7280;
    font-family: 'SF Mono', Monaco, monospace;
    word-break: break-all;
    margin: 0;
  }

  .account-address-short {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1f2937;
    font-family: 'SF Mono', Monaco, monospace;
    margin: 0;
  }

  .card-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .btn-action {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    color: #6b7280;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-action:hover {
    border-color: #3b82f6;
    color: #3b82f6;
    background: #eff6ff;
  }

  .network-name {
    font-size: 1.2rem;
    font-weight: 600;
    color: #3b82f6;
    margin: 0 0 0.25rem;
  }

  .network-type {
    font-size: 0.9rem;
    color: #6b7280;
    margin: 0 0 0.5rem;
  }

  .network-chain-id {
    font-size: 0.8rem;
    color: #9ca3af;
    font-family: 'SF Mono', Monaco, monospace;
    margin: 0;
  }

  .balance-card-large {
    grid-column: 1 / -1;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border-radius: 12px;
    padding: 2rem;
    color: white;
  }

  .balance-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .balance-icon {
    font-size: 2rem;
  }

  .balance-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
  }

  .balance-content {
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .balance-amount-large {
    font-size: 3rem;
    font-weight: 300;
    margin: 0;
    font-family: 'SF Mono', Monaco, monospace;
  }

  .balance-currency-large {
    font-size: 1.5rem;
    font-weight: 500;
    margin: 0.5rem 0;
    opacity: 0.9;
  }

  .balance-usd-large {
    font-size: 1rem;
    margin: 0;
    opacity: 0.8;
  }

  .btn-transfer-large {
    width: 100%;
    padding: 1rem;
    background: white;
    color: #3b82f6;
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

  .btn-transfer-large:hover {
    background: #f9fafb;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .quick-actions {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 1.5rem;
  }

  .quick-actions-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #374151;
    margin: 0 0 1rem;
  }

  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .action-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1.5rem 1rem;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .action-button:hover {
    background: #eff6ff;
    border-color: #3b82f6;
    transform: translateY(-2px);
  }

  .action-icon {
    font-size: 2rem;
  }

  .action-label {
    font-size: 0.9rem;
    font-weight: 500;
    color: #374151;
  }

  @media (max-width: 768px) {
    .dashboard-grid {
      grid-template-columns: 1fr;
    }

    .actions-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
