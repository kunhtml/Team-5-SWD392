const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Wallet = require("./Wallet");

const WalletTransaction = sequelize.define(
  "WalletTransaction",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.ENUM("deposit", "payment", "refund", "withdrawal"),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    balance_after: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    reference_id: {
      type: DataTypes.STRING(255),
    },
    metadata: {
      type: DataTypes.JSON,
    },
  },
  {
    tableName: "wallet_transactions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

// Associations
WalletTransaction.associate = function (models) {
  models.WalletTransaction.belongsTo(models.Wallet, {
    foreignKey: "wallet_id",
    as: "wallet",
  });
};

module.exports = WalletTransaction;
