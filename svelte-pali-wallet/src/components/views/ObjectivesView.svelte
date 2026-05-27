<script>
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()
</script>

<div class="content-card">
  <h2>Objetivos</h2>
  <ul class="objectives-list">
    <li>Facilitar el acceso a la tecnología blockchain para usuarios de todos los niveles</li>
    <li>Proporcionar una interfaz segura y confiable para gestionar activos digitales</li>
    <li>Promover la adopción de Web3 mediante una experiencia de usuario optimizada</li>
    <li>Garantizar la privacidad y seguridad de las transacciones en todo momento</li>
    <li>Integrar múltiples redes blockchain para mayor flexibilidad</li>
  </ul>
  <div class="nav-buttons">
    <button type="button" class="btn-nav" on:click={() => dispatch('nav', { view: 'description' })}>Anterior</button>
    <button type="button" class="btn-nav-primary" on:click={() => dispatch('nav', { view: 'benefits' })}>Siguiente</button>
  </div>
</div>
