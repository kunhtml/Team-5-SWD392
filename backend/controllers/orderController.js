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

    // Seller credit will be processed upon order completion/delivery, not here

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

    const where = {};
    if (req.user.role !== "admin") {
      where.user_id = req.user.id;
    }
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
      include: [
        { model: Shop, as: "shop", attributes: ["id", "name", "florist_id"] },
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

    // Authorization: customer can only view own order; florist only own shop; admin allowed
    if (req.user.role === "customer" && order.user_id !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }
    if (
      req.user.role === "florist" &&
      order.shop &&
      order.shop.florist_id !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
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

    // Update shop stats based on status transition
    const shop = order.shop;
    if (status === "completed" || status === "delivered") {
      // Only count once if moving into a completed/delivered state
      if (oldStatus !== "completed" && oldStatus !== "delivered") {
        // Decrease pending if applicable
        try {
          if (Number(shop.pending_orders) > 0) {
            await shop.decrement(["pending_orders"], { by: 1 });
          }
        } catch (e) {
          console.warn("Could not decrement pending_orders:", e?.message || e);
        }
        await shop.increment(["completed_orders"], { by: 1 });
        await shop.increment(["total_revenue"], { by: order.total_amount });

        // Credit seller wallet now if order was paid by wallet and not yet credited
        try {
          if (
            order.payment_method === "wallet" &&
            (order.payment_status === "paid" ||
              order.payment_status === "captured")
          ) {
            const sellerWallet = await Wallet.findOne({
              where: { user_id: shop.florist_id },
            });
            const ensureWallet = async () =>
              sellerWallet ||
              (await Wallet.create({ user_id: shop.florist_id, balance: 0.0 }));
            const walletToUse = await ensureWallet();
            const existedCredit = await WalletTransaction.findOne({
              where: {
                wallet_id: walletToUse.id,
                reference_id: `order_${order.id}_seller_credit`,
              },
            });
            if (!existedCredit) {
              const newBalance =
                Number(walletToUse.balance) + Number(order.total_amount);
              await walletToUse.update({ balance: newBalance });
              await WalletTransaction.create({
                wallet_id: walletToUse.id,
                type: "deposit",
                amount: Number(order.total_amount),
                description: `Thu nhập đơn hàng #${order.id}`,
                balance_after: newBalance,
                reference_id: `order_${order.id}_seller_credit`,
                metadata: { order_id: order.id },
              });
            }
          }
        } catch (e) {
          console.error("Credit seller on completion failed:", e);
        }
      }
    } else if (status === "cancelled" || status === "rejected") {
      // Only count once if moving into a cancelled/rejected state
      if (oldStatus !== "cancelled" && oldStatus !== "rejected") {
        try {
          if (Number(shop.pending_orders) > 0) {
            await shop.decrement(["pending_orders"], { by: 1 });
          }
        } catch (e) {
          console.warn("Could not decrement pending_orders:", e?.message || e);
        }
        await shop.increment(["cancelled_orders"], { by: 1 });
      }
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

        // Reverse seller credit only if it was previously credited
        try {
          if (order.shop && order.shop.florist_id) {
            const sellerWallet = await Wallet.findOne({
              where: { user_id: order.shop.florist_id },
            });
            if (sellerWallet) {
              const existedCredit = await WalletTransaction.findOne({
                where: {
                  wallet_id: sellerWallet.id,
                  reference_id: `order_${order.id}_seller_credit`,
                },
              });
              const existedReversal = await WalletTransaction.findOne({
                where: {
                  wallet_id: sellerWallet.id,
                  reference_id: `order_${order.id}_seller_reversal`,
                },
              });
              if (existedCredit && !existedReversal) {
                const newBalance =
                  Number(sellerWallet.balance) - Number(order.total_amount);
                await sellerWallet.update({ balance: newBalance });
                await WalletTransaction.create({
                  wallet_id: sellerWallet.id,
                  type: "withdrawal",
                  amount: -Number(order.total_amount),
                  description: `Hoàn tiền do đơn bị hủy #${order.id}`,
                  balance_after: newBalance,
                  reference_id: `order_${order.id}_seller_reversal`,
                  metadata: { order_id: order.id },
                });
              }
            }
          }
        } catch (e) {
          console.error("Seller credit reversal failed:", e);
        }
      }
    } else if (status === "processing") {
      // No changes to aggregate counters; already counted as pending on creation
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
      return res.status(400).json({
        message: "Chỉ có thể hủy đơn ở trạng thái 'pending' hoặc 'processing'",
      });
    }

    // Update order status
    await order.update({ status: "cancelled" });

    // Update shop stats
    const shop = order.shop;
    if (shop) {
      await shop.increment(["cancelled_orders"], { by: 1 });
      try {
        if (Number(shop.pending_orders) > 0) {
          await shop.decrement(["pending_orders"], { by: 1 });
        }
      } catch (e) {
        console.warn(
          "Could not decrement pending_orders on cancel:",
          e?.message || e
        );
      }
    }

    // Refund wallet if paid by wallet
    if (order.payment_status === "paid" && order.payment_method === "wallet") {
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
          description: `Order refund (cancelled) #${order.id}`,
          balance_after: wallet.balance,
          reference_id: `order_${order.id}_refund`,
        });
        await order.update({ payment_status: "refunded" });
      }

      // Reverse seller credit only if it was previously credited
      try {
        if (order.shop && order.shop.florist_id) {
          const sellerWallet = await Wallet.findOne({
            where: { user_id: order.shop.florist_id },
          });
          if (sellerWallet) {
            const existedCredit = await WalletTransaction.findOne({
              where: {
                wallet_id: sellerWallet.id,
                reference_id: `order_${order.id}_seller_credit`,
              },
            });
            const existedReversal = await WalletTransaction.findOne({
              where: {
                wallet_id: sellerWallet.id,
                reference_id: `order_${order.id}_seller_reversal`,
              },
            });
            if (existedCredit && !existedReversal) {
              const newBalance =
                Number(sellerWallet.balance) - Number(order.total_amount);
              await sellerWallet.update({ balance: newBalance });
              await WalletTransaction.create({
                wallet_id: sellerWallet.id,
                type: "withdrawal",
                amount: -Number(order.total_amount),
                description: `Hoàn tiền do khách hủy #${order.id}`,
                balance_after: newBalance,
                reference_id: `order_${order.id}_seller_reversal`,
                metadata: { order_id: order.id },
              });
            }
          }
        }
      } catch (e) {
        console.error("Seller credit reversal failed:", e);
      }
    }

    res.json({ message: "Đã hủy đơn hàng", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Customer updates shipping address for own order if not yet finalized
const updateShippingAddress = async (req, res) => {
  try {
    const { shipping_address } = req.body;
    if (!shipping_address || String(shipping_address).trim().length < 5) {
      return res
        .status(400)
        .json({ message: "Địa chỉ giao hàng không hợp lệ" });
    }

    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user_id !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Allow edit when pending or processing only
    if (!["pending", "processing"].includes(order.status)) {
      return res
        .status(400)
        .json({ message: "Không thể sửa địa chỉ khi đơn đã xử lý xa hơn" });
    }

    await order.update({ shipping_address });
    res.json({ message: "Cập nhật địa chỉ giao hàng thành công", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get special orders (for florists and admins)
const getSpecialOrders = async (req, res) => {
  try {
    // Only florists, admins, and customers can access special orders
    if (req.user.role !== "florist" && req.user.role !== "admin" && req.user.role !== "customer") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause
    const where = {
      is_special_order: 1, // Only special orders
    };

    // For florists, only show orders for their shop
    if (req.user.role === "florist") {
      const shop = await Shop.findOne({ where: { florist_id: req.user.id } });
      if (!shop) {
        return res.json({
          orders: [],
          total: 0,
          page: parseInt(page),
          pages: 0,
        });
      }
      where.shop_id = shop.id;
    }
    // For customers, only show their own orders
    else if (req.user.role === "customer") {
      where.user_id = req.user.id;
    }

    // Add status filter if provided
    if (status) where.status = status;

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: User, as: "customer", attributes: ["id", "name"] },
        { 
          model: Shop, 
          as: "shop", 
          attributes: ["id", "name", "florist_id"],
          include: [
            { model: User, as: "florist", attributes: ["id"] }
          ]
        },
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name"],
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
    console.error("Error fetching special orders:", error);
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
  updateShippingAddress,
  getSpecialOrders, // Add the new function to exports
};
