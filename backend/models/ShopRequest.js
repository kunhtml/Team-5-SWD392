const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const ShopRequest = sequelize.define(
  "ShopRequest",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    shop_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    business_description: {
      type: DataTypes.TEXT,
    },
    address: {
      type: DataTypes.TEXT,
    },
    phone: {
      type: DataTypes.STRING(20),
    },
    business_email: {
      type: DataTypes.STRING(255),
    },
    business_license: {
      type: DataTypes.STRING(255),
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    wallet_balance_at_request: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.0,
    },
    admin_note: {
      type: DataTypes.TEXT,
    },
    processed_at: {
      type: DataTypes.DATE,
    },
    processed_by: {
      type: DataTypes.INTEGER,
    },
  },
  {
    tableName: "shop_requests",
    timestamps: true,
  }
);

// Associations
ShopRequest.associate = function (models) {
  models.ShopRequest.belongsTo(models.User, {
    foreignKey: "user_id",
    as: "user",
  });
  models.ShopRequest.belongsTo(models.User, {
    foreignKey: "processed_by",
    as: "processedBy",
  });
};

module.exports = ShopRequest;
