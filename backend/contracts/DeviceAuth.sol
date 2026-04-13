// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DeviceAuth {

    mapping(address => bool) public registeredDevices;
    mapping(address => uint) public trustScore;

    function registerDevice(address device) public {
        registeredDevices[device] = true;
        trustScore[device] = 100;
    }

    function verifyDevice(address device) public view returns (bool) {
        return registeredDevices[device];
    }

    function updateTrustScore(address device, uint score) public {
        trustScore[device] = score;
    }

    function getTrustScore(address device) public view returns (uint) {
        return trustScore[device];
    }
}
