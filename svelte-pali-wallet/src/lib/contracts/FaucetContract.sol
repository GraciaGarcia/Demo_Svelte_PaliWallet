// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title PublicFaucet
 * @notice Contrato de faucet público para distribuir ETH de testnet
 * @dev Permite solicitar tokens con cooldown, depositar y retirar fondos
 */
contract PublicFaucet {
    address public owner;
    uint256 public amountPerRequest; // Cantidad de ETH por solicitud
    uint256 public cooldownTime; // Tiempo de espera entre solicitudes (segundos)
    
    mapping(address => uint256) public lastRequestTime;
    
    // Eventos para tracking en el explorer
    event FaucetRequest(
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );
    
    event Deposit(
        address indexed sender,
        uint256 amount,
        uint256 timestamp
    );
    
    event Withdrawal(
        address indexed owner,
        uint256 amount,
        uint256 timestamp
    );
    
    constructor(uint256 _amountPerRequest, uint256 _cooldownTime) {
        owner = msg.sender;
        amountPerRequest = _amountPerRequest;
        cooldownTime = _cooldownTime;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Solo el owner puede ejecutar esto");
        _;
    }
    
    /**
     * @notice Solicitar tokens del faucet
     * @param recipient Dirección que recibirá los tokens
     */
    function requestTokens(address recipient) external {
        require(recipient != address(0), "Direccion invalida");
        require(
            block.timestamp >= lastRequestTime[recipient] + cooldownTime,
            "Debes esperar el tiempo de cooldown"
        );
        require(
            address(this).balance >= amountPerRequest,
            "Faucet sin fondos suficientes"
        );
        
        lastRequestTime[recipient] = block.timestamp;
        
        (bool success, ) = recipient.call{value: amountPerRequest}("");
        require(success, "Transferencia fallida");
        
        emit FaucetRequest(recipient, amountPerRequest, block.timestamp);
    }
    
    /**
     * @notice Depositar fondos al faucet (cualquiera puede depositar)
     */
    function deposit() external payable {
        require(msg.value > 0, "Debes enviar algo de ETH");
        emit Deposit(msg.sender, msg.value, block.timestamp);
    }
    
    /**
     * @notice Cambiar la cantidad por solicitud (solo owner)
     */
    function setAmountPerRequest(uint256 _amount) external onlyOwner {
        require(_amount > 0, "Cantidad debe ser mayor a 0");
        amountPerRequest = _amount;
    }
    
    /**
     * @notice Cambiar el tiempo de cooldown (solo owner)
     */
    function setCooldownTime(uint256 _cooldown) external onlyOwner {
        cooldownTime = _cooldown;
    }
    
    /**
     * @notice Retirar fondos del faucet (solo owner)
     */
    function withdraw(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Balance insuficiente");
        (bool success, ) = owner.call{value: amount}("");
        require(success, "Retiro fallido");
        
        emit Withdrawal(owner, amount, block.timestamp);
    }
    
    /**
     * @notice Ver el balance actual del faucet
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @notice Ver la última vez que una dirección solicitó tokens
     */
    function getLastRequestTime(address user) external view returns (uint256) {
        return lastRequestTime[user];
    }
    
    /**
     * @notice Verificar si una dirección puede solicitar tokens ahora
     */
    function canRequest(address user) external view returns (bool) {
        return block.timestamp >= lastRequestTime[user] + cooldownTime;
    }
    
    /**
     * @notice Tiempo restante hasta que un usuario pueda solicitar de nuevo (en segundos)
     */
    function timeUntilNextRequest(address user) external view returns (uint256) {
        if (block.timestamp >= lastRequestTime[user] + cooldownTime) {
            return 0;
        }
        return (lastRequestTime[user] + cooldownTime) - block.timestamp;
    }
    
    /**
     * @notice Recibir ETH directamente (se cuenta como depósito)
     */
    receive() external payable {
        emit Deposit(msg.sender, msg.value, block.timestamp);
    }
}

/*
===========================================
INSTRUCCIONES DE DESPLIEGUE EN REMIX
===========================================

1. Ve a https://remix.ethereum.org
2. Crea un nuevo archivo: PublicFaucet.sol
3. Copia y pega este contrato
4. Compila con Solidity 0.8.0 o superior
5. Conecta MetaMask/Pali Wallet a Sepolia testnet
6. En el panel de Deploy:
   - Constructor parameters:
     * _amountPerRequest: 100000000000000000 (0.1 ETH en wei)
     * _cooldownTime: 3600 (1 hora en segundos)
7. Click en "Deploy"
8. Copia la dirección del contrato desplegado
9. Envia algunos ETH de testnet al contrato (2-5 ETH)

PARÁMETROS RECOMENDADOS:
- Sepolia: 0.1 ETH por request, 1 hora cooldown
- Mumbai: 0.5 MATIC por request, 30 min cooldown
- BSC Testnet: 0.1 BNB por request, 1 hora cooldown

¡GUARDA LA DIRECCIÓN DEL CONTRATO!
*/
