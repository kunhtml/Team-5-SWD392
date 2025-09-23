import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Container, CircularProgress } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

import { fetchUserFromToken } from "./store/slices/authSlice";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import ShopRequest from "./pages/ShopRequest";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPosts from "./pages/AdminPosts";
import FloristDashboard from "./pages/FloristDashboard";
import FloristProducts from "./pages/FloristProducts";
import AdminUserEdit from "./pages/AdminUserEdit";
import ShopDetail from "./pages/ShopDetail";
import WalletBalance from "./pages/WalletBalance";

function App() {
  const dispatch = useDispatch();
  const { isLoading, isInitialized } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchUserFromToken());
  }, [dispatch]);

  if (!isInitialized) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          py: 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/shops/:id" element={<ShopDetail />} />
        <Route
          path="/wallet/balance"
          element={
            <ProtectedRoute>
              <WalletBalance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute roles={["customer", "florist", "admin"]}>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shop-request"
          element={
            <ProtectedRoute roles={["customer"]}>
              <ShopRequest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/posts"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminPosts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/:id"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminUserEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/florist"
          element={
            <ProtectedRoute roles={["florist"]}>
              <FloristDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/florist/products"
          element={
            <ProtectedRoute roles={["florist", "admin"]}>
              <FloristProducts />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Container>
  );
}

export default App;
