// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./ChildContract.sol";

contract Factory {
    address[] public allDeployedContracts;
    mapping(string => address) public contractByName;
    mapping(address => string) public deploymentMethod;

    event ContractCreated(address indexed contractAddress, string name, string method);
    
    uint256 public lastCreateGasUsed;
    uint256 public lastCreate2GasUsed;

    function deployWithCreate(string memory _name) external returns (address) {
        uint256 gasStart = gasleft();
        
        ChildContract newContract = new ChildContract(msg.sender, _name);
        address contractAddress = address(newContract);
        
        uint256 gasUsed = gasStart - gasleft();
        lastCreateGasUsed = gasUsed;
        
        allDeployedContracts.push(contractAddress);
        contractByName[_name] = contractAddress;
        deploymentMethod[contractAddress] = "CREATE";
        
        emit ContractCreated(contractAddress, _name, "CREATE");
        return contractAddress;
    }

    function deployWithCreate2(string memory _name, bytes32 _salt) external returns (address) {
        uint256 gasStart = gasleft();
        
        ChildContract newContract = new ChildContract{salt: _salt}(msg.sender, _name);
        address contractAddress = address(newContract);
        
        uint256 gasUsed = gasStart - gasleft();
        lastCreate2GasUsed = gasUsed;
        
        allDeployedContracts.push(contractAddress);
        contractByName[_name] = contractAddress;
        deploymentMethod[contractAddress] = "CREATE2";
        
        emit ContractCreated(contractAddress, _name, "CREATE2");
        return contractAddress;
    }

    function predictCreate2Address(bytes32 _salt) external view returns (address) {
        bytes memory bytecode = type(ChildContract).creationCode;
        bytes memory constructorArgs = abi.encode(msg.sender, "");
        bytes memory fullBytecode = abi.encodePacked(bytecode, constructorArgs);
        
        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(this),
                _salt,
                keccak256(fullBytecode)
            )
        );
        return address(uint160(uint256(hash)));
    }

    function getDeployedContracts() external view returns (address[] memory) {
        return allDeployedContracts;
    }

    function getDeploymentCount() external view returns (uint256) {
        return allDeployedContracts.length;
    }
}