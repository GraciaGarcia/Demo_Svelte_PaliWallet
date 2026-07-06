/**
 * ABI del ImprovedWalletContract para usarlo como Faucet
 * Contrato en Sepolia: 0x1fC9203ECC40dFC072bd4b087FE70004A1D2340F
 */
export const IMPROVED_WALLET_FAUCET_ABI = [
  // Funciones de lectura
  "function getContractBalance() external view returns (uint256)",
  "function getBalanceOf(address account) external view returns (uint256)",
  "function getMyBalance() external view returns (uint256)",
  "function owner() external view returns (address)",
  "function totalBalance() external view returns (uint256)",
  "function balances(address account) external view returns (uint256)",
  
  // Funciones de escritura (para el faucet usaremos sendTo)
  "function sendTo(address payable recipient, uint256 amount) external",
  "function deposit() external payable",
  
  // Eventos
  "event Transfer(address indexed from, address indexed to, uint256 amount, uint256 timestamp)",
  "event Deposit(address indexed from, uint256 amount, uint256 timestamp)"
]
