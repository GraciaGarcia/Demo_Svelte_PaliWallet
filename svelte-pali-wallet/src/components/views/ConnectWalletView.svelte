<script>
  import { createEventDispatcher } from 'svelte'

  export let loading = false

  const dispatch = createEventDispatcher()
</script>

<div class="connect-view">
  <div class="logo-circle-big">
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M16 12h.01" />
      <path d="M2 10h20" />
    </svg>
  </div>

  <h2 class="connect-title">Conecta tu Wallet</h2>

  <button type="button" class="btn-connect-main" on:click={() => dispatch('connect')} disabled={loading}>
    {#if loading}
      <span class="spinner" />
      Conectando...
    {:else}
      Conectar Pali Wallet
    {/if}
  </button>
</div>
