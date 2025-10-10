import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { uploadImageToFreeImage } from "../utils/uploadImage";
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
  Card,
  CardContent,
  Grid,
  Chip,
  Fade,
  Container,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StorefrontIcon from "@mui/icons-material/Storefront";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import RefreshIcon from "@mui/icons-material/Refresh";

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
        api.get("/products/mine", { params: { limit: 50 } }),
        api.get("/orders/shop", { params: { limit: 50 } }),
      ]);
      setShop(shopRes.data.shop);
      setProducts(productsRes.data.products || []);
      setOrders(ordersRes.data.orders || []);
    } catch (error) {
      console.error("Error fetching florist data:", error);
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

    setUploadingShopImg(true);
    try {
      const url = await uploadImageToFreeImage(file);
      setEditForm((prev) => ({ ...prev, image_url: url }));
    } catch (err) {
      console.error("Upload ảnh cửa hàng lỗi:", err);
      window.alert("Không thể tải ảnh lên. Vui lòng thử lại.");
    } finally {
      setUploadingShopImg(false);
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
        uploadedUrl = await uploadImageToFreeImage(imageFile);
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
      await reloadProducts();
    } catch (e) {
      setError(
        e.response?.data?.message || e.message || "Không thể tạo sản phẩm"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", pb: 6 }}>
      {/* Hero Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          py: 6,
          mb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Fade in timeout={800}>
            <Box>
              <Typography variant="h3" fontWeight={800} gutterBottom>
                <StorefrontIcon
                  sx={{ fontSize: 40, mr: 2, verticalAlign: "middle" }}
                />
                Dashboard Cửa Hàng
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Quản lý shop, sản phẩm và đơn hàng của bạn
              </Typography>
            </Box>
          </Fade>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Shop Stats Cards */}
        {shop && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Shop Info Card */}
            <Grid item xs={12} md={4}>
              <Card
                elevation={2}
                sx={{
                  height: "100%",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: -50,
                    right: -50,
                    width: 150,
                    height: 150,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.1)",
                  }}
                />
                <CardContent sx={{ position: "relative", zIndex: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      src={shop.image_url || undefined}
                      alt={shop.name}
                      sx={{
                        width: 80,
                        height: 80,
                        mr: 2,
                        border: "3px solid white",
                      }}
                    >
                      {(shop?.name || "?").charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="h5" fontWeight={700}>
                        {shop.name}
                      </Typography>
                      <Chip
                        label={
                          shop.status === "approved" ? "Đã duyệt" : shop.status
                        }
                        size="small"
                        sx={{
                          bgcolor: "rgba(255,255,255,0.3)",
                          color: "white",
                          mt: 0.5,
                        }}
                      />
                    </Box>
                  </Box>
                  <Divider sx={{ bgcolor: "rgba(255,255,255,0.2)", my: 2 }} />
                  <Stack spacing={1}>
                    {shop.phone && (
                      <Typography variant="body2">📞 {shop.phone}</Typography>
                    )}
                    {shop.email && (
                      <Typography variant="body2">📧 {shop.email}</Typography>
                    )}
                    {shop.address && (
                      <Typography variant="body2">📍 {shop.address}</Typography>
                    )}
                  </Stack>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => openEditShop()}
                    startIcon={<EditIcon />}
                    sx={{
                      mt: 2,
                      bgcolor: "white",
                      color: "primary.main",
                      "&:hover": { bgcolor: "grey.100" },
                    }}
                  >
                    Chỉnh sửa Shop
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Revenue Card */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                elevation={2}
                sx={{
                  height: "100%",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    opacity: 0.1,
                  }}
                />
                <CardContent sx={{ position: "relative" }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar sx={{ bgcolor: "success.main", mr: 2 }}>
                      <AttachMoneyIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight={600}>
                      Doanh Thu
                    </Typography>
                  </Box>
                  <Typography
                    variant="h4"
                    fontWeight={800}
                    color="success.main"
                  >
                    {parseFloat(shop.total_revenue || 0).toLocaleString(
                      "vi-VN"
                    )}{" "}
                    ₫
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Tổng doanh thu từ {shop.total_orders || 0} đơn hàng
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Orders Card */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                elevation={2}
                sx={{
                  height: "100%",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                    opacity: 0.1,
                  }}
                />
                <CardContent sx={{ position: "relative" }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                      <ShoppingCartIcon />
                    </Avatar>
                    <Typography variant="h6" fontWeight={600}>
                      Đơn Hàng
                    </Typography>
                  </Box>
                  <Typography
                    variant="h4"
                    fontWeight={800}
                    color="primary.main"
                  >
                    {shop.completed_orders || 0}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Đơn hoàn thành / {shop.total_orders || 0} tổng đơn
                  </Typography>
                  <Chip
                    label={`Đánh giá: ${shop.average_rating || 0}/5 ⭐`}
                    size="small"
                    color="warning"
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tabs Section */}
        <Paper elevation={2} sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(e, v) => setTabValue(v)}
            variant="fullWidth"
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              "& .MuiTab-root": { fontWeight: 600, fontSize: "1rem" },
            }}
          >
            <Tab
              icon={<InventoryIcon />}
              iconPosition="start"
              label={`Sản Phẩm (${products.length})`}
            />
            <Tab
              icon={<ShoppingCartIcon />}
              iconPosition="start"
              label={`Đơn Hàng (${orders.length})`}
            />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {tabValue === 0 && (
          <Paper elevation={2}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 2,
                borderBottom: 1,
                borderColor: "divider",
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                Danh Sách Sản Phẩm
              </Typography>
              <Box>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={reloadProducts}
                  sx={{ mr: 1 }}
                >
                  Tải lại
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    fetchCategories();
                    setCreateProductOpen(true);
                  }}
                >
                  Tạo sản phẩm
                </Button>
              </Box>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Tên</TableCell>
                    <TableCell align="right">Giá</TableCell>
                    <TableCell align="right">Tồn Kho</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          Chưa có sản phẩm nào.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  {products.map((product) => (
                    <TableRow key={product.id} hover>
                      <TableCell>{product.id}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell align="right">
                        {parseFloat(product.price).toLocaleString("vi-VN")} ₫
                      </TableCell>
                      <TableCell align="right">{product.stock}</TableCell>
                      <TableCell>
                        <Chip
                          label={product.status}
                          size="small"
                          color={
                            product.status === "approved"
                              ? "success"
                              : "default"
                          }
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => navigate(`/florist/products`)}
                        >
                          Quản lý
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {tabValue === 1 && (
          <Paper elevation={2}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 2,
                borderBottom: 1,
                borderColor: "divider",
              }}
            >
              <Typography variant="h6" fontWeight={600}>
                Danh Sách Đơn Hàng
              </Typography>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={reloadOrders}
              >
                Tải lại
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Khách Hàng</TableCell>
                    <TableCell align="right">Tổng Tiền</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          Chưa có đơn hàng nào.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  {orders.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{order.customer?.name}</TableCell>
                      <TableCell align="right">
                        {parseFloat(order.total_amount).toLocaleString("vi-VN")}{" "}
                        ₫
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.status}
                          size="small"
                          color={
                            order.status === "completed"
                              ? "success"
                              : order.status === "cancelled"
                              ? "error"
                              : "default"
                          }
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="outlined"
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
          </Paper>
        )}

        {/* Quick Actions */}
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/wallet/balance")}
            sx={{ minWidth: 200 }}
          >
            Quản lý Ví
          </Button>
        </Box>
      </Container>

      {/* Order Dialog */}
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
              <strong>Người mua:</strong> {selectedOrder?.customer?.name || ""}
            </Typography>
            <Typography>
              <strong>SĐT:</strong> {selectedOrder?.customer?.phone || ""}
            </Typography>
            <Typography>
              <strong>Địa chỉ giao hàng:</strong>{" "}
              {selectedOrder?.shipping_address || ""}
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
                    ₫
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

      {/* Edit Shop Dialog */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chỉnh sửa thông tin cửa hàng</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
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
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  src={editForm.image_url}
                  alt="Shop avatar"
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
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={submitEditShop}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Product Dialog */}
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
              onChange={(e) =>
                setProductForm({ ...productForm, name: e.target.value })
              }
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
              onChange={(e) =>
                setProductForm({ ...productForm, stock: e.target.value })
              }
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
          <Button
            variant="contained"
            onClick={handleCreateProduct}
            disabled={saving}
          >
            {saving ? "Đang lưu..." : "Tạo"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FloristDashboard;
