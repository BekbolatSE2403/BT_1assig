// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract AssemblyContract {
    // Storage variables to demonstrate sload and sstore
    uint256 private storedValue;
    address private owner;
    mapping(address => uint256) private balances;
    
    // Events for tracking
    event ValueUpdated(uint256 oldValue, uint256 newValue);
    event BalanceSet(address indexed user, uint256 amount);
    
    constructor() {
        owner = msg.sender;
        storedValue = 0;
    }
    
    // ============================================
    // OPERATION 1: Read msg.sender using caller()
    // ============================================
    
    // Assembly version - uses caller() opcode directly
    function getSenderAssembly() public view returns (address) {
        address sender;
        assembly {
            // caller() is an EVM opcode that returns msg.sender
            // This is more gas efficient than reading from calldata
            sender := caller()
        }
        return sender;
    }
    
    // Solidity version for comparison
    function getSenderSolidity() public view returns (address) {
        return msg.sender;
    }
    
    
    // ============================================
    // OPERATION 2: Power-of-2 check using AND operator
    // ============================================
    
    // Assembly version - uses bitwise operations directly
    function isPowerOfTwoAssembly(uint256 x) public pure returns (bool) {
        bool result;
        assembly {
            // For power of two numbers: x & (x-1) == 0
            // Example: 8 (1000) & 7 (0111) = 0
            // Example: 16 (10000) & 15 (01111) = 0
            // Example: 6 (0110) & 5 (0101) = 4 (not zero)
            
            let andResult := and(x, sub(x, 1))
            // Check if result is zero AND x is greater than zero
            result := and(eq(andResult, 0), gt(x, 0))
        }
        return result;
    }
    
    // Solidity version for comparison
    function isPowerOfTwoSolidity(uint256 x) public pure returns (bool) {
        if (x == 0) return false;
        return (x & (x - 1)) == 0;
    }
    
    
    // ============================================
    // OPERATION 3: Direct storage access using sload and sstore
    // ============================================
    
    // Assembly version - read storage using sload
    function getStoredValueAssembly() public view returns (uint256) {
        uint256 value;
        assembly {
            // sload reads from storage slot 0
            // This is more direct than Solidity's automatic getter
            value := sload(0)
        }
        return value;
    }
    
    // Solidity version for comparison
    function getStoredValueSolidity() public view returns (uint256) {
        return storedValue;
    }
    
    // Assembly version - write storage using sstore
    function setStoredValueAssembly(uint256 newValue) public {
        uint256 oldValue;
        assembly {
            // Read old value using sload
            oldValue := sload(0)
            // Write new value using sstore
            sstore(0, newValue)
        }
        emit ValueUpdated(oldValue, newValue);
    }
    
    // Solidity version for comparison
    function setStoredValueSolidity(uint256 newValue) public {
        uint256 oldValue = storedValue;
        storedValue = newValue;
        emit ValueUpdated(oldValue, newValue);
    }
    
    
    // ============================================
    // EXTRA: Read owner from storage slot 1
    // ============================================
    
    function getOwnerAssembly() public view returns (address) {
        address ownerAddress;
        assembly {
            // owner is stored at slot 1
            ownerAddress := sload(1)
        }
        return ownerAddress;
    }
    
    
    // ============================================
    // EXTRA: Combined assembly operations
    // ============================================
    
    // This function demonstrates multiple assembly operations together
    // It checks if a number is power of two, and if yes, adds it to storedValue
    function complexAssemblyOperation(uint256 x) public returns (bool) {
        uint256 newValue;
        bool isPower;
        
        assembly {
            // Read current stored value (slot 0)
            let current := sload(0)
            
            // Check if x is power of two
            let andResult := and(x, sub(x, 1))
            isPower := and(eq(andResult, 0), gt(x, 0))
            
            // Calculate new value
            newValue := add(current, x)
            
            // If x is power of two, update storage
            if isPower {
                sstore(0, newValue)
            }
        }
        
        if (isPower) {
            emit ValueUpdated(getStoredValueSolidity() - x, newValue);
        }
        
        return isPower;
    }
    
    
    // ============================================
    // Helper function to demonstrate mapping access in assembly
    // ============================================
    
    function setBalanceAssembly(address user, uint256 amount) public {
        assembly {
            // Calculate storage slot for mapping
            // Slot for balances is 2
            let slot := 2
            
            // keccak256 hash of user address and slot
            mstore(0, user)
            mstore(32, slot)
            let key := keccak256(0, 64)
            
            // Store the amount
            sstore(key, amount)
        }
        emit BalanceSet(user, amount);
    }
    
    function getBalanceAssembly(address user) public view returns (uint256) {
        uint256 amount;
        assembly {
            // Same calculation to find the storage slot
            mstore(0, user)
            mstore(32, 2)
            let key := keccak256(0, 64)
            amount := sload(key)
        }
        return amount;
    }
}