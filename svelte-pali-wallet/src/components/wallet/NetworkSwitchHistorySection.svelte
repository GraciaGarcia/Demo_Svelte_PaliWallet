<script>
  import { createEventDispatcher } from 'svelte'

  /** @type {import('../../lib/wallet/networkSwitchHistory').NetworkSwitchEntry[]} */
  export let entries = []

  const dispatch = createEventDispatcher()

  function fmt(ts) {
    return new Date(ts).toLocaleString()
  }
</script>

<div class="network-history-section">
  <div class="transactions-header">
    <h3>Historial de redes</h3>
    <button
      type="button"
      class="btn-clear-tx"
      on:click={() => dispatch('clear')}
      title="Limpiar historial de redes"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
      </svg>
    </button>
  </div>

  {#if entries.length === 0}
    <p class="empty">Aún no hay cambios de red registrados en esta sesión / dispositivo.</p>
  {:else}
    <ul class="list">
      {#each entries as row}
        <li class="row">
          <div class="meta">
            <span class="badge" class:evm={row.kind === 'EVM'} class:utxo={row.kind === 'UTXO'}>{row.kind}</span>
            <span class="name">{row.name}</span>
            <span class="cid">ID {row.chainId}</span>
            <span class="time">{fmt(row.ts)}</span>
          </div>
          {#if row.explorerBase}
            <a href={row.explorerBase} target="_blank" rel="noopener noreferrer" class="explorer-link"
              >Explorador</a
            >
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .network-history-section {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1rem 1.25rem;
    margin-bottom: 1rem;
  }
  .transactions-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }
  .transactions-header h3 {
    font-size: 1rem;
    color: #1f2937;
    margin: 0;
    font-weight: 500;
  }
  .btn-clear-tx {
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    color: #6b7280;
    padding: 0.35rem;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .btn-clear-tx:hover {
    border-color: #ef4444;
    color: #ef4444;
    background: #fef2f2;
  }
  .empty {
    font-size: 0.85rem;
    color: #9ca3af;
    margin: 0;
  }
  .list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    flex-wrap: wrap;
    padding: 0.5rem 0;
    border-bottom: 1px solid #f3f4f6;
    font-size: 0.8rem;
  }
  .row:last-child {
    border-bottom: none;
  }
  .meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.35rem;
  }
  .badge {
    font-size: 0.65rem;
    font-weight: 600;
    padding: 0.1rem 0.35rem;
    border-radius: 4px;
    text-transform: uppercase;
  }
  .badge.evm {
    background: #dbeafe;
    color: #1d4ed8;
  }
  .badge.utxo {
    background: #ecfeff;
    color: #0e7490;
  }
  .name {
    font-weight: 500;
    color: #374151;
  }
  .cid,
  .time {
    color: #9ca3af;
    font-size: 0.72rem;
  }
  .explorer-link {
    font-size: 0.75rem;
    color: #2563eb;
    text-decoration: none;
    font-weight: 500;
  }
  .explorer-link:hover {
    text-decoration: underline;
  }
</style>
