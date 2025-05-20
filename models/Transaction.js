const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  buyer: { type: String, required: true }, // Buyer's wallet address
  seller: { type: String, required: true }, // Seller's wallet address
  amount: { type: Number, required: true }, // Transaction amount
  currency: { type: String, required: true }, // ETH or INRToken
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Transaction", transactionSchema);