// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 <0.9.0;

/**
 * @title ImprovedWalletContract
 * @dev Contrato que permite depositar, guardar y retirar fondos
 */
contract ImprovedWalletContract {
    address public owner;
    
    // Mapeo de balances por usuario
    mapping(address => uint256) public balances;
    
    // Balance total del contrato
    uint256 public totalBalance;
    
    // Eventos
    event Deposit(address indexed from, uint256 amount, uint256 timestamp);
    event Withdrawal(address indexed to, uint256 amount, uint256 timestamp);
    event Transfer(address indexed from, address indexed to, uint256 amount, uint256 timestamp);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Solo el owner puede ejecutar esta funcion");
        _;
    }
    
    /**
     * @dev Deposita ETH al contrato (mínimo 0.01 ETH)
     */
    function deposit() external payable {
        require(msg.value >= 0.01 ether, "Debes enviar al menos 0.01 ETH");
        
        balances[msg.sender] += msg.value;
        totalBalance += msg.value;
        
        emit Deposit(msg.sender, msg.value, block.timestamp);
    }
    
    /**
     * @dev Retira fondos del contrato a tu propia cuenta
     * @param amount Cantidad a retirar en Wei
     */
    function withdraw(uint256 amount) external {
        require(amount > 0, "La cantidad debe ser mayor a 0");
        require(balances[msg.sender] >= amount, "Saldo insuficiente");
        
        balances[msg.sender] -= amount;
        totalBalance -= amount;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transferencia fallida");
        
        emit Withdrawal(msg.sender, amount, block.timestamp);
    }
    
    /**
     * @dev Retira todos tus fondos del contrato
     */
    function withdrawAll() external {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No tienes fondos para retirar");
        
        balances[msg.sender] = 0;
        totalBalance -= amount;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transferencia fallida");
        
        emit Withdrawal(msg.sender, amount, block.timestamp);
    }
    
    /**
     * @dev Envía fondos del contrato a otra dirección (mínimo 0.01 ETH)
     * @param recipient Dirección de destino
     * @param amount Cantidad a enviar en Wei
     */
    function sendTo(address payable recipient, uint256 amount) external {
        require(recipient != address(0), "Direccion invalida");
        require(amount >= 0.01 ether, "Debes enviar al menos 0.01 ETH");
        require(balances[msg.sender] >= amount, "Saldo insuficiente");
        
        balances[msg.sender] -= amount;
        totalBalance -= amount;
        
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Transferencia fallida");
        
        emit Transfer(msg.sender, recipient, amount, block.timestamp);
    }
    
    /**
     * @dev Obtiene el balance del usuario que llama
     */
    function getMyBalance() external view returns (uint256) {
        return balances[msg.sender];
    }
    
    /**
     * @dev Obtiene el balance de una dirección específica
     * @param account Dirección a consultar
     */
    function getBalanceOf(address account) external view returns (uint256) {
        return balances[account];
    }
    
    /**
     * @dev Obtiene el balance total del contrato
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Permite recibir ETH directamente (sin llamar deposit)
     */
    receive() external payable {
        require(msg.value >= 0.01 ether, "Debes enviar al menos 0.01 ETH");
        
        balances[msg.sender] += msg.value;
        totalBalance += msg.value;
        
        emit Deposit(msg.sender, msg.value, block.timestamp);
    }
    
    /**
     * @dev Fallback para recibir ETH
     */
    fallback() external payable {
        require(msg.value >= 0.01 ether, "Debes enviar al menos 0.01 ETH");
        
        balances[msg.sender] += msg.value;
        totalBalance += msg.value;
        
        emit Deposit(msg.sender, msg.value, block.timestamp);
    }
    
    /**
     * @dev Solo el owner puede retirar fondos de emergencia
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No hay fondos para retirar");
        
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Transferencia fallida");
    }
}
