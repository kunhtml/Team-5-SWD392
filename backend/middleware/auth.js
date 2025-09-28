const jwt = require("jsonwebtoken");
const { User } = require("../models");

const authMiddleware = async (req, res, next) => {
  try {
    console.log("🔐 [AuthMiddleware] Checking authentication for:", req.method, req.path);
    
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      console.log("❌ [AuthMiddleware] No token provided");
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    console.log("🔍 [AuthMiddleware] Token found, verifying...");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ [AuthMiddleware] Token decoded successfully:", {
      userId: decoded.id,
      role: decoded.role
    });
    
    const user = await User.findByPk(decoded.id);

    if (!user) {
      console.log("❌ [AuthMiddleware] User not found for ID:", decoded.id);
      return res.status(401).json({ message: "User not found" });
    }

    if (user.status !== "active") {
      console.log("❌ [AuthMiddleware] User account is inactive:", user.status);
      return res.status(403).json({ message: "Account is inactive" });
    }

    console.log("✅ [AuthMiddleware] Authentication successful for user:", {
      id: user.id,
      name: user.name,
      role: user.role,
      status: user.status
    });

    req.user = user;
    next();
  } catch (error) {
    console.error("❌ [AuthMiddleware] Authentication error:", error.message);
    res.status(401).json({ message: "Token is not valid" });
  }
};

// Role-based authorization
const roleAuth = (roles) => {
  return (req, res, next) => {
    console.log("👮 [RoleAuth] Checking role authorization:");
    console.log("👤 [RoleAuth] User role:", req.user.role);
    console.log("🎭 [RoleAuth] Required roles:", roles);
    
    if (!roles.includes(req.user.role)) {
      console.log("❌ [RoleAuth] Access denied - insufficient permissions");
      return res
        .status(403)
        .json({ message: "Access denied. Insufficient permissions." });
    }
    
    console.log("✅ [RoleAuth] Role authorization successful");
    next();
  };
};

module.exports = { authMiddleware, roleAuth };
