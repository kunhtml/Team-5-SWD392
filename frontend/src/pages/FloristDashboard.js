import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../services/api";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from "@mui/material";

const FloristDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    fetchFloristData();
  }, []);

  const fetchFloristData = async () => {
    try {
      setLoading(true);
      const [shopRes, productsRes, ordersRes] = await Promise.all([
        api.get("/shops/my-shop"),
        // Use dedicated endpoint for florist/admin products
        api.get("/products/mine", { params: { limit: 50 } }),
        api.get("/orders/shop", { params: { limit: 50 } }),
      ]);
      setShop(shopRes.data.shop);
      setProducts(productsRes.data.products || []);
      setOrders(ordersRes.data.orders || []);
    } catch (error) {
      console.error("Error fetching florist data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleProcessOrder = async (orderId) => {
    try {
      setUpdatingOrderId(orderId);
      await api.put(`/orders/${orderId}/status`, { status: "processing" });
      // Optimistically update local state
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "processing" } : o))
      );
    } catch (err) {
      console.error("Cập nhật trạng thái đơn hàng thất bại:", err);
      window.alert("Không thể cập nhật trạng thái. Vui lòng thử lại.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard Cửa Hàng
      </Typography>

      {shop && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6">Thông Tin Cửa Hàng</Typography>
          <Typography>Tên: {shop.name}</Typography>
          <Typography>
            Doanh Thu:{" "}
            {parseFloat(shop.total_revenue || 0).toLocaleString("vi-VN", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}{" "}
            VNĐ
          </Typography>
          <Typography>Đơn Hàng Hoàn Thành: {shop.completed_orders}</Typography>
          <Typography>
            Đánh Giá: {shop.average_rating}/5 ({shop.total_reviews} reviews)
          </Typography>
        </Paper>
      )}

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 4 }}>
        <Tab label="Sản Phẩm" />
        <Tab label="Đơn Hàng" />
      </Tabs>

      {tabValue === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Tên</TableCell>
                <TableCell>Giá</TableCell>
                <TableCell>Tồn Kho</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Chưa có sản phẩm nào.
                  </TableCell>
                </TableRow>
              )}
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.id}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>
                    {parseFloat(product.price).toLocaleString("vi-VN", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}{" "}
                    VNĐ
                  </TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>{product.status}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => {
                        /* Edit product */
                      }}
                    >
                      Sửa
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => {
                        /* Delete */
                      }}
                    >
                      Xóa
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tabValue === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Khách Hàng</TableCell>
                <TableCell>Tổng Tiền</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Chưa có đơn hàng nào.
                  </TableCell>
                </TableRow>
              )}
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.customer?.name}</TableCell>
                  <TableCell>
                    {parseFloat(order.total_amount).toLocaleString("vi-VN", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })} VNĐ
                  </TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      disabled={updatingOrderId === order.id || order.status !== "pending"}
                      onClick={() => handleProcessOrder(order.id)}
                    >
                      Xử Lý
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default FloristDashboard;
