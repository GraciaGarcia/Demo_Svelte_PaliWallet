/**
 * ABI del contrato Faucet
 * Adaptado al contrato desplegado en: 0x811278B0518bCE88a87de7f8E82c1Ac16649E6ac
 */
export const FAUCET_ABI = [
  // Funciones de lectura
  "function getBalance() external view returns (uint256)",
  "function canRequest(address user) external view returns (bool)",
  "function nextRequestTime(address user) external view returns (uint256)",
  "function amount() external view returns (uint256)",
  "function cooldown() external view returns (uint256)",
  "function owner() external view returns (address)",
  "function lastRequest(address user) external view returns (uint256)",
  
  // Funciones de escritura
  "function requestFunds(address payable recipient) external",
  
  // Funciones solo para owner
  "function setAmount(uint256 _amount) external",
  "function withdraw() external",
  
  // Eventos (para tracking en el historial)
  "event FaucetSent(address indexed recipient, uint256 amount, uint256 timestamp)"
]
