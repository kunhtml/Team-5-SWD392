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
  Avatar,
  CircularProgress,
  MenuItem,
  Stack,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

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
  const [uploadingShopImg, setUploadingShopImg] = useState(false);
  // States for product creation dialog
  const [createProductOpen, setCreateProductOpen] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
    category_id: "",
  });
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data.categories || []);
    } catch (e) {
      console.error("Failed to load categories", e);
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

  const handleShopImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const key = process.env.REACT_APP_IMGBB_KEY;
    if (!key) {
      window.alert("Thiếu REACT_APP_IMGBB_KEY trong frontend .env");
      return;
    }
    setUploadingShopImg(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      const url = data?.data?.url;
      if (url) {
        setEditForm((prev) => ({ ...prev, image_url: url }));
      } else {
        throw new Error("Upload thất bại");
      }
    } catch (err) {
      console.error("Upload ảnh cửa hàng lỗi:", err);
      window.alert("Không thể tải ảnh lên. Vui lòng thử lại.");
    } finally {
      setUploadingShopImg(false);
      // reset file input value to allow re-selecting same file
      e.target.value = "";
    }
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
      await api.put(`/orders/${selectedOrder.id}/status`, {
        status: "cancelled",
      });
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id ? { ...o, status: "cancelled" } : o
        )
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
      await api.put(`/orders/${selectedOrder.id}/status`, {
        status: "completed",
      });
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id ? { ...o, status: "completed" } : o
        )
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

  const resetProductForm = () => {
    setProductForm({
      name: "",
      price: "",
      stock: "",
      description: "",
      category_id: "",
    });
    setImageFile(null);
    setError("");
  };

  const handleCreateProduct = async () => {
    setSaving(true);
    setError("");
    try {
      const priceNum = parseInt(productForm.price, 10);
      if (!Number.isFinite(priceNum) || priceNum <= 0) {
        throw new Error("Giá phải là số nguyên dương");
      }
      let uploadedUrl = null;
      if (imageFile) {
        const imgbbKey = process.env.REACT_APP_IMGBB_KEY;
        if (!imgbbKey) {
          throw new Error("Thiếu REACT_APP_IMGBB_KEY trong env");
        }
        const formData = new FormData();
        formData.append("key", imgbbKey);
        formData.append("image", imageFile);
        const res = await fetch("https://api.imgbb.com/1/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!data || !data.success) {
          throw new Error("Tải ảnh lên thất bại");
        }
        uploadedUrl = data.data?.url || data.data?.display_url;
      }

      const payload = {
        name: productForm.name,
        price: priceNum,
        stock: parseInt(productForm.stock, 10),
        description: productForm.description,
        category_id: parseInt(productForm.category_id, 10),
      };
      if (uploadedUrl) payload.image_url = uploadedUrl;

      await api.post("/products", payload);
      setCreateProductOpen(false);
      resetProductForm();
      await reloadProducts(); // Refresh the product list
    } catch (e) {
      setError(
        e.response?.data?.message || e.message || "Không thể tạo sản phẩm"
      );
    } finally {
      setSaving(false);
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
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1, mb: 2 }}
          >
            <Avatar
              src={shop.image_url || undefined}
              alt={shop.name || "Shop"}
              sx={{ width: 72, height: 72 }}
            >
              {(shop?.name || "?").charAt(0).toUpperCase()}
            </Avatar>
          </Box>
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
          {!!shop.email && <Typography>Email: {shop.email}</Typography>}
          {!!shop.phone && <Typography>Số điện thoại: {shop.phone}</Typography>}
          {!!shop.address && <Typography>Địa chỉ: {shop.address}</Typography>}
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
            <Button 
              size="small" 
              variant="contained" 
              sx={{ mr: 1 }}
              onClick={() => {
                fetchCategories();
                setCreateProductOpen(true);
              }}
            >
              Tạo sản phẩm
            </Button>
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
                    })}{" "}
                    VNĐ
                  </TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => handleOpenOrderDialog(order)}
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

      {/* Order processing dialog */}
      <Dialog
        open={orderDialogOpen}
        onClose={handleCloseOrderDialog}
        maxWidth="md"
        fullWidth
      >
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
              Địa chỉ giao hàng:{" "}
              <strong>{selectedOrder?.shipping_address || ""}</strong>
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
                    {parseFloat(
                      selectedOrder?.total_amount || 0
                    ).toLocaleString("vi-VN")}{" "}
                    VNĐ
                  </strong>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseOrderDialog} disabled={actionLoading}>
            Đóng
          </Button>
          <Button
            color="error"
            onClick={handleCancelOrder}
            disabled={actionLoading}
          >
            Hủy đơn
          </Button>
          <Button
            variant="contained"
            onClick={handleMarkDelivered}
            disabled={actionLoading}
          >
            Giao thành công
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit shop dialog */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="sm"
        fullWidth
      >
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <input
                id="shop-avatar-file"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleShopImageFileChange}
              />
              <label htmlFor="shop-avatar-file">
                <Button variant="outlined" component="span" size="small">
                  Chọn ảnh từ máy
                </Button>
              </label>
              {uploadingShopImg ? (
                <CircularProgress size={20} />
              ) : editForm.image_url ? (
                <CheckCircleIcon color="success" fontSize="small" />
              ) : null}
            </Box>
            {editForm.image_url && (
              <Box
                sx={{ mt: 1, display: "flex", alignItems: "center", gap: 2 }}
              >
                <Avatar
                  src={editForm.image_url}
                  alt="Shop avatar preview"
                  sx={{ width: 56, height: 56 }}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ wordBreak: "break-all" }}
                >
                  {editForm.image_url}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={submitEditShop}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create product dialog */}
      <Dialog
        open={createProductOpen}
        onClose={() => {
          setCreateProductOpen(false);
          resetProductForm();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Tạo sản phẩm</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && <Typography color="error">{error}</Typography>}
            <TextField
              label="Tên sản phẩm"
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              required
            />
            <TextField
              label="Danh mục"
              select
              value={productForm.category_id}
              onChange={(e) =>
                setProductForm({ ...productForm, category_id: e.target.value })
              }
              required
            >
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Giá"
              type="text"
              inputMode="numeric"
              value={productForm.price}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "");
                setProductForm({ ...productForm, price: v });
              }}
              required
              helperText="Chỉ nhập số, > 0"
            />
            <TextField
              label="Tồn kho"
              type="number"
              value={productForm.stock}
              onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
              required
            />
            <TextField
              label="Mô tả"
              multiline
              minRows={3}
              value={productForm.description}
              onChange={(e) =>
                setProductForm({ ...productForm, description: e.target.value })
              }
            />
            <Button variant="outlined" component="label">
              Chọn ảnh
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setImageFile(f);
                }}
              />
            </Button>
            {imageFile && (
              <Typography variant="body2" color="text.secondary">
                Ảnh đã chọn: {imageFile.name}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCreateProductOpen(false);
              resetProductForm();
            }}
          >
            Hủy
          </Button>
          <Button variant="contained" onClick={handleCreateProduct} disabled={saving}>
            {saving ? "Đang lưu..." : "Tạo"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FloristDashboard;