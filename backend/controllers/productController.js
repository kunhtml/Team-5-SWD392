const { Product, Category, Shop } = require("../models");
const { Op } = require("sequelize");

const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category_id,
      shop_id,
      search,
      min_price,
      max_price,
      status = "active",
    } = req.query;
    const offset = (page - 1) * limit;

    const where = { status };
    if (category_id) where.category_id = category_id;
    if (shop_id) where.shop_id = shop_id;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }
    if (min_price || max_price) {
      where.price = {};
      if (min_price) where.price[Op.gte] = min_price;
      if (max_price) where.price[Op.lte] = max_price;
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [
        { model: Category, as: "category", attributes: ["id", "name"] },
        { model: Shop, as: "shop", attributes: ["id", "name", "rating"] },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    res.json({
      products: rows,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category, as: "category", attributes: ["id", "name"] },
        {
          model: Shop,
          as: "shop",
          attributes: ["id", "name", "rating", "address"],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      category_id,
      images,
      tags,
      discount_percentage,
    } = req.body;
    let shop_id = req.body.shop_id || null;
    // Resolve shop_id automatically for florist
    if (!shop_id && req.user.role === "florist") {
      const myShop = await Shop.findOne({ where: { florist_id: req.user.id } });
      if (!myShop) {
        return res.status(400).json({ message: "Không tìm thấy cửa hàng của bạn" });
      }
      shop_id = myShop.id;
    }

    if (!shop_id) {
      return res.status(400).json({ message: "Thiếu shop_id" });
    }
    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({ message: "Vui lòng nhập tên, giá và tồn kho" });
    }
    const numericPrice = parseFloat(price);
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ message: "Giá phải là số > 0" });
    }
    if (!category_id) {
      return res.status(400).json({ message: "Vui lòng chọn danh mục (category_id)" });
    }

    const product = await Product.create({
      name,
      description,
      price: numericPrice,
      stock,
      category_id,
      shop_id,
      image_url:
        req.body.image_url || (req.file ? `/uploads/products/${req.file.filename}` : null),
      images: images ? JSON.parse(images) : null,
      tags: tags ? JSON.parse(tags) : null,
      discount_percentage: discount_percentage || 0,
      status: "pending", // Needs moderation for new products
    });

    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Determine if florist owns this product
    if (req.user.role === "florist") {
      const myShop = await Shop.findOne({ where: { florist_id: req.user.id } });
      if (!myShop || product.shop_id !== myShop.id) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    // Whitelist updatable fields
    const allowedFields = [
      "name",
      "description",
      "price",
      "stock",
      "category_id",
      "tags",
      "discount_percentage",
      "images",
    ];
    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    // Validate price if present
    if (updates.price !== undefined) {
      const numericPrice = parseFloat(updates.price);
      if (Number.isNaN(numericPrice) || numericPrice <= 0) {
        return res.status(400).json({ message: "Giá phải là số > 0" });
      }
      updates.price = numericPrice;
    }
    if (updates.images && typeof updates.images === "string") {
      try { updates.images = JSON.parse(updates.images); } catch (_) {}
    }
    if (updates.tags && typeof updates.tags === "string") {
      try { updates.tags = JSON.parse(updates.tags); } catch (_) {}
    }

    // Image handling
    if (req.body.image_url) {
      updates.image_url = req.body.image_url;
    } else if (req.file) {
      updates.image_url = `/uploads/products/${req.file.filename}`;
    }

    // If florist updates, force moderation to pending and hide from public listing
    if (req.user.role === "florist") {
      updates.moderation_status = "pending";
      updates.moderation_note = null;
      updates.status = "pending";
      // Prevent florist from directly changing status/moderation fields
      delete req.body.status;
      delete req.body.moderation_status;
      delete req.body.moderation_note;
    }

    await product.update(updates);
    res.json({ message: "Product updated successfully", product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check ownership
    if (req.user.role !== "admin" && product.shop_id !== req.user.shopId) {
      return res.status(403).json({ message: "Access denied" });
    }

    await product.destroy();
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// List products for the current florist's shop (or admin-specified shop)
const getMyProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, shop_id } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status; // if omitted, include all statuses
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    let effectiveShopId = null;
    if (req.user.role === "florist") {
      const shop = await Shop.findOne({ where: { florist_id: req.user.id } });
      if (!shop) return res.status(404).json({ message: "No shop found" });
      effectiveShopId = shop.id;
    } else if (req.user.role === "admin") {
      if (shop_id) effectiveShopId = shop_id;
    }

    if (effectiveShopId) where.shop_id = effectiveShopId;

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [
        { model: Category, as: "category", attributes: ["id", "name"] },
        { model: Shop, as: "shop", attributes: ["id", "name"] },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    res.json({
      products: rows,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
};

// ============== Admin moderation ==============
// List products for moderation with filters
const getProductsForModeration = async (req, res) => {
  try {
    // Admin only: ensure role checked in route
    const { page = 1, limit = 10, moderation_status, search, shop_id, category_id } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (moderation_status) where.moderation_status = moderation_status; // pending | approved | rejected
    if (category_id) where.category_id = category_id;
    if (shop_id) where.shop_id = shop_id;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [
        { model: Category, as: "category", attributes: ["id", "name"] },
        { model: Shop, as: "shop", attributes: ["id", "name"] },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    res.json({
      products: rows,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Approve or reject a product
const moderateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, note } = req.body; // action: 'approve' | 'reject'

    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (!action || !["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    if (action === "approve") {
      await product.update({
        moderation_status: "approved",
        moderation_note: note || null,
        status: product.status === "rejected" || product.status === "pending" ? "active" : product.status,
      });
    } else if (action === "reject") {
      await product.update({
        moderation_status: "rejected",
        moderation_note: note || null,
        status: "rejected",
      });
    }

    res.json({ message: "Moderation updated", product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports.getProductsForModeration = getProductsForModeration;
module.exports.moderateProduct = moderateProduct;
