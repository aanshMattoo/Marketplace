require("dotenv").config();
const { ethers } = require("ethers");

// Verify that the environment variables are correctly loaded
console.log("RPC_URL:", process.env.RPC_URL);
console.log("PRIVATE_KEY:", process.env.PRIVATE_KEY ? "Loaded" : "Missing");
console.log("MARKET_CONTRACT_ADDRESS:", process.env.MARKET_CONTRACT_ADDRESS);

// Ensure RPC_URL and PRIVATE_KEY exist
if (!process.env.RPC_URL || !process.env.PRIVATE_KEY || !process.env.MARKET_CONTRACT_ADDRESS) {
    console.error("Missing environment variables! Check your .env file.");
    process.exit(1);
}

// Connect to Ethereum network
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

// Create wallet instance
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Load contract
const marketABI = require("./contracts/Market.json"); // Adjust the path if necessary
const contract = new ethers.Contract(process.env.MARKET_CONTRACT_ADDRESS, marketABI, wallet);

async function testContract() {
    try {
        console.log("Testing contract interaction...");

        // Example: Call a function from the contract
        const owner = await contract.owner(); // Assuming your contract has an 'owner' function
        console.log("Contract owner:", owner);
    } catch (error) {
        console.error("Error interacting with contract:", error);
    }
}

testContract();
