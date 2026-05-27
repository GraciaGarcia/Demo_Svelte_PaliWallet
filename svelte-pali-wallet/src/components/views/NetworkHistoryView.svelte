<script>
  import { createEventDispatcher } from 'svelte'
  import NetworkSwitchHistorySection from '../wallet/NetworkSwitchHistorySection.svelte'

  /** @type {import('../../lib/wallet/networkSwitchHistory').NetworkSwitchEntry[]} */
  export let networkHistory = []

  const dispatch = createEventDispatcher()
</script>

<div class="network-history-view">
  <div class="view-header">
    <h1 class="view-title">🕐 Historial de Redes</h1>
    <p class="view-subtitle">Registro de todos los cambios de red realizados</p>
  </div>

  <div class="history-container">
    <NetworkSwitchHistorySection
      entries={networkHistory}
      on:clear={() => dispatch('clearNetworkHistory')}
    />
  </div>
</div>

<style>
  .network-history-view {
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

  .history-container {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 1.5rem;
  }
</style>
