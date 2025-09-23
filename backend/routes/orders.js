const express = require("express");
const { authMiddleware, roleAuth } = require("../middleware/auth");
const {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getShopOrders,
  updateShippingAddress,
} = require("../controllers/orderController");

const router = express.Router();

// Customer routes
router.post("/", authMiddleware, roleAuth(["customer"]), createOrder);
router.get("/", authMiddleware, roleAuth(["customer", "florist", "admin"]), getUserOrders);
router.get("/:id", authMiddleware, roleAuth(["customer", "florist", "admin"]), getOrderById);
router.put(
  "/:id/shipping",
  authMiddleware,
  roleAuth(["customer"]),
  updateShippingAddress
);
router.put(
  "/:id/cancel",
  authMiddleware,
  roleAuth(["customer"]),
  require("../controllers/orderController").cancelOrder
);

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
