// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// THIS CONTRACT HAS ACCESS CONTROL VULNERABILITIES
// Anyone can call privileged functions

contract VulnerableAccess {
    address public owner;
    uint256 public funds;
    bool public isActive;
    
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event FundsWithdrawn(address indexed to, uint256 amount);
    
    constructor() {
        owner = msg.sender;
        isActive = true;
    }
    
    // VULNERABLE: No access control on setOwner
    // Anyone can change the owner!
    function setOwner(address newOwner) public {
        // Missing: require(msg.sender == owner, "Not owner")
        owner = newOwner;
        emit OwnershipTransferred(msg.sender, newOwner);
    }
    
    // VULNERABLE: No access control on withdraw
    // Anyone can withdraw all funds!
    function withdraw() public {
        // Missing: require(msg.sender == owner, "Not owner")
        uint256 amount = address(this).balance;
        require(amount > 0, "No funds to withdraw");
        
        payable(msg.sender).transfer(amount);
        emit FundsWithdrawn(msg.sender, amount);
    }
    
    // VULNERABLE: No access control on toggleActive
    function toggleActive() public {
        // Missing access control
        isActive = !isActive;
    }
    
    // Receive ETH
    receive() external payable {
        funds += msg.value;
    }
    
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}