// backend/controllers/userController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { depositOnChain, withdrawOnChain } = require("../services/walletService");

// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, contact, walletId } = req.body;
    if (!(name && email && password && contact && walletId)) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with initial balance 0
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      contact,
      walletId,
      balance: 0,
    });

    // Include walletId in JWT payload
    const token = jwt.sign(
      { user_id: user._id, email: user.email, walletId: user.walletId },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(201).json({ user, token });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

// Login an existing user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!(email && password)) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Include walletId in JWT payload
    const token = jwt.sign(
      { user_id: user._id, email: user.email, walletId: user.walletId },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(200).json({ user, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// Get user profile (Protected Route)
exports.profile = async (req, res) => {
  try {
    const userId = req.user.user_id; // Set by auth middleware
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: "Failed to fetch profile", error: error.message });
  }
};

// Deposit funds into wallet (in rupees)
// Calls blockchain deposit function to mint tokens, then updates user balance in MongoDB.
exports.depositBalance = async (req, res) => {
  try {
    const { amount } = req.body; // amount in rupees
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: "Amount must be greater than zero" });
    }

    const user = await User.findById(req.user.user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Call blockchain deposit function with wallet ID
    const txHash = await depositOnChain(user.walletId, amount);
    console.log("Deposit transaction hash:", txHash);

    user.balance += Number(amount);
    await user.save();

    res.status(200).json({ message: "Deposit successful", balance: user.balance, txHash });
  } catch (error) {
    console.error("Deposit error:", error);
    res.status(500).json({ message: "Failed to deposit funds", error: error.message });
  }
};

exports.withdrawBalance = async (req, res) => {
  try {
    const { amount } = req.body; // amount in rupees
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: "Amount must be greater than zero" });
    }

    const user = await User.findById(req.user.user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // ✅ Call blockchain withdraw function with wallet ID
    const txHash = await withdrawOnChain(user.walletId, amount);
    console.log("Withdrawal transaction hash:", txHash);

    user.balance -= Number(amount);
    await user.save();

    res.status(200).json({ message: "Withdrawal successful", balance: user.balance, txHash });
  } catch (error) {
    console.error("Withdrawal error:", error);
    res.status(500).json({ message: "Failed to withdraw funds", error: error.message });
  }
};