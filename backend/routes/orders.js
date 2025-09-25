const express = require("express");
const { authMiddleware, roleAuth } = require("../middleware/auth");
const {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getShopOrders,
  updateShippingAddress,
  getSpecialOrders, // Import the new function
} = require("../controllers/orderController");

const router = express.Router();

// Customer routes
router.post("/", authMiddleware, roleAuth(["customer"]), createOrder);
router.get(
  "/",
  authMiddleware,
  roleAuth(["customer", "florist", "admin"]),
  getUserOrders
);
// Florist/Admin listing for shop orders (must be before dynamic ':id')
router.get(
  "/shop",
  authMiddleware,
  roleAuth(["florist", "admin"]),
  getShopOrders
);
// Special orders endpoint for florists and admins
router.get(
  "/special",
  authMiddleware,
  roleAuth(["florist", "admin", "customer"]),
  getSpecialOrders
);
router.get(
  "/:id",
  authMiddleware,
  roleAuth(["customer", "florist", "admin"]),
  getOrderById
);
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

module.exports = router;