const hre = require("hardhat");

async function main() {
    console.log("Gas Optimization Comparison");
    console.log("--------------------------------\n");

    // Deploy both contracts
    console.log("Deploying contracts");
    const Unoptimized = await hre.ethers.getContractFactory("UnoptimizedContract");
    const unoptimized = await Unoptimized.deploy();
    await unoptimized.deployed();
    
    const Optimized = await hre.ethers.getContractFactory("OptimizedContract");
    const optimized = await Optimized.deploy();
    await optimized.deployed();
    console.log("Both contracts deployed\n");

    console.log("TEST 1: setValue Function");
    
    // Unoptimized
    let tx = await unoptimized.setValue(500);
    let receipt = await tx.wait();
    console.log(`Unoptimized setValue gas: ${receipt.gasUsed.toString()}`);
    
    // Optimized
    tx = await optimized.setValue(500);
    receipt = await tx.wait();
    console.log(`Optimized setValue gas: ${receipt.gasUsed.toString()}`);
    console.log("");

    console.log("TEST 2: incrementCounter (10 times)");
    
    // Unoptimized
    tx = await unoptimized.incrementCounter(10);
    receipt = await tx.wait();
    console.log(`Unoptimized incrementCounter gas: ${receipt.gasUsed.toString()}`);
    
    // Optimized
    tx = await optimized.incrementCounter(10);
    receipt = await tx.wait();
    console.log(`Optimized incrementCounter gas: ${receipt.gasUsed.toString()}`);
    console.log("");

    console.log("TEST 3: addToNumbers (5 numbers)");
    const numbers = [1, 2, 3, 4, 5];
    
    // Unoptimized
    tx = await unoptimized.addToNumbers(numbers);
    receipt = await tx.wait();
    console.log(`Unoptimized addToNumbers gas: ${receipt.gasUsed.toString()}`);
    
    // Optimized
    tx = await optimized.addToNumbers(numbers);
    receipt = await tx.wait();
    console.log(`Optimized addToNumbers gas: ${receipt.gasUsed.toString()}`);
    console.log("");

    console.log("TEST 4: toggleActive Function");
    
    // Unoptimized
    tx = await unoptimized.toggleActive();
    receipt = await tx.wait();
    console.log(`Unoptimized toggleActive gas: ${receipt.gasUsed.toString()}`);
    
    // Optimized
    tx = await optimized.toggleActive();
    receipt = await tx.wait();
    console.log(`Optimized toggleActive gas: ${receipt.gasUsed.toString()}`);
    console.log("");
}

main().catch(console.error);