<script>
  import { createEventDispatcher } from 'svelte'

  export let connected = false

  const dispatch = createEventDispatcher()
</script>

<div class="home-view">
  <div class="logo-circle-big">
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M16 12h.01" />
      <path d="M2 10h20" />
    </svg>
  </div>

  <h1 class="home-title">Pali Wallet DApp</h1>
  <p class="home-subtitle">Tu puerta de entrada al mundo Web3</p>

  <div class="home-buttons">
    <button type="button" class="btn-explore" on:click={() => dispatch('explore')}>Explorar</button>
    <button
      type="button"
      class="btn-wallet"
      on:click={() => dispatch('wallet', { connected })}
    >
      ir a Wallet
    </button>
  </div>
</div>
