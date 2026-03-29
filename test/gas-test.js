const { expect } = require("chai");

describe("Gas Comparison", function() {
    let unoptimized, optimized;
    
    before(async function() {
        const Unoptimized = await ethers.getContractFactory("UnoptimizedContract");
        unoptimized = await Unoptimized.deploy();
        await unoptimized.deployed();
        
        const Optimized = await ethers.getContractFactory("OptimizedContract");
        optimized = await Optimized.deploy();
        await optimized.deployed();
    });
    
    it("Unoptimized setValue", async function() {
        await unoptimized.setValue(500);
    });
    
    it("Optimized setValue", async function() {
        await optimized.setValue(500);
    });
    
    it("Unoptimized incrementCounter", async function() {
        await unoptimized.incrementCounter(10);
    });
    
    it("Optimized incrementCounter", async function() {
        await optimized.incrementCounter(10);
    });
});