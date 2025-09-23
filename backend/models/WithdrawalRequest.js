const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const WithdrawalRequest = sequelize.define(
  "WithdrawalRequest",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected", "processed"),
      defaultValue: "pending",
    },
    bank_account: {
      type: DataTypes.STRING(255),
    },
    bank_name: {
      type: DataTypes.STRING(100),
    },
    notes: {
      type: DataTypes.TEXT,
    },
    processed_at: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "withdrawal_requests",
    timestamps: true,
  }
);

// Associations
WithdrawalRequest.associate = function (models) {
  models.WithdrawalRequest.belongsTo(models.User, {
    foreignKey: "user_id",
    as: "user",
  });
};

module.exports = WithdrawalRequest;
