import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Box, Typography, CircularProgress } from "@mui/material";

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, isLoading } = useSelector((state) => state.auth);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    // Special message for order request page
    const isOrderRequestPage = window.location.pathname === '/order-request';
    const message = isOrderRequestPage 
      ? "Trang này chỉ hỗ trợ người mua đã đăng ký tài khoản"
      : "Bạn không có quyền truy cập trang này.";
    
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Typography variant="h5" color="error">
          {message}
        </Typography>
      </Box>
    );
  }

  return children;
};

export default ProtectedRoute;
