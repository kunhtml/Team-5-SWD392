const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

const sequelize = require("./config/database");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const productRoutes = require("./routes/products");
const categoryRoutes = require("./routes/categories");
const shopRoutes = require("./routes/shops");
const orderRoutes = require("./routes/orders");
const walletRoutes = require("./routes/wallet");

// Import models for seeding
const {
  User,
  Shop,
  ShopRequest,
  Category,
  Product,
  Wallet,
} = require("./models");

const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://yourdomain.com"
        : "http://localhost:3000",
    credentials: true,
  })
);
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wallet", walletRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
const PORT = process.env.PORT || 5000;

sequelize
  .sync({ force: false })
  .then(async () => {
    console.log("Database synced successfully");

    // Check if data exists and seed if needed
    const userCount = await User.count();
    if (userCount === 0) {
      console.log("No users found. Seeding sample data...");

      // Create admin
      const admin = await User.create({
        name: "Admin Super",
        email: "admin@flowershop.com",
        password: "admin123",
        role: "admin",
        status: "active",
        phone: "0123456789",
        address: "Admin Office, Hanoi",
      });

      // Create customer
      const customer = await User.create({
        name: "Nguyen Van A",
        email: "customer@flowershop.com",
        password: "customer123",
        role: "customer",
        status: "active",
        phone: "0987654321",
        address: "123 Customer Street, Hanoi",
      });

      // Create florist
      const florist = await User.create({
        name: "Tran Thi B",
        email: "florist@flowershop.com",
        password: "florist123",
        role: "florist",
        status: "active",
        phone: "0111222333",
        address: "456 Florist Avenue, Hanoi",
      });

      // Create another customer for more data
      const customer2 = await User.create({
        name: "Le Van C",
        email: "customer2@flowershop.com",
        password: "customer123",
        role: "customer",
        status: "active",
        phone: "0444555666",
        address: "789 Customer Road, Hanoi",
      });

      // Create wallets for all users
      await Wallet.create({ user_id: admin.id, balance: 1000000 });
      await Wallet.create({ user_id: customer.id, balance: 500000 });
      await Wallet.create({ user_id: florist.id, balance: 2000000 });
      await Wallet.create({ user_id: customer2.id, balance: 300000 });

      // Create sample category
      const category = await Category.create({
        name: "Roses",
        description: "Beautiful rose flowers",
      });

      // Create sample shop for florist
      const shop = await Shop.create({
        name: "Flower Paradise Shop",
        description: "Premium flower arrangements",
        address: "123 Flower Street, Hanoi",
        phone: "0123456789",
        email: "shop@flowerparadise.com",
        image_url: "shop_image.jpg",
        status: "approved",
        rating: 4.5,
        total_orders: 25,
        total_revenue: 50000000,
        florist_id: florist.id,
      });

      // Create sample product for the shop
      await Product.create({
        name: "Red Rose Bouquet",
        description: "12 red roses with greens",
        price: 250000,
        stock: 50,
        image_url: "rose_bouquet.jpg",
        status: "approved",
        category_id: category.id,
        shop_id: shop.id,
      });

      // Create pending shop request from customer
      const pendingRequest = await ShopRequest.create({
        shop_name: "Dream Flowers",
        business_description: "Specializing in wedding flowers",
        address: "456 Dream Street, Hanoi",
        phone: "0777888999",
        business_email: "dream@flowers.com",
        business_license: "pending_license.pdf",
        status: "pending",
        wallet_balance_at_request: 500000,
        user_id: customer.id,
      });

      // Create approved shop request from customer2
      const approvedRequest = await ShopRequest.create({
        shop_name: "Sunny Blooms",
        business_description: "Daily fresh flowers delivery",
        address: "789 Sunny Avenue, Hanoi",
        phone: "0666777888",
        business_email: "sunny@blooms.com",
        business_license: "approved_license.pdf",
        status: "approved",
        wallet_balance_at_request: 300000,
        processed_at: new Date(),
        processed_by: admin.id,
        user_id: customer2.id,
      });

      // Create rejected shop request
      const rejectedRequest = await ShopRequest.create({
        shop_name: "Night Flowers",
        business_description: "Night delivery service",
        address: "101 Night Road, Hanoi",
        phone: "0555666777",
        business_email: "night@flowers.com",
        business_license: "rejected_license.pdf",
        status: "rejected",
        wallet_balance_at_request: 100000,
        admin_note: "Insufficient business documents",
        processed_at: new Date(),
        processed_by: admin.id,
        user_id: customer.id,
      });

      console.log("✅ Sample data seeded successfully!");
      console.log(`- Admin: admin@flowershop.com / admin123`);
      console.log(`- Customer: customer@flowershop.com / customer123`);
      console.log(`- Florist: florist@flowershop.com / florist123`);
    } else {
      console.log("Data already exists, skipping seeding.");
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
  });

// Graceful shutdown
process.on("SIGINT", async () => {
  await sequelize.close();
  process.exit(0);
});

module.exports = app;
