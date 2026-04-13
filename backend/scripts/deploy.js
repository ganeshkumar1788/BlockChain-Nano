const { ethers } = require("hardhat");

async function main() {
  const DeviceAuth = await ethers.getContractFactory("DeviceAuth");
  const contract = await DeviceAuth.deploy();

  await contract.waitForDeployment();

  console.log("Contract deployed to:", contract.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
