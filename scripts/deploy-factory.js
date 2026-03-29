const hre = require("hardhat");

async function main() {
    console.log("=== Factory Pattern Deployment ===\n");

    const Factory = await hre.ethers.getContractFactory("Factory");
    const factory = await Factory.deploy();
    await factory.deployed();
    const factoryAddress = factory.address;
    console.log("Factory deployed to:", factoryAddress);
    console.log("");

    console.log("--- Testing CREATE Deployment ---");
    const createTx = await factory.deployWithCreate("Child_With_CREATE");
    const createReceipt = await createTx.wait();
    
    // Get the deployed address from the events
    const createEvent = createReceipt.events.find(
        event => event.event === "ContractCreated"
    );
    const createAddress = createEvent ? createEvent.args.contractAddress : "Event not found";
    console.log("CREATE deployed child at:", createAddress);
    
    const createGasUsed = await factory.lastCreateGasUsed();
    console.log("Gas used for CREATE:", createGasUsed.toString());
    console.log("");

    console.log("--- Testing CREATE2 Deployment ---");
    const salt = "0x" + "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    const create2Tx = await factory.deployWithCreate2("Child_With_CREATE2", salt);
    const create2Receipt = await create2Tx.wait();
    
    const create2Event = create2Receipt.events.find(
        event => event.event === "ContractCreated"
    );
    const create2Address = create2Event ? create2Event.args.contractAddress : "Event not found";
    console.log("CREATE2 deployed child at:", create2Address);
    
    const create2GasUsed = await factory.lastCreate2GasUsed();
    console.log("Gas used for CREATE2:", create2GasUsed.toString());
    console.log("");

    const allContracts = await factory.getDeployedContracts();
    console.log("--- Summary ---");
    console.log("Total contracts deployed:", allContracts.length);
    console.log("All contract addresses:", allContracts);
    console.log("");
    
    console.log("=== Gas Comparison ===");
    console.log("| Method  | Gas Used |");
    console.log("|---------|----------|");
    console.log(`| CREATE  | ${createGasUsed.toString()} |`);
    console.log(`| CREATE2 | ${create2GasUsed.toString()} |`);
    
    const diff = parseInt(createGasUsed) - parseInt(create2GasUsed);
    console.log(`\nDifference: ${Math.abs(diff)} gas (${diff > 0 ? "CREATE more expensive" : "CREATE2 more expensive"})`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});