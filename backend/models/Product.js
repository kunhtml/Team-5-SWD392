const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Category = require("./Category");
const Shop = require("./Shop");

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    image_url: {
      type: DataTypes.STRING(255),
    },
    images: {
      type: DataTypes.JSON,
    },
    status: {
      type: DataTypes.ENUM(
        "active",
        "inactive",
        "out_of_stock",
        "pending",
        "rejected"
      ),
      defaultValue: "active",
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    discount_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.0,
    },
    tags: {
      type: DataTypes.JSON,
    },
    moderation_status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    moderation_note: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "products",
    timestamps: true,
  }
);

// Associations
Product.associate = function (models) {
  models.Product.belongsTo(models.Category, {
    foreignKey: "category_id",
    as: "category",
  });
  models.Product.belongsTo(models.Shop, { foreignKey: "shop_id", as: "shop" });
  models.Product.hasMany(models.OrderItem, {
    foreignKey: "product_id",
    as: "orderItems",
  });
  models.Product.hasMany(models.ProductReview, {
    foreignKey: "product_id",
    as: "reviews",
  });
};

module.exports = Product;
