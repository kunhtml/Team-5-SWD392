const express = require("express");
const multer = require("multer");
const { authMiddleware, roleAuth } = require("../middleware/auth");
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const router = express.Router();

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/products/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files allowed"), false);
    }
  },
});

// Public routes
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Protected routes
router.post(
  "/",
  authMiddleware,
  roleAuth(["florist", "admin"]),
  upload.single("image"),
  createProduct
);
router.put(
  "/:id",
  authMiddleware,
  roleAuth(["florist", "admin"]),
  upload.single("image"),
  updateProduct
);
router.delete(
  "/:id",
  authMiddleware,
  roleAuth(["florist", "admin"]),
  deleteProduct
);

module.exports = router;
