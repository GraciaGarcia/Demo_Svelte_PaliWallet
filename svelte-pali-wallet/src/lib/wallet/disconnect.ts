/** Revoca permisos de eth_accounts en el proveedor EIP-1193 (best-effort). */
export async function revokeEthAccounts(ethereum: { request: (a: { method: string; params?: unknown }) => Promise<unknown> } | undefined) {
  if (!ethereum) return
  try {
    await ethereum.request({
      method: 'wallet_revokePermissions',
      params: [{ eth_accounts: {} }],
    })
  } catch {
    console.log('No se pudieron revocar permisos automáticamente')
  }
}
