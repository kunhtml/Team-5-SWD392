const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const Product = require("./Product");
const Shop = require("./Shop");
const Order = require("./Order");

const ProductReview = sequelize.define(
  "ProductReview",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT,
    },
    images: {
      type: DataTypes.JSON,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
  },
  {
    tableName: "product_reviews",
    timestamps: true,
  }
);

// Associations
ProductReview.associate = function (models) {
  models.ProductReview.belongsTo(models.User, {
    foreignKey: "user_id",
    as: "user",
  });
  models.ProductReview.belongsTo(models.Product, {
    foreignKey: "product_id",
    as: "product",
  });
  models.ProductReview.belongsTo(models.Shop, {
    foreignKey: "shop_id",
    as: "shop",
  });
  models.ProductReview.belongsTo(models.Order, {
    foreignKey: "order_id",
    as: "order",
  });
};

module.exports = ProductReview;
