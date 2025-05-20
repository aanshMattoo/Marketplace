// models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  owner: { type: String, required: true }, // Seller's wallet address (stored as walletId)
  isSold: { type: Boolean, default: false },
  b_id: { type: Number } // Blockchain product id, added field
});

module.exports = mongoose.model("Product", productSchema);
