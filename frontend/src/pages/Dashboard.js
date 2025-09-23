import React from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  const getRoleSpecificContent = () => {
    switch (user.role) {
      case "admin":
        return (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">Admin Dashboard</Typography>
                <Typography>Quản lý người dùng, cửa hàng, đơn hàng</Typography>
                <Chip label="Quản lý" color="primary" sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>
        );
      case "florist":
        return (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">Cửa Hàng Của Bạn</Typography>
                <Typography>Quản lý sản phẩm, đơn hàng, doanh thu</Typography>
                <Chip label="Sản Phẩm" color="secondary" sx={{ mt: 1 }} />
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => navigate("/florist/products")}
                  >
                    Xem sản phẩm của shop
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        );
      case "customer":
        return (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">Tài Khoản Của Bạn</Typography>
                <Typography>
                  Xem đơn hàng, ví tiền, yêu cầu mở cửa hàng
                </Typography>
                <Chip label="Đơn Hàng" color="success" sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Chào {user.name}! ({user.role})
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Thông Tin Cá Nhân</Typography>
              <Typography>Email: {user.email}</Typography>
              <Typography>SĐT: {user.phone || "Chưa cập nhật"}</Typography>
              <Typography>
                Địa chỉ: {user.address || "Chưa cập nhật"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vai trò: {user.role}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {getRoleSpecificContent()}

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6">Hành Động Nhanh</Typography>
              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Button variant="outlined" onClick={() => navigate("/orders")}>
                  Đơn Hàng
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/wallet/balance")}
                >
                  Ví Tiền
                </Button>
                {user.role === "customer" && (
                  <Button
                    variant="contained"
                    onClick={() => navigate("/shop-request")}
                  >
                    Mở Cửa Hàng
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
