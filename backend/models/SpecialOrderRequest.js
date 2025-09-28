const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const SpecialOrderRequest = sequelize.define("SpecialOrderRequest", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
  },
  product_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  budget: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  delivery_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  shipping_address: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  additional_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("pending", "processing", "completed", "cancelled"),
    defaultValue: "pending",
  },
  assigned_shop_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "shops",
      key: "id",
    },
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: "special_order_requests",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

// Define associations
SpecialOrderRequest.associate = function(models) {
  // Special order request belongs to a user (customer)
  SpecialOrderRequest.belongsTo(models.User, {
    foreignKey: "user_id",
    as: "customer",
  });
  
  // Special order request can be assigned to a shop
  SpecialOrderRequest.belongsTo(models.Shop, {
    foreignKey: "assigned_shop_id",
    as: "assignedShop",
  });
};

module.exports = SpecialOrderRequest;