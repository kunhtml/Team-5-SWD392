const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const bcrypt = require("bcryptjs");

const User = sequelize.define(
  "User",
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
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
    },
    address: {
      type: DataTypes.TEXT,
    },
    role: {
      type: DataTypes.ENUM("customer", "florist", "admin"),
      defaultValue: "customer",
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "banned"),
      defaultValue: "active",
    },
    avatar_url: {
      type: DataTypes.STRING(255),
    },
  },
  {
    tableName: "users",
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

// Method to compare passwords
User.prototype.validPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Associations
User.associate = function (models) {
  // User has many shops
  models.User.hasMany(models.Shop, { foreignKey: "florist_id", as: "shops" });
  // User has many orders
  models.User.hasMany(models.Order, { foreignKey: "user_id", as: "orders" });
  // User has one wallet
  models.User.hasOne(models.Wallet, { foreignKey: "user_id", as: "wallet" });
  // User has many shop requests
  models.User.hasMany(models.ShopRequest, {
    foreignKey: "user_id",
    as: "shopRequests",
  });
  // User has many shop reviews
  models.User.hasMany(models.ShopReview, {
    foreignKey: "user_id",
    as: "shopReviews",
  });
  // User has many product reviews
  models.User.hasMany(models.ProductReview, {
    foreignKey: "user_id",
    as: "productReviews",
  });
  // User has many withdrawal requests
  models.User.hasMany(models.WithdrawalRequest, {
    foreignKey: "user_id",
    as: "withdrawalRequests",
  });
  // User processed shop requests (admin)
  models.User.hasMany(models.ShopRequest, {
    foreignKey: "processed_by",
    as: "processedRequests",
  });
};

module.exports = User;
