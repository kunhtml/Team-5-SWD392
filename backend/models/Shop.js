const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Shop = sequelize.define(
  "Shop",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    address: {
      type: DataTypes.TEXT,
    },
    phone: {
      type: DataTypes.STRING(20),
    },
    email: {
      type: DataTypes.STRING(100),
    },
    image_url: {
      type: DataTypes.STRING(255),
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected", "suspended"),
      defaultValue: "pending",
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.0,
    },
    total_orders: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    total_revenue: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.0,
    },
    total_products: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    pending_orders: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    completed_orders: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    cancelled_orders: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    average_rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.0,
    },
    total_reviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    average_product_rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.0,
    },
    total_product_reviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "shops",
    timestamps: true,
  }
);

// Associations
Shop.associate = function (models) {
  models.Shop.belongsTo(models.User, {
    foreignKey: "florist_id",
    as: "florist",
  });
  models.Shop.hasMany(models.Product, {
    foreignKey: "shop_id",
    as: "products",
  });
  models.Shop.hasMany(models.Order, { foreignKey: "shop_id", as: "orders" });
  models.Shop.hasMany(models.ShopReview, {
    foreignKey: "shop_id",
    as: "reviews",
  });
  models.Shop.hasMany(models.ProductReview, {
    foreignKey: "shop_id",
    as: "productReviews",
  });
};

module.exports = Shop;
