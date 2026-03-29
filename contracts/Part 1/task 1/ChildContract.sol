// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ChildContract {
    address public owner;
    string public name;
    uint256 public balance;

    event Deposited(address indexed from, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);

    constructor(address _owner, string memory _name) {
        owner = _owner;
        name = _name;
        balance = 0;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    function deposit() external payable {
        require(msg.value > 0, "Must send positive amount");
        balance += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    function withdraw() external onlyOwner {
        uint256 amount = balance;
        require(amount > 0, "No balance to withdraw");
        balance = 0;
        payable(owner).transfer(amount);
        emit Withdrawn(owner, amount);
    }

    function getBalance() external view returns (uint256) {
        return balance;
    }
}