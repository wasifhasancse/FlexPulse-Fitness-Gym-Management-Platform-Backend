const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transaction.controller");
const { verifyToken, adminVerify } = require("../middlewares/auth.middleware");

router.post("/transaction", transactionController.createTransaction);
router.get("/transaction", transactionController.getTransactions);
router.get(
  "/transactions",
  verifyToken,
  adminVerify,
  transactionController.getAllTransactionsAdmin,
);

module.exports = router;
