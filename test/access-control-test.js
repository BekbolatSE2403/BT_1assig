const { expect } = require("chai");

describe("Access Control Vulnerabilities", function() {
    let vulnerableAccess, fixedAccess;
    let owner, attacker;
    
    beforeEach(async function() {
        [owner, attacker] = await ethers.getSigners();
        
        // Deploy vulnerable contract
        const VulnerableAccess = await ethers.getContractFactory("VulnerableAccess");
        vulnerableAccess = await VulnerableAccess.deploy();
        await vulnerableAccess.deployed();
        
        // Deploy fixed contract
        const FixedAccess = await ethers.getContractFactory("FixedAccess");
        fixedAccess = await FixedAccess.deploy();
        await fixedAccess.deployed();
    });
    
    describe("Vulnerable Access - Before Fix", function() {
        it("Owner should be able to withdraw", async function() {
            // Send funds to contract
            await owner.sendTransaction({
                to: vulnerableAccess.address,
                value: ethers.utils.parseEther("1")
            });
            
            let balance = await vulnerableAccess.getBalance();
            expect(balance).to.equal(ethers.utils.parseEther("1"));
            
            // Owner withdraws
            await vulnerableAccess.connect(owner).withdraw();
            
            balance = await vulnerableAccess.getBalance();
            expect(balance).to.equal(0);
        });
        
        it("SHOULD allow attacker to change owner", async function() {
            // Attacker changes owner
            await vulnerableAccess.connect(attacker).setOwner(attacker.address);
            
            const newOwner = await vulnerableAccess.owner();
            expect(newOwner).to.equal(attacker.address);
        });
        
        it("SHOULD allow attacker to withdraw funds", async function() {
            // Send funds to contract
            await owner.sendTransaction({
                to: vulnerableAccess.address,
                value: ethers.utils.parseEther("1")
            });
            
            // Get initial attacker balance
            const initialAttackerBalance = await attacker.getBalance();
            
            // Attacker withdraws (should succeed!)
            await vulnerableAccess.connect(attacker).withdraw();
            
            const finalAttackerBalance = await attacker.getBalance();
            
            // Attacker gained funds
            expect(finalAttackerBalance).to.be.gt(initialAttackerBalance);
        });
        
        it("SHOULD allow attacker to toggle active state", async function() {
            const initialState = await vulnerableAccess.isActive();
            
            // Attacker toggles
            await vulnerableAccess.connect(attacker).toggleActive();
            
            const newState = await vulnerableAccess.isActive();
            expect(newState).to.not.equal(initialState);
        });
    });
    
    describe("Fixed Access - After Fix", function() {
        it("Only owner can withdraw", async function() {
            // Send funds
            await owner.sendTransaction({
                to: fixedAccess.address,
                value: ethers.utils.parseEther("1")
            });
            
            // Attacker tries to withdraw - should fail
            await expect(
                fixedAccess.connect(attacker).withdraw()
            ).to.be.revertedWith("Ownable: caller is not the owner");
            
            // Owner withdraws - should succeed
            await fixedAccess.connect(owner).withdraw();
            
            const balance = await fixedAccess.getBalance();
            expect(balance).to.equal(0);
        });
        
        it("Only owner can toggle active state", async function() {
            // Attacker tries to toggle - should fail
            await expect(
                fixedAccess.connect(attacker).toggleActive()
            ).to.be.revertedWith("Ownable: caller is not the owner");
            
            // Owner toggles - should succeed
            await fixedAccess.connect(owner).toggleActive();
            
            const newState = await fixedAccess.isActive();
            expect(newState).to.equal(false);
        });
        
        it("Owner cannot be changed by attacker", async function() {
            // FixedAccess uses Ownable - no direct setOwner function
            // Attacker would need to call transferOwnership which requires owner
            await expect(
                fixedAccess.connect(attacker).transferOwnership(attacker.address)
            ).to.be.revertedWith("Ownable: caller is not the owner");
            
            const currentOwner = await fixedAccess.owner();
            expect(currentOwner).to.equal(owner.address);
        });
    });
});