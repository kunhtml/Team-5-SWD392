const express = require("express");
const { authMiddleware, roleAuth } = require("../middleware/auth");
const {
  createSpecialOrderRequest,
  getSpecialOrderRequests,
  getSpecialOrderRequestById,
  updateSpecialOrderRequestStatus,
  updateSpecialOrderRequest,
  deleteSpecialOrderRequest,
  getAvailableCategories
} = require("../controllers/specialOrderController");

const router = express.Router();

// Get available categories for special orders
router.get(
  "/categories",
  authMiddleware,
  roleAuth(["customer", "florist", "admin"]),
  getAvailableCategories
);

// Customer routes
router.post(
  "/",
  authMiddleware,
  roleAuth(["customer"]),
  createSpecialOrderRequest
);

// Get special order requests (different views for different roles)
router.get(
  "/",
  authMiddleware,
  roleAuth(["customer", "florist", "admin"]),
  getSpecialOrderRequests
);

// Get specific special order request by ID
router.get(
  "/:id",
  authMiddleware,
  roleAuth(["customer", "florist", "admin"]),
  getSpecialOrderRequestById
);

// Customer updates their own special order request
router.put(
  "/:id",
  authMiddleware,
  roleAuth(["customer"]),
  updateSpecialOrderRequest
);

// Update special order request status (florist/admin)
router.put(
  "/:id/status",
  authMiddleware,
  roleAuth(["florist", "admin"]),
  updateSpecialOrderRequestStatus
);

// Delete/Cancel special order request
router.delete(
  "/:id",
  authMiddleware,
  roleAuth(["customer", "admin"]),
  deleteSpecialOrderRequest
);

module.exports = router;