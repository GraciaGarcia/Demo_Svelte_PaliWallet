<script>
  import { ethers } from 'ethers'
  import { networks, predefinedAccounts } from './lib/chains/networks'
  import {
    loadTransactionsFromStorage,
    clearTransactionsStorage,
    loadTransactionsFromBlockchain,
  } from './lib/transactions/history'
  import { validateAndBuildTransferSummary } from './lib/transfers/prepare'
  import { sendNativeEvmTransfer } from './lib/transfers/evmTransfer'
  import { detectCurrentNetwork } from './lib/wallet/detectNetwork'
  import { setupWalletListeners } from './lib/wallet/listeners'
  import { revokeEthAccounts } from './lib/wallet/disconnect'
  import {
    appendNetworkSwitch,
    loadNetworkSwitchHistory,
    clearNetworkSwitchHistory,
  } from './lib/wallet/networkSwitchHistory'
  import {
    appendAccountToHistory,
    getPreviousAccount,
    clearAccountHistory,
  } from './lib/wallet/accountHistory'

  import AppSidebar from './components/layout/AppSidebar.svelte'
  import TopNavbar from './components/layout/TopNavbar.svelte'
  import HomeView from './components/views/HomeView.svelte'
  import ConnectWalletView from './components/views/ConnectWalletView.svelte'
  import WalletDashboardView from './components/views/WalletDashboardView.svelte'
  import TransactionsView from './components/views/TransactionsView.svelte'
  import ContractsView from './components/views/ContractsView.svelte'
  import ContractTransactionsView from './components/views/ContractTransactionsView.svelte'
  import NetworksView from './components/views/NetworksView.svelte'
  import NetworkHistoryView from './components/views/NetworkHistoryView.svelte'
  import TransferView from './components/transfer/TransferView.svelte'
  import DescriptionView from './components/views/DescriptionView.svelte'
  import ObjectivesView from './components/views/ObjectivesView.svelte'
  import BenefitsView from './components/views/BenefitsView.svelte'
  import FeaturesView from './components/views/FeaturesView.svelte'
  import DeveloperView from './components/views/DeveloperView.svelte'
  import ErrorToast from './components/ui/ErrorToast.svelte'

  // Detectar Pali Wallet o MetaMask
  // @ts-ignore - Pali Wallet injects ethereum into window
  const ethereum = window.ethereum || window.pali

  let currentView = 'home'
  let address = ''
  let balance = ''
  let error = ''
  let connected = false
  let loading = false
  let copied = false
  let currentNetwork = ''
  let chainId = ''
  let networkType = 'EVM'

  let transferDestination = ''
  let transferAmount = ''
  let transferring = false
  let showTransferSummary = false
  let transferSummary = {}

  let transactions = []
  let loadingTransactions = false

  let networkHistory = loadNetworkSwitchHistory()
  let canUndoAccount = false

  $: availableAccounts = predefinedAccounts.filter(
    (acc) => acc.address.toLowerCase() !== address.toLowerCase()
  )
  
  // Para transferencias: solo mostrar el contrato
  $: transferAccounts = predefinedAccounts.filter(
    (acc) => acc.name.includes('Contrato') && acc.address.toLowerCase() !== address.toLowerCase()
  )
  
  // Para el contrato: solo mostrar la cuenta importada
  $: contractAccounts = predefinedAccounts.filter(
    (acc) => !acc.name.includes('Contrato') && acc.address.toLowerCase() !== address.toLowerCase()
  )
  $: currentNetworkInfo =
    networks.EVM.find((n) => n.chainId === chainId) || networks.UTXO.find((n) => n.chainId === chainId)

  function go(view) {
    currentView = view
  }

  async function handleNetworkChange(e) {
    const d = e.detail
    const changed = d.kind !== networkType || String(d.chainId) !== String(chainId)

    if (d.kind === 'UTXO') {
      networkType = 'UTXO'
      chainId = d.chainId
      currentNetwork = d.name
      balance = '0.0000'
      if (changed) {
        networkHistory = appendNetworkSwitch({
          kind: 'UTXO',
          chainId: d.chainId,
          name: d.name,
          explorerBase: null,
        })
      }
      await loadTransactionHistory()
      return
    }

    networkType = 'EVM'
    chainId = d.chainId
    currentNetwork = d.name
    if (changed) {
      networkHistory = appendNetworkSwitch({
        kind: 'EVM',
        chainId: d.chainId,
        name: d.name,
        explorerBase: d.explorerBase ?? null,
      })
    }
    try {
      const provider = new ethers.BrowserProvider(ethereum)
      const rawBalance = await provider.getBalance(address)
      balance = ethers.formatEther(rawBalance)
    } catch {
      balance = '0.0000'
    }
    await loadTransactionHistory()
  }

  function clearNetworkSwitchHist() {
    if (!confirm('¿Eliminar todo el historial de cambios de red guardado en este dispositivo?')) return
    clearNetworkSwitchHistory()
    networkHistory = []
  }

  function loadTransactionHistory() {
    if (!connected || !address) {
      transactions = []
      return
    }
    loadingTransactions = true
    try {
      const { list } = loadTransactionsFromStorage(address, currentNetwork)
      transactions = list
    } catch (e) {
      console.error(e)
      transactions = []
    } finally {
      loadingTransactions = false
    }
  }

  async function loadTransactionHistoryFromBlockchain() {
    if (!connected || !address || !currentNetworkInfo) {
      error = 'No hay conexión o información de red'
      return
    }

    loadingTransactions = true
    try {
      const explorerBase = currentNetworkInfo.blockExplorerUrls?.[0] || ''
      const result = await loadTransactionsFromBlockchain(
        address,
        chainId,
        currentNetwork,
        explorerBase
      )

      if (result.ok) {
        transactions = result.transactions
        alert(`✅ Se cargaron ${result.transactions.length} transacciones desde la blockchain`)
      } else {
        error = `Error al cargar desde blockchain: ${result.error}`
      }
    } catch (e) {
      console.error(e)
      error = 'Error al cargar transacciones desde blockchain'
    } finally {
      loadingTransactions = false
    }
  }

  function clearTransactionHistory() {
    const shouldClear = confirm(
      `¿Estás seguro de que deseas eliminar todo el historial de transacciones para esta cuenta en ${currentNetwork}?\n\n` +
        `Esta acción no se puede deshacer.`
    )
    if (!shouldClear) return
    try {
      clearTransactionsStorage(address, currentNetwork)
      transactions = []
      alert('✅ Historial de transacciones eliminado')
    } catch (err) {
      console.error('Error clearing transaction history:', err)
      alert('❌ Error al eliminar el historial')
    }
  }

  async function connectWallet() {
    error = ''
    loading = true
    try {
      if (!ethereum) {
        error = 'Pali Wallet no detectada. Instálala como extensión del navegador o asegúrate de que esté habilitada.'
        loading = false
        return
      }

      // Simplificado: solo una solicitud de cuentas
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

      if (accounts.length === 0) {
        error = 'No se encontraron cuentas'
        loading = false
        return
      }

      address = accounts[0]

      const detected = await detectCurrentNetwork(ethereum)
      currentNetwork = detected.currentNetwork
      chainId = detected.chainId
      networkType = detected.networkType

      if (networkType === 'EVM') {
        try {
          const provider = new ethers.BrowserProvider(ethereum)
          const rawBalance = await provider.getBalance(address)
          balance = ethers.formatEther(rawBalance)
        } catch (balanceErr) {
          console.warn('Error obteniendo balance:', balanceErr)
          balance = '0.0000'
        }
      } else {
        // Red UTXO detectada
        balance = '0.0000'
        console.log('Conectado a red UTXO:', currentNetwork)
      }

      connected = true
      currentView = 'wallet'

      // Guardar cuenta inicial en el historial
      appendAccountToHistory({
        address,
        balance,
        timestamp: Date.now(),
        network: currentNetwork,
        chainId,
      })
      updateUndoButtonState()

      setupWalletListeners(ethereum, {
        onAccountsEmpty: () => disconnect(),
        onAccountChanged: async (next) => {
          // Guardar cuenta anterior antes de cambiar
          appendAccountToHistory({
            address,
            balance,
            timestamp: Date.now(),
            network: currentNetwork,
            chainId,
          })

          address = next
          const provider = new ethers.BrowserProvider(ethereum)
          const rawBalance = await provider.getBalance(address)
          balance = ethers.formatEther(rawBalance)
          await loadTransactionHistory()
          updateUndoButtonState()
        },
      })

      await loadTransactionHistory()
    } catch (err) {
      console.error('Error al conectar:', err)
      if (err.code === 4001) {
        error = 'Conexión cancelada por el usuario'
      } else {
        error = err.message || 'Error al conectar la wallet'
      }
    } finally {
      loading = false
    }
  }

  async function refreshAccount() {
    if (!connected || !ethereum) return
    loading = true
    try {
      const accounts = await ethereum.request({ method: 'eth_accounts' })
      if (accounts.length > 0) {
        address = accounts[0]
        const provider = new ethers.BrowserProvider(ethereum)
        const rawBalance = await provider.getBalance(address)
        balance = ethers.formatEther(rawBalance)
      }
    } catch (err) {
      error = 'Error al actualizar cuenta: ' + err.message
    } finally {
      loading = false
    }
  }

  async function undoAccountChange() {
    const previousAccount = getPreviousAccount()
    if (!previousAccount) {
      error = 'No hay cuenta anterior para deshacer'
      return
    }

    loading = true
    try {
      // Restaurar la cuenta anterior
      address = previousAccount.address
      balance = previousAccount.balance
      currentNetwork = previousAccount.network
      chainId = previousAccount.chainId

      // Recargar historial de transacciones
      await loadTransactionHistory()

      // Actualizar el estado del botón deshacer
      updateUndoButtonState()
    } catch (err) {
      error = 'Error al deshacer cambio de cuenta: ' + (err instanceof Error ? err.message : String(err))
    } finally {
      loading = false
    }
  }

  function updateUndoButtonState() {
    const previousAccount = getPreviousAccount()
    canUndoAccount = previousAccount !== null
  }

  async function disconnect() {
    try {
      await revokeEthAccounts(ethereum)
    } catch (err) {
      console.log('Error al desconectar:', err)
    }
    address = ''
    balance = ''
    connected = false
    currentView = 'home'
    error = ''
    canUndoAccount = false
    clearAccountHistory()
    window.location.reload()
  }

  async function copyAddress() {
    await navigator.clipboard.writeText(address)
    copied = true
    setTimeout(() => (copied = false), 2000)
  }

  function prepareTransfer() {
    const r = validateAndBuildTransferSummary({
      transferDestination,
      transferAmount,
      balance,
      address,
      chainId,
      currentNetwork,
    })
    if (!r.ok) {
      error = r.error
      return
    }
    transferSummary = r.summary
    showTransferSummary = true
  }

  async function confirmTransfer() {
    transferring = true
    error = ''
    try {
      const result = await sendNativeEvmTransfer({
        ethereum,
        summary: transferSummary,
        address,
        chainId,
        currentNetwork,
      })
      if (!result.ok) {
        error = 'Error en la transferencia: ' + result.message
        return
      }
      balance = result.newBalance
      transactions = result.transactions
      
      // Mostrar mensaje adicional con el enlace al explorador
      if (result.explorerUrl) {
        setTimeout(() => {
          const viewExplorer = confirm(
            `🎉 ¡Transferencia completada con éxito!\n\n` +
            `Tu transacción ha sido registrada en la blockchain.\n\n` +
            `🔗 Ver en el explorador:\n${result.explorerUrl}\n\n` +
            `¿Quieres abrir el explorador ahora?`
          )
          if (viewExplorer) {
            window.open(result.explorerUrl, '_blank')
          }
        }, 500)
      }
      
      transferDestination = ''
      transferAmount = ''
      showTransferSummary = false
      currentView = 'wallet'
    } finally {
      transferring = false
    }
  }

  function cancelTransfer() {
    showTransferSummary = false
    error = ''
  }
