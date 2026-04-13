import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const config = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.INFURA_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  }
};

export default config;
