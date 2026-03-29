// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

// FIXED VERSION - Using OpenZeppelin Ownable
contract FixedAccess is Ownable {
    uint256 public funds;
    bool public isActive;
    
    event FundsWithdrawn(address indexed to, uint256 amount);
    event Toggled(bool isActive);
    
    constructor() {
        isActive = true;
    }
    
    // FIXED: Only owner can call (inherited from Ownable)
    function withdraw() external onlyOwner {
        uint256 amount = address(this).balance;
        require(amount > 0, "No funds to withdraw");
        
        payable(owner()).transfer(amount);
        emit FundsWithdrawn(owner(), amount);
    }
    
    // FIXED: Only owner can call
    function toggleActive() external onlyOwner {
        isActive = !isActive;
        emit Toggled(isActive);
    }
    
    // Owner can transfer ownership using Ownable's transferOwnership
    // No need for custom setOwner function
    
    // Receive ETH
    receive() external payable {
        funds += msg.value;
    }
    
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}