const {
  SpecialOrderRequest,
  User,
  Shop,
  Category,
  Wallet,
  WalletTransaction,
} = require("../models");
const { Op } = require("sequelize");

// Customer creates a special order request
const createSpecialOrderRequest = async (req, res) => {
  try {
    const {
      product_name,
      description,
      category,
      budget,
      quantity,
      delivery_date,
      shipping_address,
      additional_notes,
    } = req.body;

    const userId = req.user.id;

    // Validate required fields
    if (!product_name || !description || !shipping_address) {
      return res.status(400).json({
        message: "Tên sản phẩm, mô tả và địa chỉ giao hàng là bắt buộc",
      });
    }

    // Create special order request
    const specialRequest = await SpecialOrderRequest.create({
      user_id: userId,
      product_name,
      description,
      category,
      budget: budget ? parseFloat(budget) : null,
      quantity: quantity ? parseInt(quantity) : 1,
      delivery_date: delivery_date || null,
      shipping_address,
      additional_notes: additional_notes || null,
      status: "pending",
    });

    res.status(201).json({
      message: "Yêu cầu đặt hàng đặc biệt đã được tạo thành công",
      specialRequest,
    });
  } catch (error) {
    console.error("Error creating special order request:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Get special order requests (different views for different roles)
const getSpecialOrderRequests = async (req, res) => {
  try {
    console.log("🔍 [SpecialOrderController] Fetching special order requests");
    console.log("👤 [SpecialOrderController] User:", {
      id: req.user.id,
      role: req.user.role,
    });

    const { page = 1, limit = 10, status, category } = req.query;
    console.log("📊 [SpecialOrderController] Query params:", {
      page,
      limit,
      status,
      category,
    });

    const offset = (page - 1) * limit;

    // Build where clause
    const where = {};

    // Role-based filtering
    if (req.user.role === "customer") {
      // Customers can only see their own requests
      where.user_id = req.user.id;
      console.log(
        "👨‍💼 [SpecialOrderController] Customer role - filtering by user_id:",
        req.user.id
      );
    } else if (req.user.role === "florist") {
      // Florists see either unassigned requests or requests assigned to their shop
      const shop = await Shop.findOne({ where: { florist_id: req.user.id } });
      console.log(
        "🌸 [SpecialOrderController] Florist role - shop found:",
        shop?.id
      );
      if (!shop) {
        console.log(
          "⚪ [SpecialOrderController] Florist without shop - showing unassigned only"
        );
        where.assigned_shop_id = null;
      } else {
        where[Op.or] = [
          { assigned_shop_id: null }, // Unassigned requests
          { assigned_shop_id: shop.id }, // Requests assigned to their shop
        ];
        console.log("🌸 [SpecialOrderController] Florist where clause:", where);
      }
    } else {
      console.log("👑 [SpecialOrderController] Admin role - no user filtering");
    }
    // Admins can see all requests (no additional filtering)

    // Add status filter if provided
    if (status) {
      where.status = status;
      console.log("🏷️ [SpecialOrderController] Added status filter:", status);
    }

    // Add category filter if provided
    if (category) {
      where.category = category;
      console.log(
        "📂 [SpecialOrderController] Added category filter:",
        category
      );
    }

    console.log("🔍 [SpecialOrderController] Final where clause:", where);

    const { count, rows } = await SpecialOrderRequest.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "customer",
          attributes: ["id", "name", "email", "phone"],
        },
        {
          model: Shop,
          as: "assignedShop",
          attributes: ["id", "name"],
          include: [
            {
              model: User,
              as: "florist",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
    });

    console.log("📊 [SpecialOrderController] Query results:", {
      count,
      rowsLength: rows.length,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
    });

    console.log(
      "📋 [SpecialOrderController] Sample data (first item):",
      rows.length > 0
        ? {
            id: rows[0].id,
            product_name: rows[0].product_name,
            status: rows[0].status,
            budget: rows[0].budget,
            customer: rows[0].customer?.name,
            assignedShop: rows[0].assignedShop?.name,
          }
        : "No items"
    );

    const response = {
      specialRequests: rows,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
    };

    console.log("✅ [SpecialOrderController] Sending response:", {
      specialRequestsCount: rows.length,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
    });

    res.json(response);
  } catch (error) {
    console.error(
      "❌ [SpecialOrderController] Error fetching special order requests:",
      error
    );
    console.error("❌ [SpecialOrderController] Error stack:", error.stack);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Get a specific special order request by ID
const getSpecialOrderRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const specialRequest = await SpecialOrderRequest.findByPk(id, {
      include: [
        {
          model: User,
          as: "customer",
          attributes: ["id", "name", "email", "phone"],
        },
        {
          model: Shop,
          as: "assignedShop",
          attributes: ["id", "name"],
          include: [
            {
              model: User,
              as: "florist",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
    });

    if (!specialRequest) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy yêu cầu đặt hàng đặc biệt" });
    }

    // Authorization check
    if (
      req.user.role === "customer" &&
      specialRequest.user_id !== req.user.id
    ) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    }

    if (req.user.role === "florist") {
      const shop = await Shop.findOne({ where: { florist_id: req.user.id } });
      if (
        shop &&
        specialRequest.assigned_shop_id !== null &&
        specialRequest.assigned_shop_id !== shop.id
      ) {
        return res.status(403).json({ message: "Bạn không có quyền truy cập" });
      }
    }

    res.json({ specialRequest });
  } catch (error) {
    console.error("Error fetching special order request:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Update special order request status
const updateSpecialOrderRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assigned_shop_id } = req.body;

    if (status) {
      const allowedStatuses = [
        "pending",
        "processing",
        "completed",
        "cancelled",
      ];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: "Trạng thái không hợp lệ" });
      }
    }

    // Only admins and florists can update status
    if (req.user.role === "customer") {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền cập nhật trạng thái" });
    }

    const specialRequest = await SpecialOrderRequest.findByPk(id);
    if (!specialRequest) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy yêu cầu đặt hàng đặc biệt" });
    }

    const previousStatus = specialRequest.status;

    // Florists can only update requests assigned to their shop or assign themselves to unassigned requests
    if (req.user.role === "florist") {
      const shop = await Shop.findOne({ where: { florist_id: req.user.id } });
      if (!shop) {
        return res.status(403).json({ message: "Bạn không có cửa hàng" });
      }

      // Allow florist to accept an unassigned request
      if (!specialRequest.assigned_shop_id && assigned_shop_id === shop.id) {
        await specialRequest.update({
          assigned_shop_id: shop.id,
          status: "processing",
        });
        return res.json({
          message: "Đã nhận yêu cầu đặt hàng đặc biệt",
          specialRequest: await SpecialOrderRequest.findByPk(id, {
            include: [
              { model: User, as: "customer", attributes: ["id", "name"] },
              { model: Shop, as: "assignedShop", attributes: ["id", "name"] },
            ],
          }),
        });
      }

      // Only update if request is assigned to their shop
      if (specialRequest.assigned_shop_id !== shop.id) {
        return res
          .status(403)
          .json({ message: "Bạn không có quyền cập nhật yêu cầu này" });
      }
    }

    // Update the request
    const updateData = { status };
    if (assigned_shop_id !== undefined) {
      updateData.assigned_shop_id = assigned_shop_id;
    }

    await specialRequest.update(updateData);

    await specialRequest.reload({
      include: [
        { model: User, as: "customer", attributes: ["id", "name"] },
        {
          model: Shop,
          as: "assignedShop",
          attributes: ["id", "name", "florist_id"],
          include: [{ model: User, as: "florist", attributes: ["id", "name"] }],
        },
      ],
    });

    if (status === "completed" && previousStatus !== "completed") {
      const assignedShopId =
        specialRequest.assigned_shop_id ?? specialRequest.assignedShop?.id;
      const floristId = specialRequest.assignedShop?.florist_id;
      const payoutAmount = Number(specialRequest.budget || 0);

      if (assignedShopId && floristId && payoutAmount > 0) {
        const [wallet] = await Wallet.findOrCreate({
          where: { user_id: floristId },
          defaults: { balance: 0.0 },
        });

        const referenceId = `special_request_${specialRequest.id}_payout`;
        const existingTransaction = await WalletTransaction.findOne({
          where: { wallet_id: wallet.id, reference_id: referenceId },
        });

        if (!existingTransaction) {
          const currentBalance = Number(wallet.balance);
          const newBalance = currentBalance + payoutAmount;

          await wallet.update({ balance: newBalance });
          await WalletTransaction.create({
            wallet_id: wallet.id,
            type: "deposit",
            amount: payoutAmount,
            description: `Thu nhập yêu cầu đặc biệt #${specialRequest.id}`,
            balance_after: newBalance,
            reference_id: referenceId,
            metadata: {
              special_order_request_id: specialRequest.id,
              assigned_shop_id: assignedShopId,
              budget: payoutAmount,
            },
          });
        }
      }
    }

    const updatedRequest = specialRequest;

    res.json({
      message: "Cập nhật trạng thái thành công",
      specialRequest: updatedRequest,
    });
  } catch (error) {
    console.error("Error updating special order request status:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Customer updates their own special order request (only if pending)
const updateSpecialOrderRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      product_name,
      description,
      category,
      budget,
      quantity,
      delivery_date,
      shipping_address,
      additional_notes,
    } = req.body;

    const specialRequest = await SpecialOrderRequest.findByPk(id);
    if (!specialRequest) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy yêu cầu đặt hàng đặc biệt" });
    }

    // Only customer who created the request can update it
    if (specialRequest.user_id !== req.user.id) {
      return res.status(403).json({ message: "Bạn không có quyền cập nhật" });
    }

    // Only allow updates if status is pending
    if (specialRequest.status !== "pending") {
      return res.status(400).json({
        message: "Chỉ có thể cập nhật yêu cầu ở trạng thái 'pending'",
      });
    }

    // Update the request
    const updateData = {};
    if (product_name) updateData.product_name = product_name;
    if (description) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (budget !== undefined)
      updateData.budget = budget ? parseFloat(budget) : null;
    if (quantity) updateData.quantity = parseInt(quantity);
    if (delivery_date !== undefined) updateData.delivery_date = delivery_date;
    if (shipping_address) updateData.shipping_address = shipping_address;
    if (additional_notes !== undefined)
      updateData.additional_notes = additional_notes;

    await specialRequest.update(updateData);

    const updatedRequest = await SpecialOrderRequest.findByPk(id, {
      include: [
        { model: User, as: "customer", attributes: ["id", "name"] },
        { model: Shop, as: "assignedShop", attributes: ["id", "name"] },
      ],
    });

    res.json({
      message: "Cập nhật yêu cầu thành công",
      specialRequest: updatedRequest,
    });
  } catch (error) {
    console.error("Error updating special order request:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Delete/Cancel special order request
const deleteSpecialOrderRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const specialRequest = await SpecialOrderRequest.findByPk(id);
    if (!specialRequest) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy yêu cầu đặt hàng đặc biệt" });
    }

    // Only customer who created it or admin can delete
    if (
      req.user.role === "customer" &&
      specialRequest.user_id !== req.user.id
    ) {
      return res.status(403).json({ message: "Bạn không có quyền xóa" });
    }

    if (req.user.role === "florist") {
      return res.status(403).json({ message: "Florist không thể xóa yêu cầu" });
    }

    // Only allow deletion if status is pending
    if (specialRequest.status !== "pending") {
      return res.status(400).json({
        message: "Chỉ có thể hủy yêu cầu ở trạng thái 'pending'",
      });
    }

    await specialRequest.update({ status: "cancelled" });

    res.json({
      message: "Đã hủy yêu cầu đặt hàng đặc biệt",
      specialRequest,
    });
  } catch (error) {
    console.error("Error deleting special order request:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Get available categories for special orders
const getAvailableCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { is_active: 1 },
      attributes: ["id", "name", "description"],
      order: [["name", "ASC"]],
    });

    res.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports = {
  createSpecialOrderRequest,
  getSpecialOrderRequests,
  getSpecialOrderRequestById,
  updateSpecialOrderRequestStatus,
  updateSpecialOrderRequest,
  deleteSpecialOrderRequest,
  getAvailableCategories,
};
