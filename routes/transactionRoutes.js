const express = require("express");
const transactionController = require("../controllers/transactionController");
const auth = require("../utils/auth");

const router = express.Router();

// Record a transaction
router.post("/", auth, transactionController.recordTransaction);

// Get all transactions
router.get("/", auth, transactionController.getTransactions);

module.exports = router;