const Transaction = require("../models/Transaction");

// Record a transaction
const recordTransaction = async (req, res) => {
  try {
    const { productId, buyer, seller, amount, currency } = req.body;

    const transaction = new Transaction({
      productId,
      buyer,
      seller,
      amount,
      currency,
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Error recording transaction", error });
  }
};

// Get all transactions
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().populate("productId");
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions", error });
  }
};

module.exports = { recordTransaction, getTransactions };