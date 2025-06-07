// backend/controllers/productController.js
const Product = require("../models/Product");
const { listProductOnChain, transferProductOwnershipOnChain,getEthPriceInRupees, transferETHOnChain, getEthPricePast } = require("../services/productService");
const { ethers } = require("ethers");
const productABI = require("../blockchain/artifacts/contracts/ProductMarketplace.sol/ProductMarketplace.json").abi;
const User = require("../models/User");
const { getDummyPrivateKey } = require("../utils/dummyKeys");
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

// List a product: Save off-chain details and record price on-chain.
const listProduct = async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const owner = req.user.walletId; // Must be provided in JWT

    if (!owner) {
      return res.status(400).json({ message: "User wallet address not provided" });
    }

    // Call blockchain function to list product on-chain
    const blockchainProductId = await listProductOnChain(price);
    console.log("Product listed on blockchain with ID:", blockchainProductId);

    // Save product in MongoDB, including blockchain product id (b_id)
    const product = new Product({
      name,
      description,
      price,
      owner,
      isSold: false,
      b_id: Number(blockchainProductId),
    });

    await product.save();
    res.status(201).json({ message: "Product listed successfully", product });
  } catch (error) {
    console.error("Error listing product:", error);
    res.status(500).json({ message: "Error listing product", error: error.message });
  }
};


// Get all products (from MongoDB)
const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
};

// Get a specific product by ID (from MongoDB)
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Error fetching product", error: error.message });
  }
};

// Buy a product with Ethereum: Process on-chain, then update off-chain.
const BuyProductWithToken = async (req, res) => {
  try {
    const productId = req.params.id; // MongoDB _id
    const buyerWalletId = req.user.walletId; // Provided in JWT

    if (!buyerWalletId) {
      return res.status(400).json({ message: "User wallet address not provided" });
    }

    // Find product in MongoDB
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.isSold) return res.status(400).json({ message: "Product already sold" });

    // Retrieve buyer and seller records
    const buyerUser = await User.findOne({ walletId: buyerWalletId });
    const sellerUser = await User.findOne({ walletId: product.owner });
    if (!buyerUser || !sellerUser) {
      return res.status(400).json({ message: "Buyer or seller record not found" });
    }

    // Check if buyer has enough token balance
    if (buyerUser.balance < product.price) {
      return res.status(400).json({ message: "Insufficient token balance" });
    }

    // Ensure the blockchain product id is present
    if (product.b_id === undefined || product.b_id === null) {
      return res.status(400).json({ message: "Blockchain product id not available" });
    }

    // Call blockchain function to transfer product ownership on-chain
    const txHash = await transferProductOwnershipOnChain(product.b_id, buyerWalletId);
    console.log("Product ownership transferred on blockchain, tx hash:", txHash);

    // Update the off-chain product record
    product.owner = buyerWalletId;
    product.isSold = true;
    product.blockchainTxHash = txHash;
    await product.save();

    // Adjust off-chain token balances: deduct from buyer, add to seller
    buyerUser.balance -= product.price;
    sellerUser.balance += product.price;
    await buyerUser.save();
    await sellerUser.save();

    res.status(200).json({
      message: "Product purchased successfully with tokens",
      product,
      transactionHash: txHash,
    });
  } catch (error) {
    console.error("Error purchasing product with token:", error);
    res.status(500).json({ message: "Error purchasing product with token", error: error.message });
  }
};

const BuyProductWithETH = async (req, res) => {
  try {
    const productId = req.params.id; // MongoDB product _id
    const buyerWalletId = req.user.walletId; // From JWT

    if (!buyerWalletId) {
      return res.status(400).json({ message: "User wallet address not provided" });
    }

    // Find product in MongoDB
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.isSold) return res.status(400).json({ message: "Product already sold" });

    // Retrieve buyer and seller records
    const buyerUser = await User.findOne({ walletId: buyerWalletId });
    const sellerUser = await User.findOne({ walletId: product.owner });
    if (!buyerUser || !sellerUser) {
      return res.status(400).json({ message: "Buyer or seller record not found" });
    }

    // Fetch current ETH price in rupees from CoinGecko
    const ethPriceInRupees = await getEthPriceInRupees();
    // Calculate required ETH amount: product.price (in rupees) / ethPriceInRupees
    const requiredEth = product.price / ethPriceInRupees;
    // Convert to Wei with 18 decimals
    const ethAmount = ethers.parseEther(requiredEth.toString());

    // Retrieve buyer's dummy private key
    const buyerPrivateKey = getDummyPrivateKey(buyerWalletId);
    if (!buyerPrivateKey) {
      return res.status(400).json({ message: "Buyer private key not available" });
    }

    // Call transferETHOnChain to transfer ETH from buyer to seller
    const txHashETH = await transferETHOnChain(product.b_id, buyerWalletId, sellerUser.walletId, ethAmount, buyerPrivateKey);
    console.log("ETH transferred on-chain, tx hash:", txHashETH);

    // Call transferProductOwnershipOnChain after successful ETH transfer
    const txHashOwnership = await transferProductOwnershipOnChain(product.b_id, buyerWalletId);
    console.log("Ownership transferred on-chain, tx hash:", txHashOwnership);

    // Update the product record with new ownership and transaction details
    product.owner = buyerWalletId;
    product.isSold = true;
    product.blockchainTxHash = txHashOwnership;
    await product.save();

    const finalPrice5Min = await getEthPricePast(5);
    const finalPrice10Min = await getEthPricePast(10);
    const finalPrice15Min = await getEthPricePast(15);
    const finalPrice30Min = await getEthPricePast(30);

    const finalAmount5Min = finalPrice5Min * requiredEth;
    const finalAmount10Min = finalPrice10Min * requiredEth;
    const finalAmount15Min = finalPrice15Min * requiredEth;
    const finalAmount30Min = finalPrice30Min * requiredEth;

    const factor5Min = (product.price - finalAmount5Min) / product.price;
    const factor10Min = (product.price - finalAmount10Min) / product.price;
    const factor15Min = (product.price - finalAmount15Min) / product.price;
    const factor30Min = (product.price - finalAmount30Min) / product.price;

    const accuracy5Min = Math.abs(1 - factor5Min) * 100;
    const accuracy10Min = Math.abs(1 - factor10Min) * 100;
    const accuracy15Min = Math.abs(1 - factor15Min) * 100;
    const accuracy30Min = Math.abs(1 - factor30Min) * 100;


    console.log("\n Transaction accuracies");
    
    console.log("5 minutes Latency: ", accuracy5Min.toFixed(2), "%");
    console.log("10 minutes Latency: ", accuracy10Min.toFixed(2), "%");
    console.log("15 minutes Latency: ", accuracy15Min.toFixed(2), "%");
    console.log("30 minutes Latency: ", accuracy30Min.toFixed(2), "%");


    res.status(200).json({
      message: "Product purchased successfully with ETH",
      product,
      transactionHash: txHashETH,
    });
  } catch (error) {
    console.error("Error purchasing product with ETH:", error);
    res.status(500).json({ message: "Error purchasing product with ETH", error: error.message });
  }
};


// Get all products listed by a specific user (from MongoDB)
const getUserProducts = async (req, res) => {
  try {
    const products = await Product.find({ owner: req.params.walletId });
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching user's products:", error);
    res.status(500).json({ message: "Error fetching user's products", error: error.message });
  }
};

module.exports = {
  listProduct,
  getProducts,
  BuyProductWithToken,
  BuyProductWithETH,
  getProduct,
  getUserProducts,
};
