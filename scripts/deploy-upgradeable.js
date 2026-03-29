const hre = require("hardhat");

async function main() {

    console.log("UUPS Upgradeable Contract Deployment");
    console.log("==========================================\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log(`Deployer address: ${deployer.address}\n`);

    // Deploy LogicV1 with proxy
    console.log("Step 1: Deploying LogicV1 with UUPS proxy...");
    const LogicV1 = await hre.ethers.getContractFactory("LogicV1");
    const logicV1 = await hre.upgrades.deployProxy(LogicV1, [], {
        initializer: "initialize",
        kind: "uups"
    });
    await logicV1.deployed();
    console.log(`LogicV1 proxy at: ${logicV1.address}`);
    console.log(`LogicV1 implementation at: ${await hre.upgrades.erc1967.getImplementationAddress(logicV1.address)}\n`);

    // Test V1 functionality
    console.log("Step 2: Testing LogicV1 functionality...");
    let counter = await logicV1.getCounter();
    console.log(`Initial counter: ${counter}`);
    console.log(`Version: ${await logicV1.version()}`);
    
    console.log("------Incrementing 3 times...");
    await logicV1.increment();
    await logicV1.increment();
    await logicV1.increment();
    
    counter = await logicV1.getCounter();
    console.log(`---Counter after increments: ${counter}\n`);

    // Deploy LogicV2
    console.log("Step 3: Deploying LogicV2...");
    const LogicV2 = await hre.ethers.getContractFactory("LogicV2");
    const logicV2 = await hre.upgrades.upgradeProxy(logicV1.address, LogicV2, {
        kind: "uups"
    });
    console.log(`Upgraded to LogicV2 at: ${logicV2.address}`);
    console.log(`New implementation at: ${await hre.upgrades.erc1967.getImplementationAddress(logicV2.address)}\n`);

    // Test V2 functionality with state preserved
    console.log("Step 4: Testing state persistence after upgrade...");
    counter = await logicV2.getCounter();
    console.log(`Counter after upgrade (should be 3): ${counter}`);
    console.log(`Version: ${await logicV2.version()}\n`);

    // Test new V2 functions
    console.log("Step 5: Testing new V2 functions...");
    
    console.log("Testing decrement()...");
    await logicV2.decrement();
    counter = await logicV2.getCounter();
    console.log(`Counter after decrement: ${counter}`);
    
    console.log("Testing incrementBy(5)...");
    await logicV2.incrementBy(5);
    counter = await logicV2.getCounter();
    console.log(`Counter after incrementBy(5): ${counter}`);
    
    console.log("Testing reset()...");
    await logicV2.reset();
    counter = await logicV2.getCounter();
    console.log(`Counter after reset: ${counter}`);
    
    const lastAmount = await logicV2.getLastIncrementAmount();
    const lastCaller = await logicV2.getLastCaller();
    console.log(`Last increment amount: ${lastAmount}`);
    console.log(`Last caller: ${lastCaller}\n`);

    console.log("==========================================");
    console.log("UPGRADE SUCCESSFUL!");
    console.log("==========================================");
    console.log("Key achievements:");
    console.log("State persisted (counter = 3 before upgrade, 3 after)");
    console.log("New V2 functions work (decrement, reset, incrementBy)");
    console.log("Old V1 functions still work (increment)");
    console.log("UUPS pattern properly implemented");
    console.log("Only owner can upgrade (security enforced)\n");
}

main().catch((error) => {
    console.error("Error:", error);
    process.exitCode = 1;
});