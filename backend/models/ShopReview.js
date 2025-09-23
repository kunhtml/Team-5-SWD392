const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const Shop = require("./Shop");

const ShopReview = sequelize.define(
  "ShopReview",
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
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
  },
  {
    tableName: "shop_reviews",
    timestamps: true,
  }
);

// Associations
ShopReview.associate = function (models) {
  models.ShopReview.belongsTo(models.User, {
    foreignKey: "user_id",
    as: "user",
  });
  models.ShopReview.belongsTo(models.Shop, {
    foreignKey: "shop_id",
    as: "shop",
  });
};

module.exports = ShopReview;
