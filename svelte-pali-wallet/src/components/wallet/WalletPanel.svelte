<script>
  import { createEventDispatcher } from 'svelte'
  import { networks } from '../../lib/chains/networks'
  import { shortAddress } from '../../lib/format/address'
  import TransactionHistorySection from './TransactionHistorySection.svelte'
  import NetworkSwitcher from './NetworkSwitcher.svelte'
  import NetworkSwitchHistorySection from './NetworkSwitchHistorySection.svelte'

  export let currentNetwork = ''
  export let chainId = ''
  export let address = ''
  export let balance = ''
  export let networkType = 'EVM'
  export let copied = false
  export let transactions = []
  export let loadingTransactions = false
  export let currentNetworkInfo = null
  export let canUndoAccount = false
  /** @type {import('../../lib/wallet/networkSwitchHistory').NetworkSwitchEntry[]} */
  export let networkHistory = []

  const dispatch = createEventDispatcher()
</script>

<div class="wallet-view">
  <div class="network-current-bar">
    <span class="network-icon">🌐</span>
    <div>
      <p class="network-label-small">Red actual (app)</p>
      <p class="network-name-current">{currentNetwork} · {networkType}</p>
    </div>
  </div>

  <NetworkSwitcher
    {chainId}
    {currentNetwork}
    {networkType}
    on:networkchange={(e) => dispatch('networkchange', e.detail)}
  />

  <NetworkSwitchHistorySection entries={networkHistory} on:clear={() => dispatch('clearNetworkHistory')} />

  <div class="account-info-box">
    <div class="account-icon">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </div>
    <div>
      <p class="account-label">Cuenta Conectada</p>
      <p class="account-address">{shortAddress(address)}</p>
    </div>
    <button type="button" class="btn-refresh" on:click={() => dispatch('refreshAccount')} title="Actualizar cuenta">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
      </svg>
    </button>
    {#if canUndoAccount}
      <button type="button" class="btn-undo" on:click={() => dispatch('undoAccount')} title="Deshacer cambio de cuenta">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 7v6h6" />
          <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />
        </svg>
      </button>
    {/if}
    <button type="button" class="btn-copy-small" on:click={() => dispatch('copyAddress')}>
      {#if copied}
        ✓
      {:else}
        📋
      {/if}
    </button>
  </div>

  <div class="balance-card-main">
    <p class="balance-amount">{parseFloat(balance || '0').toFixed(4)}</p>
    <p class="balance-currency">{networks.EVM.find((n) => n.chainId === chainId)?.symbol || networks.UTXO.find((n) => n.chainId === chainId)?.symbol || 'ETH'}</p>
    <p class="balance-usd">$0 USD</p>
  </div>

  <button type="button" class="btn-transfer" on:click={() => dispatch('openTransfer')}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="19 12 12 19 5 12" />
    </svg>
    Transferir
  </button>

  <TransactionHistorySection
    {transactions}
    {loadingTransactions}
    {networkType}
    {chainId}
    {currentNetworkInfo}
    on:refresh={() => dispatch('refreshTx')}
    on:clear={() => dispatch('clearTx')}
  />

  <button type="button" class="btn-disconnect" on:click={() => dispatch('disconnect')}>Desconectar</button>
</div>

<style>
  .network-current-bar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    margin-bottom: 0.5rem;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
  }
  .network-label-small {
    font-size: 0.7rem;
    color: #6b7280;
    margin: 0;
  }
  .network-name-current {
    font-size: 0.9rem;
    font-weight: 500;
    color: #3b82f6;
    margin: 0;
  }

  .btn-undo {
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    color: #6b7280;
    padding: 0.5rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .btn-undo:hover {
    border-color: #3b82f6;
    color: #3b82f6;
  }
</style>
