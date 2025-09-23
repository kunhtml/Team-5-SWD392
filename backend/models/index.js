const sequelize = require("../config/database");
const User = require("./User");
const Shop = require("./Shop");
const Product = require("./Product");
const Category = require("./Category");
const Order = require("./Order");
const Wallet = require("./Wallet");
const ShopRequest = require("./ShopRequest");
const OrderItem = require("./OrderItem");
const ShopReview = require("./ShopReview");
const ProductReview = require("./ProductReview");
const WalletTransaction = require("./WalletTransaction");
const WithdrawalRequest = require("./WithdrawalRequest");

// Export all models
const db = {
  sequelize,
  User,
  Shop,
  Product,
  Category,
  Order,
  Wallet,
  ShopRequest,
  OrderItem,
  ShopReview,
  ProductReview,
  WalletTransaction,
  WithdrawalRequest,
};

// Call associate functions for all models
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
