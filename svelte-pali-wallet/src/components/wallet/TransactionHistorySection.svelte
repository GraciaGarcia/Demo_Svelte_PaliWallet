<script>
  import { createEventDispatcher } from 'svelte'
  import { shortAddress } from '../../lib/format/address'
  import { getBlockExplorerTxUrl } from '../../lib/chains/networks'

  export let transactions = []
  export let loadingTransactions = false
  export let networkType = 'EVM'
  export let chainId = ''
  /** Símbolo o info de red actual */
  export let currentNetworkInfo = null

  const dispatch = createEventDispatcher()
</script>

<div class="transactions-section">
  <div class="transactions-header">
    <h3>Historial de Transacciones</h3>
    <div class="transactions-actions">
      <button
        type="button"
        class="btn-refresh-tx"
        on:click={() => dispatch('refresh')}
        disabled={loadingTransactions}
        title="Actualizar transacciones"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class:spinning={loadingTransactions}
        >
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
        </svg>
      </button>
      <button type="button" class="btn-clear-tx" on:click={() => dispatch('clear')} title="Limpiar historial">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      </button>
    </div>
  </div>

  {#if loadingTransactions}
    <div class="transactions-loading">
      <span class="spinner" />
      <p>Cargando desde base de datos local...</p>
    </div>
  {:else if transactions.length === 0}
    <div class="transactions-empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
      <p class="transactions-empty">
        {#if networkType === 'UTXO'}
          No hay transacciones UTXO guardadas
        {:else}
          No hay transacciones guardadas para esta red
        {/if}
      </p>
      <p class="transactions-hint">Las transacciones se guardarán automáticamente cuando las realices</p>
    </div>
  {:else}
    <div class="transactions-list">
      {#each transactions as tx}
        <div class="transaction-item">
          <div class="tx-info">
            <div class="tx-type" class:outgoing={tx.isOutgoing} class:incoming={!tx.isOutgoing}>
              {#if tx.isOutgoing}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
                Enviado
              {:else}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="17" y1="7" x2="7" y2="17" />
                  <polyline points="17 17 7 17 7 7" />
                </svg>
                Recibido
              {/if}
            </div>
            <div class="tx-details">
              <p class="tx-address">
                {#if tx.isOutgoing}
                  Para: {shortAddress(tx.to)}
                {:else}
                  De: {shortAddress(tx.from)}
                {/if}
              </p>
              <p class="tx-date">{tx.date} {tx.time}</p>
              <p class="tx-hash">Hash: {shortAddress(tx.hash)}</p>
              {#if tx.blockNumber}
                <p class="tx-block">Bloque: {tx.blockNumber}</p>
              {/if}
            </div>
          </div>
          <div class="tx-amount" class:outgoing={tx.isOutgoing} class:incoming={!tx.isOutgoing}>
            {tx.isOutgoing ? '-' : '+'}{parseFloat(tx.value || 0).toFixed(4)}
            {currentNetworkInfo?.symbol || 'ETH'}
          </div>
          {#if tx.explorerUrl || getBlockExplorerTxUrl(chainId, tx.hash)}
            <a
              href={tx.explorerUrl || getBlockExplorerTxUrl(chainId, tx.hash)}
              target="_blank"
              rel="noopener noreferrer"
              class="tx-explorer-link"
              title="Ver en explorador"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          {/if}
        </div>
      {/each}

      {#if transactions.length > 0}
        <div class="transactions-summary">
          <p>📊 Total: {transactions.length} transacciones</p>
          <p class="db-info">💾 Historial combinado: Blockchain + Local</p>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .transactions-section {
    margin-top: 2rem;
  }

  .transactions-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .transactions-header h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }

  .transactions-actions {
    display: flex;
    gap: 0.5rem;
  }

  .btn-refresh-tx,
  .btn-clear-tx {
    padding: 0.5rem;
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6b7280;
  }

  .btn-refresh-tx:hover,
  .btn-clear-tx:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
  }

  .btn-refresh-tx:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-clear-tx {
    color: #ef4444;
  }

  .btn-clear-tx:hover {
    background: #fef2f2;
    border-color: #fecaca;
  }

  .spinning {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .transactions-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 3rem;
    color: #6b7280;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #e5e7eb;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .transactions-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 3rem;
    color: #9ca3af;
  }

  .transactions-empty {
    font-size: 1rem;
    font-weight: 500;
    color: #6b7280;
    margin: 0;
  }

  .transactions-hint {
    font-size: 0.85rem;
    color: #9ca3af;
    margin: 0;
  }

  .transactions-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 600px;
    overflow-y: auto;
    padding-right: 0.5rem;
  }

  .transactions-list::-webkit-scrollbar {
    width: 6px;
  }

  .transactions-list::-webkit-scrollbar-track {
    background: #f3f4f6;
    border-radius: 3px;
  }

  .transactions-list::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
  }

  .transactions-list::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }

  .transaction-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .transaction-item:hover {
    background: #f3f4f6;
    border-color: #d1d5db;
  }

  .tx-info {
    display: flex;
    gap: 1rem;
    flex: 1;
  }

  .tx-type {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    font-weight: 500;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    white-space: nowrap;
  }

  .tx-type.outgoing {
    background: #fef2f2;
    color: #dc2626;
  }

  .tx-type.incoming {
    background: #f0fdf4;
    color: #16a34a;
  }

  .tx-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .tx-address {
    font-size: 0.9rem;
    font-weight: 500;
    color: #374151;
    margin: 0;
  }

  .tx-date,
  .tx-hash,
  .tx-block {
    font-size: 0.75rem;
    color: #6b7280;
    margin: 0;
  }

  .tx-amount {
    font-size: 1rem;
    font-weight: 600;
    font-family: 'SF Mono', Monaco, monospace;
    white-space: nowrap;
  }

  .tx-amount.outgoing {
    color: #dc2626;
  }

  .tx-amount.incoming {
    color: #16a34a;
  }

  .tx-explorer-link {
    padding: 0.5rem;
    color: #3b82f6;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .tx-explorer-link:hover {
    color: #2563eb;
    transform: translateY(-1px);
  }

  .transactions-summary {
    padding: 1rem;
    background: #f0f9ff;
    border: 1px solid #bfdbfe;
    border-radius: 8px;
    text-align: center;
  }

  .transactions-summary p {
    margin: 0.25rem 0;
    font-size: 0.9rem;
    color: #1e40af;
  }

  .db-info {
    font-size: 0.8rem !important;
    color: #6b7280 !important;
  }
</style>
