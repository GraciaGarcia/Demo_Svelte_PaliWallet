<script>
  import { createEventDispatcher } from 'svelte'
  import NetworkSwitcher from '../wallet/NetworkSwitcher.svelte'

  export let chainId = ''
  export let currentNetwork = ''
  export let networkType = 'EVM'

  const dispatch = createEventDispatcher()
</script>

<div class="networks-view">
  <div class="view-header">
    <h1 class="view-title">🌐 Gestión de Redes</h1>
    <p class="view-subtitle">Administra y cambia entre diferentes redes blockchain</p>
  </div>

  <div class="current-network-banner">
    <div class="banner-content">
      <span class="banner-icon">✓</span>
      <div>
        <p class="banner-label">Conectado a</p>
        <p class="banner-network">{currentNetwork}</p>
      </div>
    </div>
    <span class="banner-type">{networkType}</span>
  </div>

  <div class="networks-container">
    <NetworkSwitcher
      {chainId}
      {currentNetwork}
      {networkType}
      on:networkchange={(e) => dispatch('networkchange', e.detail)}
    />
  </div>
</div>

<style>
  .networks-view {
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

  .current-network-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    color: white;
  }

  .banner-content {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .banner-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    font-size: 1.2rem;
    font-weight: 600;
  }

  .banner-label {
    font-size: 0.85rem;
    margin: 0 0 0.25rem;
    opacity: 0.9;
  }

  .banner-network {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0;
  }

  .banner-type {
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 500;
  }

  .networks-container {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 1.5rem;
  }
</style>
