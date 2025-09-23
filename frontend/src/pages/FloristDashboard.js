import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  TextField,
} from "@mui/material";

const FloristDashboard = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    image_url: "",
  });

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
      // Clear stale data if fetch fails
      setProducts([]);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshShopStats = async () => {
    try {
      const res = await api.get("/shops/my-shop");
      setShop(res.data.shop);
    } catch (e) {
      console.error("Không thể tải lại thông tin cửa hàng:", e);
    }
  };

  const openEditShop = () => {
    if (!shop) return;
    setEditForm({
      name: shop.name || "",
      description: shop.description || "",
      address: shop.address || "",
      phone: shop.phone || "",
      email: shop.email || "",
      image_url: shop.image_url || "",
    });
    setEditOpen(true);
  };

  const handleEditChange = (field) => (e) => {
    setEditForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const submitEditShop = async () => {
    try {
      if (!editForm.name.trim()) {
        window.alert("Tên cửa hàng là bắt buộc");
        return;
      }
      const payload = { ...editForm };
      await api.put("/shops/my-shop", payload);
      // Refresh and close
      await refreshShopStats();
      setEditOpen(false);
    } catch (e) {
      console.error("Cập nhật cửa hàng thất bại:", e);
      window.alert("Không thể cập nhật thông tin cửa hàng. Vui lòng thử lại.");
    }
  };

  const reloadProducts = async () => {
    try {
      const res = await api.get("/products/mine", { params: { limit: 50 } });
      setProducts(res.data.products || []);
    } catch (e) {
      console.error("Không thể tải sản phẩm:", e);
      setProducts([]);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenOrderDialog = (order) => {
    setSelectedOrder(order);
    setOrderDialogOpen(true);
  };

  const handleCloseOrderDialog = () => {
    setOrderDialogOpen(false);
    setSelectedOrder(null);
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    try {
      setActionLoading(true);
      await api.put(`/orders/${selectedOrder.id}/status`, { status: "cancelled" });
      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: "cancelled" } : o))
      );
      await refreshShopStats();
      handleCloseOrderDialog();
    } catch (err) {
      console.error("Hủy đơn thất bại:", err);
      window.alert("Không thể hủy đơn. Vui lòng thử lại.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkDelivered = async () => {
    if (!selectedOrder) return;
    try {
      setActionLoading(true);
      await api.put(`/orders/${selectedOrder.id}/status`, { status: "completed" });
      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: "completed" } : o))
      );
      await refreshShopStats();
      handleCloseOrderDialog();
    } catch (err) {
      console.error("Cập nhật giao thành công thất bại:", err);
      window.alert("Không thể cập nhật giao thành công. Vui lòng thử lại.");
    } finally {
      setActionLoading(false);
    }
  };

  const reloadOrders = async () => {
    try {
      const res = await api.get("/orders/shop", { params: { limit: 50 } });
      setOrders(res.data.orders || []);
    } catch (e) {
      console.error("Không thể tải đơn hàng:", e);
      setOrders([]);
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
          <Box sx={{ mt: 2 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={async () => {
                try {
                  await api.post("/shops/my-shop/recalc");
                  await refreshShopStats();
                } catch (e) {
                  console.error("Recalc failed:", e);
                  window.alert("Không thể đồng bộ số liệu. Hãy thử lại.");
                }
              }}
            >
              Đồng bộ số liệu
            </Button>
            <Button
              size="small"
              sx={{ ml: 1 }}
              variant="text"
              onClick={refreshShopStats}
            >
              Làm mới
            </Button>
            <Button
              size="small"
              sx={{ ml: 1 }}
              variant="outlined"
              onClick={openEditShop}
            >
              Chỉnh sửa thông tin
            </Button>
          </Box>
        </Paper>
      )}

      <Box
        sx={{
          mb: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
        }}
      >
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Sản Phẩm" />
          <Tab label="Đơn Hàng" />
        </Tabs>
        <Button
          size="small"
          variant="contained"
          sx={{ ml: 2 }}
          onClick={() => navigate("/wallet/balance")}
        >
          Ví của tôi
        </Button>
      </Box>

      {tabValue === 0 && (
        <TableContainer component={Paper}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
            <Button size="small" variant="outlined" onClick={reloadProducts}>
              Tải lại
            </Button>
          </Box>
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
          <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
            <Button size="small" variant="outlined" onClick={reloadOrders}>
              Tải lại
            </Button>
          </Box>
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
                    <Button size="small" onClick={() => handleOpenOrderDialog(order)}>
                      Xử Lý
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Order processing dialog */}
      <Dialog open={orderDialogOpen} onClose={handleCloseOrderDialog} maxWidth="md" fullWidth>
        <DialogTitle>Chi Tiết Đơn Hàng #{selectedOrder?.id}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 2 }}>
            <Typography>
              Người mua: <strong>{selectedOrder?.customer?.name || ""}</strong>
            </Typography>
            <Typography>
              SĐT: <strong>{selectedOrder?.customer?.phone || ""}</strong>
            </Typography>
            <Typography>
              Địa chỉ giao hàng: <strong>{selectedOrder?.shipping_address || ""}</strong>
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Tên sản phẩm</TableCell>
                <TableCell align="right">Đơn giá</TableCell>
                <TableCell align="right">Số lượng</TableCell>
                <TableCell align="right">Thành tiền</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(selectedOrder?.items || []).map((it) => (
                <TableRow key={it.id}>
                  <TableCell>{it.product?.name}</TableCell>
                  <TableCell align="right">
                    {parseFloat(it.price).toLocaleString("vi-VN")}
                  </TableCell>
                  <TableCell align="right">{it.quantity}</TableCell>
                  <TableCell align="right">
                    {parseFloat(it.price * it.quantity).toLocaleString("vi-VN")}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} align="right">
                  <strong>Tổng cộng</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>
                    {parseFloat(selectedOrder?.total_amount || 0).toLocaleString("vi-VN")} VNĐ
                  </strong>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseOrderDialog} disabled={actionLoading}>Đóng</Button>
          <Button color="error" onClick={handleCancelOrder} disabled={actionLoading}>
            Hủy đơn
          </Button>
          <Button variant="contained" onClick={handleMarkDelivered} disabled={actionLoading}>
            Giao thành công
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit shop dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Chỉnh sửa thông tin cửa hàng</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Tên cửa hàng"
              value={editForm.name}
              onChange={handleEditChange("name")}
              required
            />
            <TextField
              label="Mô tả"
              value={editForm.description}
              onChange={handleEditChange("description")}
              multiline
              minRows={2}
            />
            <TextField
              label="Địa chỉ"
              value={editForm.address}
              onChange={handleEditChange("address")}
            />
            <TextField
              label="Số điện thoại"
              value={editForm.phone}
              onChange={handleEditChange("phone")}
            />
            <TextField
              label="Email"
              value={editForm.email}
              onChange={handleEditChange("email")}
            />
            <TextField
              label="Ảnh đại diện (URL)"
              value={editForm.image_url}
              onChange={handleEditChange("image_url")}
              placeholder="https://..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={submitEditShop}>Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FloristDashboard;
