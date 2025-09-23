const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Wallet = sequelize.define(
  "Wallet",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    balance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.0,
    },
  },
  {
    tableName: "wallets",
    timestamps: true,
  }
);

// Associations
Wallet.associate = function (models) {
  models.Wallet.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
  models.Wallet.hasMany(models.WalletTransaction, {
    foreignKey: "wallet_id",
    as: "transactions",
  });
};

module.exports = Wallet;
