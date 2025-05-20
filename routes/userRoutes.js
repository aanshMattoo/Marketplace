const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../utils/auth");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile", auth, userController.profile);

router.post("/wallet/deposit", auth, userController.depositBalance);
router.post("/wallet/withdraw", auth, userController.withdrawBalance);


module.exports = router;
