// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// THIS CONTRACT IS DELIBERATELY UNOPTIMIZED
// Contains 7 gas-wasting patterns to fix
contract UnoptimizedContract {
    // BAD: Variables not packed (uses multiple storage slots)
    address public owner;
    uint256 public counter;
    bool public isActive;
    uint256 public timestamp;
    address public lastCaller;
    string public name;
    uint256 public value;
    bool public hasValue;
    
    // BAD: Public arrays cost more gas
    uint256[] public numbers;
    
    // BAD: State variable that could be constant/immutable
    uint256 public DECIMAL = 1000;
    
    event ValueSet(address indexed user, uint256 value);
    
    constructor() {
        owner = msg.sender;
        isActive = true;
        name = "MyContract";
    }
    
    // BAD: Uses memory for read-only parameter (should be calldata)
    function setName(string memory _name) public {
        name = _name;
    }
    
    // BAD: No short-circuiting (checks expensive condition first)
    function setValue(uint256 _value) public {
        require(isActive == true, "Not active");
        require(_value > 0 && _value < 1000000, "Invalid value");
        require(msg.sender == owner, "Not owner");
        
        value = _value;
        hasValue = true;
        lastCaller = msg.sender;
        timestamp = block.timestamp;
        
        emit ValueSet(msg.sender, _value);
    }
    
    // BAD: Unchecked arithmetic not used where safe
    function incrementCounter(uint256 times) public {
        for (uint256 i = 0; i < times; i++) {
            counter++;
        }
    }
    
    // BAD: Multiple storage reads in loop
    function addToNumbers(uint256[] memory _numbers) public {
        for (uint256 i = 0; i < _numbers.length; i++) {
            numbers.push(_numbers[i]);
        }
    }
    
    // BAD: Event emitted but storage still written unnecessarily
    function toggleActive() public {
        isActive = !isActive;
        emit ValueSet(msg.sender, isActive ? 1 : 0);
    }
    
    function getCounter() public view returns (uint256) {
        return counter;
    }
    
    function getNumbers() public view returns (uint256[] memory) {
        return numbers;
    }
}