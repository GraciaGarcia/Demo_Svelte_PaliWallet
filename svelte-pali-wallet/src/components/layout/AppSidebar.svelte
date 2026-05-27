<script>
  import { createEventDispatcher } from 'svelte'

  export let currentView = 'home'
  export let connected = false

  const dispatch = createEventDispatcher()

  function go(view) {
    dispatch('navigate', { view })
  }
</script>

<div class="sidebar">
  <button
    type="button"
    class="menu-icon"
    class:active={currentView === 'home'}
    on:click={() => go('home')}
    title="Home"
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  </button>

  <button
    type="button"
    class="menu-icon"
    class:active={currentView === 'wallet'}
    on:click={() => go(connected ? 'wallet' : 'home')}
    title="Wallet"
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M16 12h.01" />
      <path d="M2 10h20" />
    </svg>
  </button>

  <button
    type="button"
    class="menu-icon"
    class:active={currentView === 'description'}
    on:click={() => go('description')}
    title="Descripción"
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  </button>

  <button
    type="button"
    class="menu-icon"
    class:active={currentView === 'objectives'}
    on:click={() => go('objectives')}
    title="Objetivos"
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  </button>

  <button
    type="button"
    class="menu-icon"
    class:active={currentView === 'benefits'}
    on:click={() => go('benefits')}
    title="Beneficios"
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  </button>

  <button
    type="button"
    class="menu-icon"
    class:active={currentView === 'features'}
    on:click={() => go('features')}
    title="Características"
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  </button>

  <button
    type="button"
    class="menu-icon"
    class:active={currentView === 'developer'}
    on:click={() => go('developer')}
    title="Desarrollador"
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  </button>
</div>
