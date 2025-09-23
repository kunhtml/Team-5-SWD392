const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Order = require("./Order");
const Product = require("./Product");

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "order_items",
    timestamps: false, // No timestamps for order items
  }
);

// Associations
OrderItem.associate = function (models) {
  models.OrderItem.belongsTo(models.Order, {
    foreignKey: "order_id",
    as: "order",
  });
  models.OrderItem.belongsTo(models.Product, {
    foreignKey: "product_id",
    as: "product",
  });
};

module.exports = OrderItem;
