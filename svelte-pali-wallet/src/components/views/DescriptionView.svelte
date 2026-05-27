<script>
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()
</script>

<div class="content-card">
  <h2>Descripción</h2>
  <p>
    Pali Wallet DApp es una aplicación descentralizada que permite a los usuarios gestionar sus activos digitales en
    múltiples blockchains. Soporta tanto redes UTXO (Bitcoin) como redes EVM (Ethereum, Syscoin), ofreciendo una
    experiencia unificada y segura para realizar transacciones y administrar criptomonedas.
  </p>
  <div class="nav-buttons">
    <button type="button" class="btn-nav" on:click={() => dispatch('nav', { view: 'home' })}>Anterior</button>
    <button type="button" class="btn-nav-primary" on:click={() => dispatch('nav', { view: 'objectives' })}>
      Siguiente
    </button>  </div>
</div>
