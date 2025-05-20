const { JsonRpcProvider, Wallet, Contract, parseEther } = require("ethers");
require("dotenv").config();
const productABI = require("../blockchain/artifacts/contracts/ProductMarketplace.sol/ProductMarketplace.json").abi;
const axios = require("axios");

const provider = new JsonRpcProvider(process.env.RPC_URL);
const wallet = new Wallet(process.env.PRIVATE_KEY, provider);
const marketContract = new Contract(process.env.MARKET_CONTRACT_ADDRESS, productABI, wallet);

/**
 * Lists a product on-chain.
 * Uses callStatic to simulate the function and get the new product id,
 * then sends the transaction.
 * @param {string|number} price - Price for the product (in the appropriate unit)
 * @returns {Promise<string>} - The new product id as a string.
 */
const listProductOnChain = async (price) => {
  const priceInWei = price;

  // Send actual transaction
  const tx = await marketContract.listProduct(priceInWei);
  const receipt = await tx.wait(); // Wait for it to be mined

  // Extract productId from emitted event
  const event = receipt.logs
  ?.map((log) => {
    try {
      return marketContract.interface.parseLog(log);
    } catch (e) {
      return null;
    }
  })
  .find((parsed) => parsed?.name === "ProductListed");

  if (!event) {
    throw new Error("ProductListed event not found");
  }

  const productId = event.args.id.toString(); // `id` is from the event definition
  return productId;
};


// Function to transfer product ownership on the blockchain
const transferProductOwnershipOnChain = async (productId, buyerAddress) => {
  try {
    console.log("Transferring ownership of product", productId, "to:", buyerAddress);

    const tx = await marketContract.transferProductOwnership(
      productId, // uint256 _productId
      buyerAddress // address _newOwner
    );

    const receipt = await tx.wait();
    console.log("Ownership transferred!", receipt.transactionHash);
    return receipt.transactionHash;
  } catch (error) {
    console.error("Error transferring product ownership on-chain:", error);
    throw error;
  }
};

const getEthPriceInRupees = async () => {
  try {
    const coingeckoURL = process.env.COINGECKO_API_URL.replace(/\/+$/, "");
    const apiUrl = `${coingeckoURL}/simple/price?ids=ethereum&vs_currencies=inr`;
    
    console.log('Making request to:', apiUrl);
    
    const response = await axios.get(apiUrl, {
      timeout: 10000,
      headers: {
        'Accept-Encoding': 'gzip',
        'User-Agent': 'YourApp/1.0'
      }
    });

    console.log('API Response:', response.data);
    
    if (!response.data?.ethereum?.inr) {
      throw new Error('Unexpected API response format');
    }
    
    return response.data.ethereum.inr;
  } catch (error) {
    console.error("Full error details:", {
      message: error.message,
      code: error.code,
      responseData: error.response?.data
    });
    throw new Error("Failed to fetch ETH price");
  }
};

/**
 * Transfers ETH on-chain by using the buyer's dummy private key.
 * @param {string|number} blockchainProductId - The product's on-chain ID (b_id) stored in MongoDB.
 * @param {string} buyerWalletId - The buyer's wallet address.
 * @param {string} sellerWalletId - The seller's wallet address.
 * @param {BigNumber|string} ethAmount - The required ETH amount in wei.
 * @param {string} buyerPrivateKey - The buyer's private key (from dummyKeys mapping).
 * @returns {Promise<string>} - The transaction hash.
 */
const transferETHOnChain = async (blockchainProductId, buyerWalletId, sellerWalletId, ethAmount, buyerPrivateKey) => {
  try {
    // Create a buyer signer using the buyer's dummy private key.
    const buyerSigner = new Wallet(buyerPrivateKey.trim(), provider);
    // Connect the contract with the buyer's signer so that the transaction is sent from the buyer's account.
    const buyerContract = marketContract.connect(buyerSigner);
    // Call the transferETH function on the smart contract, sending msg.value = ethAmount.
    const tx = await buyerContract.transferETH(blockchainProductId, buyerWalletId, sellerWalletId, { value: ethAmount });
    const receipt = await tx.wait();
    return receipt.transactionHash;
  } catch (error) {
    console.error("Error transferring ETH on-chain:", error);
    throw error;
  }
};
module.exports = {
  listProductOnChain,
  transferProductOwnershipOnChain,
  transferETHOnChain,
  getEthPriceInRupees
};
