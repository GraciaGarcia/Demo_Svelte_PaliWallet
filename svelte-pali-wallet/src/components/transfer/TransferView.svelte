<script>
  import { createEventDispatcher } from 'svelte'
  import { networks } from '../../lib/chains/networks'
  import { shortAddress } from '../../lib/format/address'

  export let address = ''
  export let balance = ''
  export let chainId = ''
  export let transferDestination = ''
  export let transferAmount = ''
  export let showTransferSummary = false
  export let transferSummary = {}
  export let transferring = false
  export let availableAccounts = []

  const dispatch = createEventDispatcher()
</script>

<div class="content-card">
  {#if !showTransferSummary}
    <h2>Transferir Fondos</h2>
    <div class="transfer-form">
      <div class="form-group">
        <span class="field-label">Cuenta de origen</span>
        <div class="origin-account">
          <p>{shortAddress(address)}</p>
          <span class="balance-small"
            >{parseFloat(balance || '0').toFixed(4)}
            {networks.EVM.find((n) => n.chainId === chainId)?.symbol || 'ETH'}</span
          >
        </div>
      </div>
      <div class="form-group">
        <label for="transfer-destination">Transferir a</label>
        <select id="transfer-destination" bind:value={transferDestination} class="select-field">
          <option value="">Selecciona una cuenta o ingresa dirección</option>
          {#each availableAccounts as account}
            <option value={account.address}>
              {account.name} ({account.address.slice(0, 6)}...{account.address.slice(-4)})
            </option>
          {/each}
        </select>
        <p class="or-text">O ingresa una dirección manualmente:</p>
        <input
          id="transfer-destination-manual"
          type="text"
          bind:value={transferDestination}
          placeholder="0x..."
          class="input-field"
        />
      </div>
      <div class="form-group">
        <label for="transfer-amount"
          >Cantidad ({networks.EVM.find((n) => n.chainId === chainId)?.symbol || 'ETH'})</label
        >
        <input
          id="transfer-amount"
          type="number"
          bind:value={transferAmount}
          placeholder="0.0"
          step="0.0001"
          class="input-field"
        />
      </div>
      <button
        type="button"
        class="btn-send"
        on:click={() => dispatch('prepare')}
        disabled={!transferDestination || !transferAmount}
      >
        Continuar
      </button>
      <button type="button" class="btn-back" on:click={() => dispatch('back')}>Cancelar</button>
    </div>
  {:else}
    <h2>Resumen de Transferencia</h2>
    <div class="transfer-summary">
      <div class="summary-item">
        <span class="summary-label">De:</span>
        <span class="summary-value">{shortAddress(transferSummary.from)}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Para:</span>
        <span class="summary-value">{transferSummary.toName}</span>
        <span class="summary-address">{shortAddress(transferSummary.to)}</span>
      </div>
      <div class="summary-item highlight">
        <span class="summary-label">Cantidad:</span>
        <span class="summary-value">{transferSummary.amount} {transferSummary.symbol}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Red:</span>
        <span class="summary-value">{transferSummary.network}</span>
      </div>
      <button type="button" class="btn-send" on:click={() => dispatch('confirm')} disabled={transferring}>
        {#if transferring}
          <span class="spinner" />
          Enviando...
        {:else}
          Confirmar Transferencia
        {/if}
      </button>
      <button type="button" class="btn-back" on:click={() => dispatch('cancelSummary')}>Atrás</button>
    </div>
  {/if}
</div>
