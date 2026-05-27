<script>
  import { createEventDispatcher } from 'svelte'

  export let currentView = 'wallet'
  export let connected = false

  const dispatch = createEventDispatcher()

  const menuItems = [
    { id: 'wallet', label: 'Wallet', icon: '💼' },
    { id: 'transactions', label: 'Transacciones', icon: '📊' },
    { id: 'contract-transactions', label: 'Tx Contrato', icon: '📄' },
    { id: 'contracts', label: 'Contratos', icon: '📝' },
    { id: 'networks', label: 'Redes', icon: '🌐' },
    { id: 'network-history', label: 'Historial Redes', icon: '🕐' },
  ]
</script>

{#if connected}
  <nav class="top-navbar">
    <div class="navbar-brand">
      <span class="brand-icon">💳</span>
      <span class="brand-text">Pali Wallet</span>
    </div>
    
    <div class="navbar-menu">
      {#each menuItems as item}
        <button
          type="button"
          class="nav-item"
          class:active={currentView === item.id}
          on:click={() => dispatch('navigate', { view: item.id })}
        >
          <span class="nav-icon">{item.icon}</span>
          <span class="nav-label">{item.label}</span>
        </button>
      {/each}
    </div>

    <button
      type="button"
      class="btn-disconnect-nav"
      on:click={() => dispatch('disconnect')}
    >
      Desconectar
    </button>
  </nav>
{/if}

<style>
  .top-navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    background: white;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    padding: 0 2rem;
    gap: 2rem;
    z-index: 1000;
  }

  .navbar-brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: #1f2937;
  }

  .brand-icon {
    font-size: 1.5rem;
  }

  .brand-text {
    font-size: 1.1rem;
  }

  .navbar-menu {
    display: flex;
    gap: 0.5rem;
    flex: 1;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: transparent;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    color: #6b7280;
    font-size: 0.9rem;
  }

  .nav-item:hover {
    background: #f3f4f6;
    color: #1f2937;
  }

  .nav-item.active {
    background: #3b82f6;
    color: white;
  }

  .nav-icon {
    font-size: 1.2rem;
  }

  .nav-label {
    font-weight: 500;
  }

  .btn-disconnect-nav {
    padding: 0.5rem 1rem;
    background: transparent;
    border: 1px solid #ef4444;
    color: #ef4444;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-disconnect-nav:hover {
    background: #ef4444;
    color: white;
  }

  @media (max-width: 768px) {
    .top-navbar {
      padding: 0 1rem;
      gap: 1rem;
    }

    .nav-label {
      display: none;
    }

    .brand-text {
      display: none;
    }
  }
</style>
