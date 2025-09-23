const express = require("express");
const { authMiddleware, roleAuth } = require("../middleware/auth");
const {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getShopOrders,
} = require("../controllers/orderController");

const router = express.Router();

// Customer routes
router.post("/", authMiddleware, roleAuth(["customer"]), createOrder);
router.get("/", authMiddleware, roleAuth(["customer"]), getUserOrders);
router.get("/:id", authMiddleware, roleAuth(["customer"]), getOrderById);

// Florist/Admin routes
router.put(
  "/:id/status",
  authMiddleware,
  roleAuth(["florist", "admin"]),
  updateOrderStatus
);
router.get(
  "/shop",
  authMiddleware,
  roleAuth(["florist", "admin"]),
  getShopOrders
);

module.exports = router;
