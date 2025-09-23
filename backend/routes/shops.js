const express = require("express");
const multer = require("multer");
const { authMiddleware, roleAuth } = require("../middleware/auth");
const {
  getAllShops,
  getShopById,
  requestShop,
  approveShopRequest,
  getMyShop,
  getShopRequests,
} = require("../controllers/shopController");

const router = express.Router();

// Multer for shop documents
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/shops/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype.startsWith("image/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and image files allowed"), false);
    }
  },
});

// Public routes
router.get("/", getAllShops);

// Protected routes (place specific paths BEFORE dynamic ":id")
router.post(
  "/request",
  authMiddleware,
  roleAuth(["customer"]),
  upload.single("business_license"),
  requestShop
);
router.get("/my-shop", authMiddleware, roleAuth(["florist"]), getMyShop);
router.put(
  "/request/:id/approve",
  authMiddleware,
  roleAuth(["admin"]),
  approveShopRequest
);
router.get("/request", authMiddleware, roleAuth(["admin"]), getShopRequests);

// Dynamic route placed last to avoid catching "/request"
router.get("/:id", getShopById);

module.exports = router;
