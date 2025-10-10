const express = require("express");
const multer = require("multer");
const FormData = require("form-data");
const fetch = require("node-fetch");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
  },
});

// Upload image endpoint
router.post(
  "/image",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      // Create form data for FreeImage.host
      const formData = new FormData();
      formData.append(
        "key",
        process.env.FREEIMAGE_API_KEY || "6d207e02198a847aa98d0a2a901485a5"
      );
      formData.append("action", "upload");
      formData.append("source", req.file.buffer.toString("base64"));
      formData.append("format", "json");

      // Upload to FreeImage.host
      const response = await fetch("https://freeimage.host/api/1/upload", {
        method: "POST",
        body: formData,
        headers: formData.getHeaders(),
      });

      const data = await response.json();

      if (data.status_code === 200 && data.image && data.image.url) {
        return res.json({
          success: true,
          url: data.image.url,
          message: "Image uploaded successfully",
        });
      } else {
        console.error("FreeImage.host error:", data);
        return res.status(500).json({
          message: "Failed to upload image to FreeImage.host",
          error: data.error?.message || "Unknown error",
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        message: "Server error while uploading image",
        error: error.message,
      });
    }
  }
);

module.exports = router;
