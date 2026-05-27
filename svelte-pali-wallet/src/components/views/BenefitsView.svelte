<script>
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()
</script>

<div class="content-card">
  <h2>Beneficios</h2>
  <div class="benefits-grid">
    <div class="benefit-card">
      <h3>Seguridad Total</h3>
      <p>Tus claves privadas nunca salen de tu dispositivo</p>
    </div>
    <div class="benefit-card">
      <h3>Transacciones Rápidas</h3>
      <p>Operaciones instantáneas en múltiples redes</p>
    </div>
    <div class="benefit-card">
      <h3>Multi-Chain</h3>
      <p>Soporte para Ethereum, Syscoin y más</p>
    </div>
    <div class="benefit-card">
      <h3>Interfaz Intuitiva</h3>
      <p>Diseño moderno y fácil de usar</p>
    </div>
  </div>
  <div class="nav-buttons">
    <button type="button" class="btn-nav" on:click={() => dispatch('nav', { view: 'objectives' })}>Anterior</button>
    <button type="button" class="btn-nav-primary" on:click={() => dispatch('nav', { view: 'features' })}>Siguiente</button>
  </div>
</div>
