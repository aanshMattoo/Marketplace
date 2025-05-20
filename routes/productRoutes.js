const express = require("express");
const productController = require("../controllers/productController");
const auth = require("../utils/auth");

const router = express.Router();

// List a product (requires authentication)
router.post("/", auth, productController.listProduct);

// Get all products
router.get("/", productController.getProducts);

// Buy a product (requires authentication, payment logic to be added later)
router.post("/:id/buy", auth, productController.BuyProductWithToken);

// Buy a product with ETH
router.post("/:id/buy-eth", auth, productController.BuyProductWithETH);

// Get deatails of single Product
router.get("/:id", productController.getProduct);

//User products
router.get("/user/:walletId", productController.getUserProducts);

module.exports = router;
