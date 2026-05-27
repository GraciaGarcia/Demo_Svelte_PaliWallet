<script>
  import { createEventDispatcher } from 'svelte'
  import {
    EVM_WALLET_NETWORKS,
    UTXO_WALLET_NETWORKS,
    hexToDecimalChainId,
    explorerBaseFromNetwork,
    networkDisplayIcon,
  } from '../../lib/chains/evmWalletNetworks'

  /** ChainId actual: decimal en EVM (ej. "560048"), id en UTXO (ej. "btc") */
  export let chainId = ''
  export let currentNetwork = ''
  export let networkType = 'EVM'

  let menuOpen = true
  let utxoExpanded = true
  let evmExpanded = true

  const dispatch = createEventDispatcher()

  let status = 'idle'
  let statusMsg = ''

  const REMOVED_KEY = 'removed_networks'

  let removedNetworks = []
  try {
    removedNetworks = JSON.parse(localStorage.getItem(REMOVED_KEY) || '[]')
  } catch {
    removedNetworks = []
  }
  let showRemoved = false

  function saveRemoved() {
    localStorage.setItem(REMOVED_KEY, JSON.stringify(removedNetworks))
  }

  function getEth() {
    return typeof window !== 'undefined' ? window.ethereum : undefined
  }

  function setStatus(s, msg = '') {
    status = s
    statusMsg = msg
    if (s !== 'switching') {
      setTimeout(() => {
        status = 'idle'
        statusMsg = ''
      }, 4000)
    }
  }

  async function syncRemovedNetworks() {
    const eth = getEth()
    if (!eth) return
    setStatus('switching')
    const currentChainHex = chainId ? '0x' + BigInt(chainId).toString(16) : null
    let changed = false

    for (const net of EVM_WALLET_NETWORKS) {
      if (removedNetworks.includes(net.chainId)) continue
      try {
        await eth.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: net.chainId }],
        })
        if (currentChainHex) {
          await eth
            .request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: currentChainHex }],
            })
            .catch(() => {})
        }
      } catch (e) {
        if (e.code === 4902 || e?.data?.originalError?.code === 4902) {
          removedNetworks = [...removedNetworks, net.chainId]
          changed = true
        }
      }
    }

    if (changed) saveRemoved()
    setStatus('success', 'Sincronización completada.')
  }

  async function switchToEVM(network) {
    const eth = getEth()
    if (!eth) {
      setStatus('error', 'Pali Wallet no detectada.')
      return
    }
    try {
      setStatus('switching')
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainId }],
      })
      setStatus('success', `Conectado a ${network.name}`)
      const dec = hexToDecimalChainId(network.chainId)
      dispatch('networkchange', {
        kind: 'EVM',
        chainId: dec,
        name: network.name,
        symbol: network.nativeCurrency.symbol,
        explorerBase: explorerBaseFromNetwork(network),
      })
    } catch (e) {
      if (e.code === 4902 || e?.data?.originalError?.code === 4902) {
        if (!removedNetworks.includes(network.chainId)) {
          removedNetworks = [...removedNetworks, network.chainId]
          saveRemoved()
        }
        try {
          await eth.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: network.chainId,
                chainName: network.name,
                rpcUrls: network.rpcUrls,
                nativeCurrency: network.nativeCurrency,
                blockExplorerUrls: network.blockExplorerUrls,
              },
            ],
          })
          removedNetworks = removedNetworks.filter((id) => id !== network.chainId)
          saveRemoved()
          setStatus('success', `Red añadida y conectada: ${network.name}`)
          const dec = hexToDecimalChainId(network.chainId)
          dispatch('networkchange', {
            kind: 'EVM',
            chainId: dec,
            name: network.name,
            symbol: network.nativeCurrency.symbol,
            explorerBase: explorerBaseFromNetwork(network),
          })
        } catch (addErr) {
          setStatus('error', addErr?.message ?? 'No se pudo añadir la red.')
        }
      } else if (e.code === 4001) {
        setStatus('idle', '')
      } else {
        setStatus('error', e?.message ?? 'Error al cambiar de red.')
      }
    }
  }

  function removeNetwork(network) {
    removedNetworks = [...removedNetworks, network.chainId]
    saveRemoved()
    setStatus(
      'info',
      `Red "${network.name}" retirada de la DApp. Para eliminarla de Pali ve a Configuración → Manage Networks.`
    )
  }

  async function reAddNetwork(network) {
    const eth = getEth()
    if (!eth) return
    try {
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainId }],
      })
      removedNetworks = removedNetworks.filter((id) => id !== network.chainId)
      saveRemoved()
      setStatus('success', `Red "${network.name}" reactivada.`)
      const dec = hexToDecimalChainId(network.chainId)
      dispatch('networkchange', {
        kind: 'EVM',
        chainId: dec,
        name: network.name,
        symbol: network.nativeCurrency.symbol,
        explorerBase: explorerBaseFromNetwork(network),
      })
    } catch (e) {
      if (e.code === 4902 || e?.data?.originalError?.code === 4902) {
        try {
          await eth.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: network.chainId,
                chainName: network.name,
                rpcUrls: network.rpcUrls,
                nativeCurrency: network.nativeCurrency,
                blockExplorerUrls: network.blockExplorerUrls,
              },
            ],
          })
          removedNetworks = removedNetworks.filter((id) => id !== network.chainId)
          saveRemoved()
          setStatus('success', `Red "${network.name}" añadida a Pali Wallet.`)
          const dec = hexToDecimalChainId(network.chainId)
          dispatch('networkchange', {
            kind: 'EVM',
            chainId: dec,
            name: network.name,
            symbol: network.nativeCurrency.symbol,
            explorerBase: explorerBaseFromNetwork(network),
          })
        } catch (addErr) {
          if (addErr.code !== 4001) {
            setStatus('error', addErr?.message ?? 'No se pudo añadir la red.')
          }
        }
      } else if (e.code === 4001) {
        setStatus('idle', '')
      } else {
        setStatus('error', e?.message ?? 'Error al añadir la red.')
      }
    }
  }

  $: activeNetworks = EVM_WALLET_NETWORKS.filter((n) => !removedNetworks.includes(n.chainId))
  $: retiredNetworks = EVM_WALLET_NETWORKS.filter((n) => removedNetworks.includes(n.chainId))

  function switchToUTXO(network) {
    setStatus(
      'info',
      `Las redes UTXO no se pueden cambiar desde una DApp. Para cambiar a ${network.name}, abre Pali Wallet → ícono de red 🌐 y selecciónala.`
    )
    dispatch('networkchange', {
      kind: 'UTXO',
      chainId: network.id,
      name: network.name,
      symbol: network.symbol,
      explorerBase: null,
    })
  }

  function isUtxoActive(net) {
    return networkType === 'UTXO' && (chainId === net.id || currentNetwork === net.name)
  }
