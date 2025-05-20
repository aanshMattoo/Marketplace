require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      chainId: 31337, // Default Hardhat network
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    /*
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "", // Ensure this exists in .env
      accounts: [process.env.PRIVATE_KEY].filter(Boolean), // Ensure PRIVATE_KEY is defined
    },
    */
  },
};
