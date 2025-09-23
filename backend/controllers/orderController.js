const {
  Order,
  OrderItem,
  Product,
  Shop,
  User,
  Wallet,
  WalletTransaction,
} = require("../models");
const { Op } = require("sequelize");

const createOrder = async (req, res) => {
  try {
    const { items, shipping_address, payment_method, notes } = req.body;
    const userId = req.user.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items are required" });
    }

    // Validate items and calculate total
    let totalAmount = 0;
    const orderItems = [];
    const updatedItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.product_id, {
        include: "shop",
      });
      if (!product || product.stock < item.quantity) {
        return res
          .status(400)
          .json({ message: `Insufficient stock for ${product?.name}` });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        price: product.price,
      });

      updatedItems.push({
        id: product.id,
        stock: product.stock - item.quantity,
      });
    }

    // Handle payment
    let paymentStatus = "pending";
    if (payment_method === "wallet") {
      const wallet = await Wallet.findOne({ where: { user_id: userId } });
      if (!wallet || wallet.balance < totalAmount) {
        return res.status(400).json({ message: "Insufficient wallet balance" });
      }

      // Deduct from wallet
      await wallet.update({ balance: wallet.balance - totalAmount });

      // Create transaction
      await WalletTransaction.create({
        wallet_id: wallet.id,
        type: "payment",
        amount: -totalAmount,
        description: `Order payment #${Date.now()}`,
        balance_after: wallet.balance,
        reference_id: `order_${Date.now()}`,
      });

      paymentStatus = "paid";
    }

    // Create order
    const order = await Order.create({
      user_id: userId,
      shop_id: items[0].shop_id, // Assume all items from same shop for simplicity
      total_amount: totalAmount,
      status: "pending",
      shipping_address,
      payment_method,
      payment_status: paymentStatus,
      notes,
    });

    // Create order items
    for (const orderItem of orderItems) {
      await OrderItem.create({
        order_id: order.id,
        ...orderItem,
      });
    }

    // Update product stock
    for (const update of updatedItems) {
      await Product.update(
        { stock: update.stock },
        { where: { id: update.id } }
      );
    }

    // Update shop pending_orders
    await Shop.increment("pending_orders", {
      by: 1,
      where: { id: items[0].shop_id },
    });

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const where = { user_id: req.user.id };
    if (status) where.status = status;

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: Shop, as: "shop", attributes: ["id", "name"] },
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "image_url"],
            },
          ],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    res.json({
      orders: rows,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      where: { user_id: req.user.id }, // Only own orders
      include: [
        { model: Shop, as: "shop", attributes: ["id", "name"] },
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "image_url"],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    if (req.user.role !== "florist" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { status } = req.body;
    const order = await Order.findByPk(req.params.id, { include: "shop" });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Florist can only update their shop's orders
    if (req.user.role === "florist" && order.shop.florist_id !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const oldStatus = order.status;
    await order.update({ status });

    // Update shop stats based on status change
    const shop = order.shop;
    if (status === "completed" || status === "delivered") {
      await shop.increment(["completed_orders"], { by: 1 });
      await shop.increment(["total_revenue"], { by: order.total_amount });
    } else if (status === "cancelled" || status === "rejected") {
      await shop.increment(["cancelled_orders"], { by: 1 });
      // Refund wallet if paid
      if (
        order.payment_status === "paid" &&
        order.payment_method === "wallet"
      ) {
        const wallet = await Wallet.findOne({
          where: { user_id: order.user_id },
        });
        if (wallet) {
          const refundAmount = order.total_amount;
          await wallet.update({ balance: wallet.balance + refundAmount });
          await WalletTransaction.create({
            wallet_id: wallet.id,
            type: "refund",
            amount: refundAmount,
            description: `Order refund #${order.id}`,
            balance_after: wallet.balance,
            reference_id: `order_${order.id}`,
          });
          await order.update({ payment_status: "refunded" });
        }
      }
    } else if (status === "processing") {
      await shop.increment(["pending_orders"], { by: 1 });
    }

    res.json({ message: "Order status updated", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getShopOrders = async (req, res) => {
  try {
    if (req.user.role !== "florist" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const shop = await Shop.findOne({ where: { florist_id: req.user.id } });
    if (!shop && req.user.role === "florist") {
      return res.status(404).json({ message: "No shop found" });
    }

    const shopId = req.user.role === "admin" ? null : shop.id;
    const where = shopId ? { shop_id: shopId } : {};

    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    if (status) where.status = status;

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: User, as: "customer", attributes: ["id", "name", "phone"] },
        {
          model: OrderItem,
          as: "items",
          include: [
            { model: Product, as: "product", attributes: ["id", "name"] },
          ],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    res.json({
      orders: rows,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Customer cancels their own order if eligible
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, { include: "shop" });
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.user_id !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Only allow cancel when pending or processing
    if (!["pending", "processing"].includes(order.status)) {
      return res
        .status(400)
        .json({ message: "Chỉ có thể hủy đơn ở trạng thái 'pending' hoặc 'processing'" });
    }

    // Update order status
    await order.update({ status: "cancelled" });

    // Update shop stats
    const shop = order.shop;
    if (shop) {
      await shop.increment(["cancelled_orders"], { by: 1 });
      // Optionally decrease pending_orders if you track it strictly
      // await shop.decrement(["pending_orders"], { by: 1 });
    }

    // Refund wallet if paid by wallet
    if (order.payment_status === "paid" && order.payment_method === "wallet") {
      const wallet = await Wallet.findOne({ where: { user_id: order.user_id } });
      if (wallet) {
        const refundAmount = order.total_amount;
        await wallet.update({ balance: wallet.balance + refundAmount });
        await WalletTransaction.create({
          wallet_id: wallet.id,
          type: "refund",
          amount: refundAmount,
          description: `Order refund (cancelled) #${order.id}`,
          balance_after: wallet.balance,
          reference_id: `order_${order.id}_refund`,
        });
        await order.update({ payment_status: "refunded" });
      }
    }

    res.json({ message: "Đã hủy đơn hàng", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getShopOrders,
  cancelOrder,
};
