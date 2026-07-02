// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Faucet {
    address public owner;

    // Cantidad que entrega el faucet por solicitud
    uint256 public amount = 0.01 ether;

    // Tiempo de espera: 5 minutos
    uint256 public cooldown = 5 minutes;

    mapping(address => uint256) public lastRequest;

    event FaucetSent(
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );

    constructor() payable {
        owner = msg.sender;
    }

    /**
     * @notice Solicitar fondos del faucet
     */
    function requestFunds(address payable recipient) external {
        require(address(this).balance >= amount, "Faucet sin fondos");

        require(
            block.timestamp - lastRequest[recipient] >= cooldown,
            "Debes esperar 5 minutos entre solicitudes"
        );

        lastRequest[recipient] = block.timestamp;

        recipient.transfer(amount);

        emit FaucetSent(recipient, amount, block.timestamp);
    }

    /**
     * @notice Consultar el balance del faucet
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice Verifica si una dirección puede volver a solicitar
     */
    function canRequest(address user) external view returns (bool) {
        return block.timestamp - lastRequest[user] >= cooldown;
    }

    /**
     * @notice Tiempo restante para volver a solicitar
     */
    function nextRequestTime(address user) external view returns (uint256) {
        if (block.timestamp - lastRequest[user] >= cooldown) {
            return 0;
        }

        return (lastRequest[user] + cooldown) - block.timestamp;
    }

    /**
     * @notice Cambiar la cantidad entregada por solicitud
     */
    function setAmount(uint256 _amount) external {
        require(msg.sender == owner, "Solo el owner");
        amount = _amount;
    }

    /**
     * @notice Retirar todos los fondos del faucet
     */
    function withdraw() external {
        require(msg.sender == owner, "Solo el owner");
        payable(owner).transfer(address(this).balance);
    }

    /**
     * @notice Permite recibir ETH directamente
     */
    receive() external payable {}
}