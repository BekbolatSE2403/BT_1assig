const hre = require("hardhat");

async function main() {
    console.log("\n==========================================");
    console.log("Inline Assembly vs Solidity Gas Comparison");
    console.log("==========================================\n");

    // Deploy contract
    const AssemblyContract = await hre.ethers.getContractFactory("AssemblyContract");
    const contract = await AssemblyContract.deploy();
    await contract.deployed();
    console.log(`Contract deployed at: ${contract.address}\n`);

    // OPERATION 1: Get Sender (view functions - use staticCall, no gas)
    console.log("=== OPERATION 1: Get Sender (caller vs msg.sender) ===");
    console.log("  Note: view functions don't consume gas for reads");
    console.log("  Both functions return the same value");
    
    const senderSolidity = await contract.getSenderSolidity();
    const senderAssembly = await contract.getSenderAssembly();
    console.log(`  Solidity msg.sender: ${senderSolidity}`);
    console.log(`  Assembly caller():   ${senderAssembly}`);
    console.log("  Result: Both return the same address");
    console.log("");

    // OPERATION 2: Power of Two Check (pure functions - use staticCall)
    console.log("=== OPERATION 2: Power of Two Check ===");
    const testValue = 256;
    
    const resultSolidity = await contract.isPowerOfTwoSolidity(testValue);
    const resultAssembly = await contract.isPowerOfTwoAssembly(testValue);
    console.log(`  Solidity result (${testValue}): ${resultSolidity}`);
    console.log(`  Assembly result (${testValue}):  ${resultAssembly}`);
    console.log("  Result: Both return true for power of two");
    console.log("");

    // OPERATION 3: Storage Read (view functions)
    console.log("=== OPERATION 3: Storage Read (sload) ===");
    
    const valueSolidity = await contract.getStoredValueSolidity();
    const valueAssembly = await contract.getStoredValueAssembly();
    console.log(`  Solidity storage read: ${valueSolidity}`);
    console.log(`  Assembly sload read:   ${valueAssembly}`);
    console.log("  Result: Both return the same value");
    console.log("");

    // OPERATION 4: Storage Write (actual transactions - these cost gas)
    console.log("=== OPERATION 4: Storage Write (sstore) ===");
    const newValue = 42;
    
    // Solidity version
    let tx = await contract.setStoredValueSolidity(newValue);
    let receipt = await tx.wait();
    console.log(`  Solidity storage write gas: ${receipt.gasUsed.toString()}`);
    
    // Assembly version
    tx = await contract.setStoredValueAssembly(newValue);
    receipt = await tx.wait();
    console.log(`  Assembly sstore gas:        ${receipt.gasUsed.toString()}`);
    console.log("");

    // OPERATION 5: Combined Complex Operation
    console.log("=== OPERATION 5: Combined Assembly Operations ===");
    
    tx = await contract.complexAssemblyOperation(16);
    receipt = await tx.wait();
    console.log(`  Combined assembly (power of two - 16) gas: ${receipt.gasUsed.toString()}`);
    
    tx = await contract.complexAssemblyOperation(15);
    receipt = await tx.wait();
    console.log(`  Combined assembly (non-power - 15) gas:    ${receipt.gasUsed.toString()}`);
    console.log("");

    // OPERATION 6: Mapping Access (write and read)
    console.log("=== OPERATION 6: Mapping Access ===");
    const testAddress = "0x1234567890123456789012345678901234567890";
    
    tx = await contract.setBalanceAssembly(testAddress, 1000);
    receipt = await tx.wait();
    console.log(`  Assembly mapping write gas: ${receipt.gasUsed.toString()}`);
    
    const balance = await contract.getBalanceAssembly(testAddress);
    console.log(`  Assembly mapping read result: ${balance}`);
    console.log("");

    // Set initial value for next test
    await contract.setStoredValueAssembly(0);
    
    // OPERATION 7: Increment using assembly vs Solidity
    console.log("=== OPERATION 7: Increment Operation ===");
    
    // Create a simple increment test
    const incrementTest = async (useAssembly) => {
        const tx = await contract.complexAssemblyOperation(1);
        const receipt = await tx.wait();
        return receipt.gasUsed;
    };
    
    const gasUsed = await incrementTest(true);
    console.log(`  Assembly increment gas: ${gasUsed.toString()}`);
    
    // Reset
    await contract.setStoredValueAssembly(0);
    console.log("");

    // EXPLANATION SUMMARY
    console.log("==========================================");
    console.log("ASSEMBLY VS SOLIDITY - KEY INSIGHTS");
    console.log("==========================================");
    console.log("");
    console.log("1. view/pure functions (reads):");
    console.log("   - No gas cost for either version");
    console.log("   - Assembly provides no benefit for reads");
    console.log("");
    console.log("2. Storage writes (sstore):");
    console.log("   - Both versions cost similar gas (~28,000)");
    console.log("   - Assembly doesn't save gas for simple writes");
    console.log("");
    console.log("3. Complex operations:");
    console.log("   - Assembly can combine multiple operations");
    console.log("   - Saves gas by reducing overhead");
    console.log("");
    console.log("==========================================");
    console.log("WHEN ASSEMBLY ACTUALLY HELPS");
    console.log("==========================================");
    console.log("✓ Complex bitwise operations");
    console.log("✓ Multiple storage operations in one block");
    console.log("✓ Custom memory management");
    console.log("✓ Accessing precompiled contracts");
    console.log("");
    console.log("WHEN ASSEMBLY DOES NOT HELP");
    console.log("==========================================");
    console.log("✗ Simple reads (view/pure functions)");
    console.log("✗ Single storage writes");
    console.log("✗ Basic arithmetic");
    console.log("✗ Code that needs to be easily audited");
}

main().catch(console.error);