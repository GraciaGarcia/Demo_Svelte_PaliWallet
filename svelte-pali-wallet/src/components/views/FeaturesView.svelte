<script>
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()
</script>

<div class="content-card">
  <h2>Características</h2>
  <div class="features-list">
    <div class="feature-item">
      <span class="feature-check">✓</span>
      <div>
        <strong>Conexión con Pali Wallet</strong>
        <p>Integración directa con la extensión del navegador</p>
      </div>
    </div>
    <div class="feature-item">
      <span class="feature-check">✓</span>
      <div>
        <strong>Cambio de Redes</strong>
        <p>Alterna fácilmente entre diferentes blockchains</p>
      </div>
    </div>
    <div class="feature-item">
      <span class="feature-check">✓</span>
      <div>
        <strong>Transferencias</strong>
        <p>Envía fondos a cualquier dirección de forma segura</p>
      </div>
    </div>
    <div class="feature-item">
      <span class="feature-check">✓</span>
      <div>
        <strong>Visualización de Saldo</strong>
        <p>Consulta tu balance en tiempo real</p>
      </div>
    </div>
  </div>
  <div class="nav-buttons">
    <button type="button" class="btn-nav" on:click={() => dispatch('nav', { view: 'benefits' })}>Anterior</button>
    <button type="button" class="btn-nav-primary" on:click={() => dispatch('nav', { view: 'developer' })}>Siguiente</button>
  </div>
</div>
