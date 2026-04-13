// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SupplyChain {
    struct Package {
        string packageId;
        string status;
        uint256 lastUpdated;
    }

    mapping(string => Package) public packages;
    string[] public packageIds;

    event PackageRegistered(string packageId, uint256 timestamp);
    event StatusUpdated(string packageId, string status, uint256 timestamp);

    function registerPackage(string memory _packageId) public {
        require(bytes(packages[_packageId].packageId).length == 0, "Package already exists");
        
        packages[_packageId] = Package({
            packageId: _packageId,
            status: "Manufactured",
            lastUpdated: block.timestamp
        });
        
        packageIds.push(_packageId);
        emit PackageRegistered(_packageId, block.timestamp);
    }

    function updateStatus(string memory _packageId, string memory _status) public {
        require(bytes(packages[_packageId].packageId).length != 0, "Package not found");
        
        packages[_packageId].status = _status;
        packages[_packageId].lastUpdated = block.timestamp;
        
        emit StatusUpdated(_packageId, _status, block.timestamp);
    }

    function getPackageStatus(string memory _packageId) public view returns (string memory) {
        require(bytes(packages[_packageId].packageId).length != 0, "Package not found");
        return packages[_packageId].status;
    }

    function getAllPackages() public view returns (string[] memory) {
        return packageIds;
    }
}
