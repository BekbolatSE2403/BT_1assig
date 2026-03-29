// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// THIS CONTRACT IS VULNERABLE TO REENTRANCY ATTACK
// Do not use in production - educational purpose only

contract VulnerableVault {
    mapping(address => uint256) public balances;
    address public owner;
    
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    
    constructor() {
        owner = msg.sender;
    }
    
    // Deposit ETH to the vault
    function deposit() external payable {
        require(msg.value > 0, "Must send positive amount");
        balances[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }
    
    // VULNERABLE: Withdraw sends ETH before updating balance
    // This allows reentrancy attack
    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        // VULNERABLE: External call BEFORE state update
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        // State update AFTER external call (TOO LATE!)
        balances[msg.sender] -= amount;
        emit Withdrawn(msg.sender, amount);
    }
    
    // Get contract balance
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}