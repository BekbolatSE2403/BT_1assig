// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// FIXED VERSION - Protected against reentrancy
contract FixedVault is ReentrancyGuard {
    mapping(address => uint256) public balances;
    address public owner;
    
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    
    constructor() {
        owner = msg.sender;
    }
    
    function deposit() external payable {
        require(msg.value > 0, "Must send positive amount");
        balances[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }
    
    // FIX 1: Checks-Effects-Interactions pattern
    // FIX 2: ReentrancyGuard modifier
    function withdraw(uint256 amount) external nonReentrant {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        // EFFECT: Update state FIRST
        balances[msg.sender] -= amount;
        
        // INTERACTION: External call LAST
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit Withdrawn(msg.sender, amount);
    }
    
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}