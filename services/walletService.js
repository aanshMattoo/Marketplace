// backend/services/blockchain/walletService.js
const { ethers } = require("ethers");
require("dotenv").config();
//const marketABI = require("../contracts/Market.json"); // Adjust the path as needed
const marketABI = require("../blockchain/artifacts/contracts/ProductMarketplace.sol/ProductMarketplace.json").abi;


// For local testing, RPC_URL should be http://127.0.0.1:8545
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const marketContract = new ethers.Contract(
  process.env.MARKET_CONTRACT_ADDRESS,
  marketABI,
  wallet
);

/**
 * Deposit function: calls the smart contract's deposit(uint256) function.
 * @param {number|string} amount - Amount in rupees to deposit (as token units).
 * @returns {Promise<string>} - Transaction hash.
 */
const depositOnChain = async (walletId, amount) => {
  const tx = await marketContract.deposit(walletId, amount);
  await tx.wait();
  return tx.hash;
};
/**
 * Withdraw function: calls the smart contract's withdraw(uint256) function.
 * @param {number|string} amount - Amount in rupees to withdraw.
 * @returns {Promise<string>} - Transaction hash.
 */
const withdrawOnChain = async (walletId, amount) => {
  const tx = await marketContract.withdraw(walletId, amount);
  await tx.wait();
  return tx.hash;
};

module.exports = { depositOnChain, withdrawOnChain };
