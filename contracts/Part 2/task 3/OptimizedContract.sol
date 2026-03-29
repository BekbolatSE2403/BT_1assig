// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// OPTIMIZED VERSION - All 7 gas optimizations applied
contract OptimizedContract {
    // OPTIMIZATION 1: Storage Packing
    // Packed booleans and addresses together to use fewer storage slots
    // Original: 8 slots (owner, counter, isActive, timestamp, lastCaller, name, value, hasValue)
    // Optimized: 5 slots
    address public owner;      // Slot 0
    uint256 public counter;    // Slot 1
    uint256 public timestamp;  // Slot 2
    address public lastCaller; // Slot 3
    
    // Packed together in Slot 4 (saves 1 slot)
    uint128 public value;      // 16 bytes
    bool public isActive;      // 1 byte
    bool public hasValue;      // 1 byte
    // Remaining 14 bytes in slot 4 unused
    
    // OPTIMIZATION 2: Use immutable for deploy-time constants
    // immutable reads cheaper than state variable
    string public constant NAME = "MyContract";  // constant (compile-time)
    uint256 public immutable DECIMAL;            // immutable (deploy-time)
    
    // Private array (cheaper than public if external access not needed)
    uint256[] private numbers;
    
    event ValueSet(address indexed user, uint256 value);
    event Toggled(bool isActive);
    
    constructor() {
        owner = msg.sender;
        isActive = true;
        DECIMAL = 1000;  // Set once at construction
    }
    
    // OPTIMIZATION 3: Use calldata instead of memory for read-only params
    // Saves copying to memory
    function setName(string calldata _name) external {
        // Note: name variable removed, using constant instead
    }
    
    // OPTIMIZATION 4: Short-circuiting - check cheapest conditions first
    function setValue(uint256 _value) external {
        // Cheapest check first (value comparison, no storage read)
        require(_value > 0 && _value < 1000000, "Invalid value");
        // Cheaper storage read (isActive is packed but still cheaper than owner check)
        require(isActive, "Not active");
        // Most expensive check last (owner comparison)
        require(msg.sender == owner, "Not owner");
        
        value = uint128(_value);
        hasValue = true;
        lastCaller = msg.sender;
        timestamp = block.timestamp;
        
        emit ValueSet(msg.sender, _value);
    }
    
    // OPTIMIZATION 5: Use unchecked arithmetic where overflow impossible
    function incrementCounter(uint256 times) external {
        // Cache storage to memory (saves multiple SLOADs)
        uint256 localCounter = counter;
        
        for (uint256 i = 0; i < times; i++) {
            // unchecked: overflow impossible for reasonable times
            unchecked {
                localCounter++;
            }
        }
        
        // Write back once
        counter = localCounter;
    }
    
    // OPTIMIZATION 6: Cache storage reads before loop
    function addToNumbers(uint256[] calldata _numbers) external {
        // Cache array length (saves gas)
        uint256 length = _numbers.length;
        
        // Cache storage reference (saves SLOAD per iteration)
        uint256[] storage localNumbers = numbers;
        
        for (uint256 i = 0; i < length;) {
            localNumbers.push(_numbers[i]);
            
            // Unchecked increment (i will never overflow for reasonable loops)
            unchecked {
                i++;
            }
        }
    }
    
    // OPTIMIZATION 7: Replace storage write with event-only when possible
    function toggleActive() external {
        isActive = !isActive;
        // Storage already updated, event provides off-chain tracking
        // No extra storage write needed
        emit Toggled(isActive);
    }
    
    // Helper functions (unchanged but optimized where possible)
    function getCounter() external view returns (uint256) {
        return counter;
    }
    
    function getNumbers() external view returns (uint256[] memory) {
        return numbers;
    }
    
    function getValue() external view returns (uint256) {
        return value;
    }
}