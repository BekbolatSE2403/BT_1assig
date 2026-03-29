// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract LogicV2 is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    uint256 private counter;
    uint256 private lastIncrementAmount;
    address private lastCaller;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __UUPSUpgradeable_init();
        __Ownable_init();
        counter = 0;
        lastIncrementAmount = 0;
        lastCaller = address(0);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // V1 functions preserved
    function increment() public {
        counter++;
        lastIncrementAmount = 1;
        lastCaller = msg.sender;
    }

    function getCounter() public view returns (uint256) {
        return counter;
    }

    // New V2 functions
    function decrement() public {
        require(counter > 0, "Counter cannot go below zero");
        counter--;
        lastIncrementAmount = 0;
        lastCaller = msg.sender;
    }

    function reset() public {
        counter = 0;
        lastIncrementAmount = 0;
        lastCaller = msg.sender;
    }

    function incrementBy(uint256 amount) public {
        require(amount > 0, "Amount must be positive");
        counter += amount;
        lastIncrementAmount = amount;
        lastCaller = msg.sender;
    }

    function getLastIncrementAmount() public view returns (uint256) {
        return lastIncrementAmount;
    }

    function getLastCaller() public view returns (address) {
        return lastCaller;
    }

    function version() public pure returns (string memory) {
        return "V2";
    }
}