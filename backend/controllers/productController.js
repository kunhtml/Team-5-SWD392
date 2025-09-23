const { Product, Category, Shop } = require("../models");

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
    const shop_id = req.user.shopId || req.body.shop_id; // For florist

    if (!shop_id) {
      return res.status(400).json({ message: "Shop ID required" });
    }

    const product = await Product.create({
      name,
      description,
      price,
      stock,
      category_id,
      shop_id,
      image_url: req.file ? `/uploads/${req.file.filename}` : null,
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

    // Check ownership (florist only for their shop)
    if (req.user.role === "florist" && product.shop_id !== req.user.shopId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updates = req.body;
    if (req.file) updates.image_url = `/uploads/${req.file.filename}`;

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

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
