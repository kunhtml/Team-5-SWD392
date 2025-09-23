const express = require("express");
const { authMiddleware, roleAuth } = require("../middleware/auth");
const { User } = require("../models");

const router = express.Router();

// Get current user profile (already in auth routes)
router.get("/profile", authMiddleware, async (req, res) => {
  // This can be expanded or moved to user controller
  res.json({ user: req.user });
});

// Update profile
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, phone, address, avatar_url } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.update({ name, phone, address, avatar_url });

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        avatar_url: user.avatar_url,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Admin: Get all users
router.get("/", authMiddleware, roleAuth(["admin"]), async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (role) where.role = role;
    if (status) where.status = status;

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ["password"] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    res.json({
      users: rows,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Admin: Get user by id (exclude password)
router.get("/:id", authMiddleware, roleAuth(["admin"]), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Admin: Update user (role/status and profile fields)
router.put("/:id", authMiddleware, roleAuth(["admin"]), async (req, res) => {
  try {
    const { role, status, name, phone, address, avatar_url } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updates = {};
    if (role) updates.role = role;
    if (status) updates.status = status;
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;

    await user.update(updates);
    const safeUser = await User.findByPk(user.id, {
      attributes: { exclude: ["password"] },
    });
    res.json({ message: "User updated successfully", user: safeUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
