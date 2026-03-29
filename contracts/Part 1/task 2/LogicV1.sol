// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract LogicV1 is Initializable, UUPSUpgradeable, OwnableUpgradeable {
    uint256 private counter;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __UUPSUpgradeable_init();
        __Ownable_init();
        counter = 0;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function increment() public {
        counter++;
    }

    function getCounter() public view returns (uint256) {
        return counter;
    }

    function version() public pure returns (string memory) {
        return "V1";
    }
}