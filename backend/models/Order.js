const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const Shop = require("./Shop");

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "processing",
        "shipped",
        "delivered",
        "completed",
        "cancelled",
        "rejected"
      ),
      defaultValue: "pending",
    },
    shipping_address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    payment_method: {
      type: DataTypes.ENUM("cash", "card", "wallet", "bank_transfer"),
      defaultValue: "cash",
    },
    payment_status: {
      type: DataTypes.ENUM("pending", "paid", "failed", "refunded"),
      defaultValue: "pending",
    },
    notes: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "orders",
    timestamps: true,
  }
);

// Associations
Order.associate = function (models) {
  models.Order.belongsTo(models.User, {
    foreignKey: "user_id",
    as: "customer",
  });
  models.Order.belongsTo(models.Shop, { foreignKey: "shop_id", as: "shop" });
  models.Order.hasMany(models.OrderItem, {
    foreignKey: "order_id",
    as: "items",
  });
  models.Order.hasMany(models.ProductReview, {
    foreignKey: "order_id",
    as: "reviews",
  });
};

module.exports = Order;
