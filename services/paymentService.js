const { ethers } = require("ethers");
const INRToken = require("../contracts/INRToken.json"); // ABI for INRToken contract

// Initialize provider and signer
const provider = new ethers.providers.InfuraProvider("goerli", process.env.INFURA_PROJECT_ID);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Initialize INRToken contract
const inrTokenContract = new ethers.Contract(process.env.INR_TOKEN_ADDRESS, INRToken.abi, wallet);

// Mint INRToken
const mintINRToken = async (to, amount) => {
  try {
    const tx = await inrTokenContract.mint(to, amount);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error("Error minting INRToken:", error);
    throw error;
  }
};

// Burn INRToken
const burnINRToken = async (from, amount) => {
  try {
    const tx = await inrTokenContract.burn(from, amount);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error("Error burning INRToken:", error);
    throw error;
  }
};

module.exports = { mintINRToken, burnINRToken };