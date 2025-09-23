const { Shop, User, ShopRequest, Product, Order } = require("../models");
const { Op } = require("sequelize");

const getAllShops = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = "approved",
      rating_min,
      location,
    } = req.query;
    const offset = (page - 1) * limit;

    const where = { status, is_active: true };
    if (rating_min) where.rating = { [Op.gte]: parseFloat(rating_min) };
    if (location) where.address = { [Op.like]: `%${location}%` };

    const { count, rows } = await Shop.findAndCountAll({
      where,
      include: [
        { model: User, as: "florist", attributes: ["id", "name", "email"] },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [
        ["rating", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    res.json({
      shops: rows,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getShopById = async (req, res) => {
  try {
    const shop = await Shop.findByPk(req.params.id, {
      include: [
        { model: User, as: "florist", attributes: ["id", "name", "phone"] },
        {
          model: Product,
          as: "products",
          where: { status: "active" },
          required: false,
        },
      ],
    });

    if (!shop) {
      return res.status(404).json({ message: "Shop not found" });
    }

    res.json({ shop });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const requestShop = async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res
        .status(403)
        .json({ message: "Only customers can request a shop" });
    }

    const {
      shop_name,
      business_description,
      address,
      phone,
      business_email,
      business_license,
    } = req.body;

    // Check if user already has a shop request or shop
    const existingRequest = await ShopRequest.findOne({
      where: {
        user_id: req.user.id,
        status: { [Op.notIn]: ["approved", "rejected"] },
      },
    });
    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "You already have a pending shop request" });
    }

    const existingShop = await Shop.findOne({
      where: { florist_id: req.user.id },
    });
    if (existingShop) {
      return res.status(400).json({ message: "You already have a shop" });
    }

    const request = await ShopRequest.create({
      user_id: req.user.id,
      shop_name,
      business_description,
      address,
      phone,
      business_email,
      business_license,
      status: "pending",
    });

    res
      .status(201)
      .json({ message: "Shop request submitted successfully", request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const approveShopRequest = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can approve shop requests" });
    }

    const { id } = req.params;
    const { status, admin_note } = req.body; // status: 'approved' or 'rejected'

    const request = await ShopRequest.findByPk(id, { include: "user" });
    if (!request) {
      return res.status(404).json({ message: "Shop request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request is not pending" });
    }

    await request.update({
      status,
      admin_note,
      processed_at: new Date(),
      processed_by: req.user.id,
    });

    if (status === "approved") {
      // Create shop for the user and upgrade role to florist
      await Shop.create({
        name: request.shop_name,
        description: request.business_description,
        address: request.address,
        phone: request.phone,
        email: request.business_email,
        image_url: request.business_license,
        florist_id: request.user_id,
        status: "approved",
      });

      await request.user.update({ role: "florist" });
    }

    res.json({ message: `Shop request ${status} successfully`, request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getMyShop = async (req, res) => {
  try {
    if (req.user.role !== "florist") {
      return res
        .status(403)
        .json({ message: "Only florists can access their shop" });
    }

    const shop = await Shop.findOne({ where: { florist_id: req.user.id } });
    if (!shop) {
      return res.status(404).json({ message: "No shop found" });
    }

    res.json({ shop });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// New function for listing shop requests (admin only)
const getShopRequests = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    // Use separate queries to avoid association issues
    const { count, rows: requests } = await ShopRequest.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    // Fetch user info separately for each request to avoid join issues
    const requestsWithUsers = await Promise.all(
      requests.map(async (request) => {
        let user = null;
        try {
          user = await User.findByPk(request.user_id, {
            attributes: ["id", "name", "email"],
          });
        } catch (userError) {
          console.warn(
            `User not found for request ${request.id}:`,
            userError.message
          );
        }
        return {
          ...request.toJSON(),
          user: user
            ? {
                id: user.id,
                name: user.name,
                email: user.email,
              }
            : null,
        };
      })
    );

    res.json({
      requests: requestsWithUsers,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Error in getShopRequests:", error);
    res.status(500).json({
      message: "Server error fetching shop requests",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get current user's latest/pending shop request (customer)
const getMyShopRequest = async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res
        .status(403)
        .json({ message: "Only customers can view their shop request" });
    }

    const latest = await ShopRequest.findOne({
      where: { user_id: req.user.id },
      order: [["createdAt", "DESC"]],
    });

    res.json({ request: latest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllShops,
  getShopById,
  requestShop,
  approveShopRequest,
  getMyShop,
  getShopRequests, // Added export
  getMyShopRequest,
};

// ====== Utilities to recalculate shop stats from orders ======
async function recalcShopStats(shopId) {
  // Count orders by status groups and sum revenue for completed/delivered
  const [completedCount, cancelledCount, pendingCount, revenueSum] = await Promise.all([
    Order.count({ where: { shop_id: shopId, status: { [Op.in]: ["completed", "delivered"] } } }),
    Order.count({ where: { shop_id: shopId, status: { [Op.in]: ["cancelled", "rejected"] } } }),
    Order.count({ where: { shop_id: shopId, status: { [Op.in]: ["pending", "processing"] } } }),
    Order.sum("total_amount", { where: { shop_id: shopId, status: { [Op.in]: ["completed", "delivered"] } } }),
  ]);

  const totalRevenue = Number(revenueSum || 0);
  await Shop.update(
    {
      completed_orders: completedCount,
      cancelled_orders: cancelledCount,
      pending_orders: pendingCount,
      total_revenue: totalRevenue,
    },
    { where: { id: shopId } }
  );
  return await Shop.findByPk(shopId);
}

// Recalculate stats for current florist's shop
const recalcMyShop = async (req, res) => {
  try {
    if (req.user.role !== "florist" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    let shop = null;
    if (req.user.role === "florist") {
      shop = await Shop.findOne({ where: { florist_id: req.user.id } });
      if (!shop) return res.status(404).json({ message: "No shop found" });
    } else if (req.user.role === "admin") {
      const { shop_id } = req.body || {};
      if (!shop_id) return res.status(400).json({ message: "Missing shop_id" });
      shop = await Shop.findByPk(shop_id);
      if (!shop) return res.status(404).json({ message: "Shop not found" });
    }
    const updated = await recalcShopStats(shop.id);
    res.json({ message: "Recalculated", shop: updated });
  } catch (err) {
    console.error("recalcMyShop error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports.recalcMyShop = recalcMyShop;