</script>

<div class="switcher">
  <div class="page-header">
    <div class="page-header-left">
      <h2>Cambio de <span class="gradient-text">Red</span></h2>
      <p>
        EVM con chainId en hex (compatible con Pali). Si la red no existe en la wallet, se añade con
        <code>wallet_addEthereumChain</code>. Puedes retirar redes de esta lista (solo oculta en la DApp).
      </p>
    </div>
    <div class="page-header-right">
      <span class="stat-pill">◈ EVM</span>
      <span class="stat-pill cyan">⬡ UTXO</span>
      <button type="button" class="sync-btn" on:click={syncRemovedNetworks} title="Sincronizar redes con Pali">
        Sincronizar
      </button>
    </div>
  </div>

  {#if status === 'success'}
    <div class="alert alert-success">{statusMsg}</div>
  {/if}
  {#if status === 'error'}
    <div class="alert alert-error">{statusMsg}</div>
  {/if}
  {#if status === 'info'}
    <div class="alert alert-info">{statusMsg}</div>
  {/if}

  <div class="networks-layout">
    <div class="network-group">
      <div class="group-label"><span class="group-icon">◈</span> EVM Networks</div>
      <div class="network-list">
        {#each activeNetworks as net}
          {@const decId = hexToDecimalChainId(net.chainId)}
          <div class="network-row">
            <button
              type="button"
              class="network-card"
              class:active={networkType === 'EVM' && chainId === decId}
              on:click={() => switchToEVM(net)}
              disabled={status === 'switching'}
            >
              <div class="net-info">
                <div class="net-name">{net.name}</div>
                <div class="net-meta">Chain {decId} · {net.nativeCurrency.symbol}</div>
              </div>
              <div class="net-right">
                {#if networkType === 'EVM' && chainId === decId}
                  <svg class="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                {/if}
              </div>
            </button>
            <button
              type="button"
              class="remove-btn"
              on:click={() => removeNetwork(net)}
              title="Retirar red de la DApp"
              disabled={status === 'switching'}
            >
              🗑
            </button>
          </div>
        {/each}
      </div>

      {#if retiredNetworks.length > 0}
        <div class="retired-section">
          <button type="button" class="retired-toggle" on:click={() => (showRemoved = !showRemoved)}>
            {showRemoved ? '▼' : '▶'}
            {retiredNetworks.length} red{retiredNetworks.length > 1 ? 'es' : ''} retirada{retiredNetworks.length > 1
              ? 's'
              : ''}
          </button>
          {#if showRemoved}
            <div class="retired-hint">Para eliminarlas de Pali: Configuración → Manage Networks</div>
            <div class="retired-list">
              {#each retiredNetworks as net}
                {@const decId = hexToDecimalChainId(net.chainId)}
                <div class="network-row">
                  <div class="network-card retired-card">
                    <div class="net-info">
                      <div class="net-name retired-name">{net.name}</div>
                      <div class="net-meta">Chain {decId}</div>
                    </div>
                    <div class="net-right"><span class="retired-badge">Retirada</span></div>
                  </div>
                  <button type="button" class="restore-btn" on:click={() => reAddNetwork(net)} title="Añadir a Pali">
                    +
                  </button>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </div>

    <div class="network-group">
      <div class="group-label"><span class="group-icon">⬡</span> UTXO Networks</div>
      <div class="network-list">
        {#each UTXO_WALLET_NETWORKS as net}
          <button type="button" class="network-card utxo-card" class:active={isUtxoActive(net)} on:click={() => switchToUTXO(net)}>
            <div class="net-info">
              <div class="net-name">{net.name}</div>
            </div>
            {#if isUtxoActive(net)}
              <svg class="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            {/if}
          </button>
        {/each}
      </div>
    </div>
  </div>

  {#if status === 'switching'}
    <div class="switching-overlay"><span class="spinner" /> Cambiando red...</div>
  {/if}
</div>

<style>
  .switcher {
    width: 100%;
    margin-bottom: 1.25rem;
  }
  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 1rem;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .page-header-left h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 0.35rem;
  }
  .page-header-left p {
    font-size: 0.8rem;
    color: #6b7280;
    line-height: 1.5;
    max-width: 36rem;
    margin: 0;
  }
  .page-header-left code {
    font-size: 0.72rem;
    background: #f3f4f6;
    padding: 0.1rem 0.25rem;
    border-radius: 4px;
  }
  .gradient-text {
    background: linear-gradient(135deg, #2563eb, #7c3aed);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .page-header-right {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;
  }
  .sync-btn {
    font-size: 0.75rem;
    font-weight: 500;
    color: #374151;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    padding: 0.35rem 0.75rem;
    border-radius: 999px;
    cursor: pointer;
  }
  .sync-btn:hover {
    border-color: #3b82f6;
    color: #1d4ed8;
  }
  .stat-pill {
    font-size: 0.75rem;
    font-weight: 500;
    color: #2563eb;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    padding: 0.35rem 0.65rem;
    border-radius: 999px;
  }
  .stat-pill.cyan {
    color: #0891b2;
    background: #ecfeff;
    border-color: #a5f3fc;
  }
  .alert {
    border-radius: 8px;
    padding: 0.65rem 0.85rem;
    font-size: 0.8rem;
    margin-bottom: 0.75rem;
  }
  .alert-success {
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    color: #047857;
  }
  .alert-error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #b91c1c;
  }
  .alert-info {
    background: #eef2ff;
    border: 1px solid #c7d2fe;
    color: #4338ca;
  }
  .networks-layout {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  @media (max-width: 768px) {
    .networks-layout {
      grid-template-columns: 1fr;
    }
  }
  .network-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .group-label {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: #6b7280;
    padding-bottom: 0.35rem;
    border-bottom: 1px solid #e5e7eb;
  }
  .group-icon {
    color: #3b82f6;
  }
  .network-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .network-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 0.65rem 0.85rem;
    text-align: left;
    width: 100%;
    cursor: pointer;
    font-family: inherit;
  }
  .network-card:hover:not(:disabled) {
    border-color: #93c5fd;
    background: #f8fafc;
  }
  .network-card.active {
    border-color: #10b981;
    background: #ecfdf5;
  }
  .network-card:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
  .utxo-card:hover {
    border-color: #67e8f9;
    background: #ecfeff;
  }
  .network-row {
    display: flex;
    gap: 0.35rem;
    align-items: stretch;
  }
  .network-row .network-card {
    flex: 1;
  }
  .remove-btn {
    background: #fef2f2;
    color: #b91c1c;
    border: 1px solid #fecaca;
    width: 2.25rem;
    border-radius: 8px;
    flex-shrink: 0;
    cursor: pointer;
    font-size: 0.9rem;
    line-height: 1;
  }
  .remove-btn:hover:not(:disabled) {
    background: #fee2e2;
  }
  .remove-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .retired-section {
    margin-top: 0.35rem;
  }
  .retired-toggle {
    background: transparent;
    color: #6b7280;
    font-size: 0.75rem;
    padding: 0.25rem 0;
    cursor: pointer;
    border: none;
    font-family: inherit;
  }
  .retired-hint {
    font-size: 0.7rem;
    color: #92400e;
    margin: 0.35rem 0;
    padding: 0.35rem 0.5rem;
    border-radius: 6px;
    background: #fffbeb;
    border: 1px solid #fde68a;
  }
  .retired-list {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    margin-top: 0.35rem;
  }
  .retired-card {
    opacity: 0.75;
  }
  .retired-name {
    text-decoration: line-through;
  }
  .retired-badge {
    font-size: 0.65rem;
    color: #6b7280;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    padding: 0.1rem 0.4rem;
    border-radius: 4px;
  }
  .restore-btn {
    background: #ecfdf5;
    color: #047857;
    border: 1px solid #a7f3d0;
    width: 2.25rem;
    border-radius: 8px;
    flex-shrink: 0;
    cursor: pointer;
    font-size: 1.1rem;
    line-height: 1;
    font-weight: 600;
  }
  .restore-btn:hover {
    background: #d1fae5;
  }
  .net-info {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }
  .net-name {
    font-size: 0.85rem;
    font-weight: 500;
    color: #111827;
  }
  .net-meta {
    font-size: 0.7rem;
    color: #6b7280;
  }
  .net-right {
    flex-shrink: 0;
  }
  .active-dot {
    display: block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #10b981;
  }
  .arrow {
    color: #9ca3af;
    font-size: 0.95rem;
  }
  .switching-overlay {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: #6b7280;
    margin-top: 0.5rem;
  }
  .spinner {
    width: 14px;
    height: 14px;
    border: 2px solid #e5e7eb;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
