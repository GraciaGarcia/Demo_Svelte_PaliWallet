<script>
  import { createEventDispatcher } from 'svelte'

  export let message = ''

  const dispatch = createEventDispatcher()
</script>

{#if message}
  <div class="error-toast">
    {message}
    <button type="button" class="error-close" on:click={() => dispatch('dismiss')}>×</button>
  </div>
{/if}
