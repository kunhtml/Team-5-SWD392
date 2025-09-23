const express = require("express");
const { authMiddleware, roleAuth } = require("../middleware/auth");
const {
  getWalletBalance,
  deposit,
  withdraw,
  getTransactions,
  getWithdrawalRequests,
  processWithdrawal,
} = require("../controllers/walletController");
const { sepayTransactionsDebug } = require("../controllers/walletController");

const router = express.Router();

// Common routes
router.get("/balance", authMiddleware, getWalletBalance);
router.post(
  "/deposit",
  authMiddleware,
  roleAuth(["customer", "florist"]),
  deposit
);
router.get("/transactions", authMiddleware, getTransactions);
router.get(
  "/debug/sepay",
  authMiddleware,
  roleAuth(["admin", "customer", "florist"]),
  sepayTransactionsDebug
);
// Verify deposit by checking Sepay transaction list
router.post(
  "/deposit/verify",
  authMiddleware,
  roleAuth(["customer", "florist"]),
  require("../controllers/walletController").verifyDeposit
);

// Florist routes
router.post("/withdraw", authMiddleware, roleAuth(["florist"]), withdraw);
router.get("/withdrawals", authMiddleware, getWithdrawalRequests);

// Admin routes
router.put(
  "/withdrawals/:id/process",
  authMiddleware,
  roleAuth(["admin"]),
  processWithdrawal
);

module.exports = router;