</script>

<div class="app-container" class:connected={connected}>
  {#if !connected}
    <AppSidebar {currentView} {connected} on:navigate={(e) => go(e.detail.view)} />
  {:else}
    <TopNavbar {currentView} {connected} on:navigate={(e) => go(e.detail.view)} on:disconnect={disconnect} />
  {/if}

  <div class="main-content" class:with-topnav={connected}>
    {#if currentView === 'home'}
      <HomeView
        {connected}
        on:explore={() => go('description')}
        on:wallet={(e) => {
          if (e.detail.connected) go('wallet')
          else connectWallet()
        }}
      />
    {/if}

    {#if currentView === 'wallet'}
      {#if !connected}
        <ConnectWalletView {loading} on:connect={connectWallet} />
      {:else}
        <WalletDashboardView
          {currentNetwork}
          {chainId}
          {address}
          {balance}
          {networkType}
          {copied}
          on:refreshAccount={refreshAccount}
          on:copyAddress={copyAddress}
          on:openTransfer={() => go('transfer')}
          on:navigate={(e) => go(e.detail.view)}
        />
      {/if}
    {/if}

    {#if currentView === 'transactions'}
      <TransactionsView
        {transactions}
        {loadingTransactions}
        {networkType}
        {chainId}
        {currentNetworkInfo}
        {currentNetwork}
        on:networkchange={handleNetworkChange}
        on:refreshTx={loadTransactionHistory}
        on:clearTx={clearTransactionHistory}
        on:refreshFromBlockchain={loadTransactionHistoryFromBlockchain}
      />
    {/if}

    {#if currentView === 'contracts'}
      <ContractsView
        {chainId}
        {currentNetwork}
        {networkType}
        {address}
        availableAccounts={contractAccounts}
        on:refreshAccount={refreshAccount}
      />
    {/if}

    {#if currentView === 'contract-transactions'}
      <ContractTransactionsView
        {chainId}
        {currentNetwork}
        {address}
      />
    {/if}

    {#if currentView === 'networks'}
      <NetworksView
        {chainId}
        {currentNetwork}
        {networkType}
        on:networkchange={handleNetworkChange}
      />
    {/if}

    {#if currentView === 'network-history'}
      <NetworkHistoryView {networkHistory} on:clearNetworkHistory={clearNetworkSwitchHist} />
    {/if}

    {#if currentView === 'transfer'}
      <TransferView
        bind:transferDestination
        bind:transferAmount
        {address}
        {balance}
        {chainId}
        {showTransferSummary}
        {transferSummary}
        {transferring}
        availableAccounts={transferAccounts}
        on:prepare={prepareTransfer}
        on:confirm={confirmTransfer}
        on:cancelSummary={cancelTransfer}
        on:back={() => go('wallet')}
      />
    {/if}

    {#if currentView === 'description'}
      <DescriptionView on:nav={(e) => go(e.detail.view)} />
    {/if}
    {#if currentView === 'objectives'}
      <ObjectivesView on:nav={(e) => go(e.detail.view)} />
    {/if}
    {#if currentView === 'benefits'}
      <BenefitsView on:nav={(e) => go(e.detail.view)} />
    {/if}
    {#if currentView === 'features'}
      <FeaturesView on:nav={(e) => go(e.detail.view)} />
    {/if}
    {#if currentView === 'developer'}
      <DeveloperView {connected} on:nav={(e) => go(e.detail.view)} />
    {/if}

    <ErrorToast message={error} on:dismiss={() => (error = '')} />
  </div>
</div>

<style>
  .app-container.connected {
    padding-top: 0;
  }

  .main-content.with-topnav {
    margin-left: 0;
    padding-top: 60px;
  }
</style>
