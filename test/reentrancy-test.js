const hre = require("hardhat");

async function main() {
    console.log("\n==========================================");
    console.log("REENTRANCY ATTACK DEMONSTRATION");
    console.log("==========================================\n");

    const [owner, attacker] = await hre.ethers.getSigners();
    
    // Deploy Vulnerable Vault
    console.log("Step 1: Deploying Vulnerable Vault...");
    const VulnerableVault = await hre.ethers.getContractFactory("VulnerableVault");
    const vulnerableVault = await VulnerableVault.deploy();
    await vulnerableVault.deployed();
    console.log(`  Vulnerable Vault at: ${vulnerableVault.address}`);
    
    // Deploy Fixed Vault
    console.log("\nStep 2: Deploying Fixed Vault (with protection)...");
    const FixedVault = await hre.ethers.getContractFactory("FixedVault");
    const fixedVault = await FixedVault.deploy();
    await fixedVault.deployed();
    console.log(`  Fixed Vault at: ${fixedVault.address}`);
    
    // Deploy Attacker
    console.log("\nStep 3: Deploying Attacker Contract...");
    const Attacker = await hre.ethers.getContractFactory("Attacker");
    const attackerContract = await Attacker.deploy(vulnerableVault.address);
    await attackerContract.deployed();
    console.log(`  Attacker at: ${attackerContract.address}`);
    
    // Fund attacker contract
    console.log("\nStep 4: Funding attacker contract with 2 ETH...");
    await owner.sendTransaction({
        to: attackerContract.address,
        value: hre.ethers.utils.parseEther("2")
    });
    console.log("  Attacker funded!");
    
    // Owner deposits 10 ETH to vault
    console.log("\nStep 5: Owner deposits 10 ETH to vulnerable vault...");
    await vulnerableVault.connect(owner).deposit({
        value: hre.ethers.utils.parseEther("10")
    });
    
    let vaultBalance = await hre.ethers.provider.getBalance(vulnerableVault.address);
    console.log(`  Vault balance: ${hre.ethers.utils.formatEther(vaultBalance)} ETH`);
    
    console.log("\n==========================================");
    console.log("HOW REENTRANCY WORKS");
    console.log("==========================================");
    console.log(`
    The vulnerable vault has this withdraw function:
    
    function withdraw(uint256 amount) external {
        require(balances[msg.sender] >= amount);
        
        // PROBLEM: Sends ETH BEFORE updating balance
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success);
        
        // Updates balance AFTER sending (TOO LATE!)
        balances[msg.sender] -= amount;
    }
    
    The attacker's receive() function calls withdraw() again:
    
    receive() external payable {
        if (attackCount < 10) {
            attackCount++;
            vault.withdraw(msg.value);  // Re-enters!
        }
    }
    
    This creates a loop:
    1. Attacker calls withdraw(1 ETH)
    2. Vault sends 1 ETH to attacker
    3. Attacker's receive() triggers
    4. Attacker calls withdraw(1 ETH) again
    5. Vault still thinks attacker has 1 ETH (not updated yet!)
    6. Repeat until vault is drained
    `);
    
    console.log("\n==========================================");
    console.log("FIXED VERSION - Checks-Effects-Interactions");
    console.log("==========================================");
    console.log(`
    The fixed vault uses the correct pattern:
    
    function withdraw(uint256 amount) external nonReentrant {
        require(balances[msg.sender] >= amount);
        
        // EFFECT: Update balance FIRST
        balances[msg.sender] -= amount;
        
        // INTERACTION: Send ETH LAST
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success);
    }
    
    This prevents reentrancy because:
    - Balance is updated before sending ETH
    - If attacker tries to withdraw again, balance is already 0
    - ReentrancyGuard adds extra protection
    `);
    
    console.log("\n==========================================");
    console.log("ACCESS CONTROL VULNERABILITY");
    console.log("==========================================");
    console.log(`
    The vulnerable access contract had functions without access control:
    
    function setOwner(address newOwner) public {
        owner = newOwner;  // Anyone can call this!
    }
    
    function withdraw() public {
        payable(msg.sender).transfer(address(this).balance);  // Anyone can withdraw!
    }
    
    The fixed version uses OpenZeppelin's Ownable:
    
    function withdraw() external onlyOwner {
        // Only owner can call
    }
    `);
    
    console.log("\n==========================================");
    console.log("SUMMARY");
    console.log("==========================================");
    console.log("Vulnerability A - Reentrancy:");
    console.log("  Root Cause: State update after external call");
    console.log("  Fix: Checks-Effects-Interactions pattern");
    console.log("  Real Example: The DAO Hack ($60 million)");
    console.log("");
    console.log("Vulnerability B - Access Control:");
    console.log("  Root Cause: Missing require statements");
    console.log("  Fix: Use OpenZeppelin Ownable");
    console.log("  Real Example: Wormhole Hack ($325 million)");
}

main().catch(console.error);