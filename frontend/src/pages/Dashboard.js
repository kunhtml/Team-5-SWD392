import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { uploadImageToFreeImage } from "../utils/uploadImage";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Avatar,
  Container,
  Fade,
  Paper,
  Divider,
  IconButton,
  Chip,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { fetchUserFromToken } from "../store/slices/authSlice";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import StorefrontIcon from "@mui/icons-material/Storefront";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import HistoryIcon from "@mui/icons-material/History";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [editOpen, setEditOpen] = useState(false);
  const [stats, setStats] = useState({ orders: 0, wallet: 0 });
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    avatar_url: "",
  });
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Fetch orders count
      const ordersRes = await api.get("/orders");
      const myOrders = ordersRes.data.orders || [];
      
      // Fetch wallet balance
      const walletRes = await api.get("/wallet/balance");
      const balance = walletRes.data.wallet?.balance || 0;

      setStats({
        orders: myOrders.length,
        wallet: balance,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleOpenEdit = () => {
    setForm({
      name: user.name || "",
      phone: user.phone || "",
      address: user.address || "",
      avatar_url: user.avatar_url || "",
    });
    setEditOpen(true);
  };

  const handleSaveProfile = async () => {
    try {
      if (!form.name.trim()) {
        window.alert("Tên là bắt buộc");
        return;
      }
      await api.put("/users/profile", form);
      await dispatch(fetchUserFromToken());
      setEditOpen(false);
    } catch (e) {
      console.error("Cập nhật thông tin thất bại:", e);
      window.alert("Không thể cập nhật. Vui lòng thử lại.");
    }
  };

  const handleImageUpload = async (e) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      const url = await uploadImageToFreeImage(file);
      setForm((prev) => ({ ...prev, avatar_url: url }));
    } catch (err) {
      console.error("Upload ảnh lỗi:", err);
      window.alert("Không thể upload ảnh. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", pb: 6 }}>
      {/* Hero Header with Gradient */}
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
                Xin chào, {user.name}! 👋
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Chào mừng bạn quay trở lại với FlowerShop
              </Typography>
              <Chip
                label={user.role === "customer" ? "Khách hàng" : user.role}
                sx={{
                  mt: 2,
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontWeight: 600,
                }}
              />
            </Box>
          </Fade>
        </Container>
      </Box>

      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {/* Profile Card */}
          <Grid item xs={12} md={4}>
            <Fade in timeout={1000}>
              <Card
                elevation={3}
                sx={{
                  borderRadius: 3,
                  overflow: "visible",
                  position: "relative",
                }}
              >
                <CardContent sx={{ textAlign: "center", pt: 4, pb: 3 }}>
                  <Avatar
                    src={user.avatar_url || undefined}
                    alt={user.name}
                    sx={{
                      width: 120,
                      height: 120,
                      mx: "auto",
                      mb: 2,
                      border: "4px solid",
                      borderColor: "primary.main",
                      boxShadow: 3,
                    }}
                  >
                    {!user.avatar_url && user.name
                      ? user.name.charAt(0).toUpperCase()
                      : null}
                  </Avatar>
                  
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    {user.name}
                  </Typography>
                  
                  <Chip
                    icon={<PersonIcon />}
                    label="Khách hàng"
                    color="primary"
                    size="small"
                    sx={{ mb: 2 }}
                  />

                  <Divider sx={{ my: 2 }} />

                  <Stack spacing={1.5} sx={{ textAlign: "left" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>

                    {user.phone && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PhoneIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {user.phone}
                        </Typography>
                      </Box>
                    )}

                    {user.address && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <LocationOnIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {user.address}
                        </Typography>
                      </Box>
                    )}

                    {(!user.phone || !user.address) && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
                        {!user.phone && "📞 Chưa cập nhật số điện thoại"}
                        {!user.phone && !user.address && <br />}
                        {!user.address && "📍 Chưa cập nhật địa chỉ"}
                      </Typography>
                    )}
                  </Stack>

                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<EditIcon />}
                    onClick={handleOpenEdit}
                    sx={{
                      mt: 3,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      background: "linear-gradient(45deg, #667eea, #764ba2)",
                      "&:hover": {
                        background: "linear-gradient(45deg, #5a67d8, #6b5b95)",
                      },
                    }}
                  >
                    Chỉnh sửa thông tin
                  </Button>
                </CardContent>
              </Card>
            </Fade>
          </Grid>

          {/* Stats Cards */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              {/* Orders Stat */}
              <Grid item xs={12} sm={6}>
                <Fade in timeout={1200}>
                  <Card
                    elevation={2}
                    sx={{
                      borderRadius: 3,
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      cursor: "pointer",
                      transition: "transform 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 6,
                      },
                    }}
                    onClick={() => navigate("/orders")}
                  >
                    <CardContent>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box>
                          <Typography variant="h4" fontWeight={700}>
                            {loading ? <CircularProgress size={32} sx={{ color: "white" }} /> : stats.orders}
                          </Typography>
                          <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
                            Đơn hàng
                          </Typography>
                        </Box>
                        <ShoppingBagIcon sx={{ fontSize: 64, opacity: 0.3 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>

              {/* Wallet Stat */}
              <Grid item xs={12} sm={6}>
                <Fade in timeout={1400}>
                  <Card
                    elevation={2}
                    sx={{
                      borderRadius: 3,
                      background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                      color: "white",
                      cursor: "pointer",
                      transition: "transform 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 6,
                      },
                    }}
                    onClick={() => navigate("/wallet/balance")}
                  >
                    <CardContent>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box>
                          <Typography variant="h4" fontWeight={700}>
                            {loading ? <CircularProgress size={32} sx={{ color: "white" }} /> : `${stats.wallet.toLocaleString()}đ`}
                          </Typography>
                          <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
                            Số dư ví
                          </Typography>
                        </Box>
                        <AccountBalanceWalletIcon sx={{ fontSize: 64, opacity: 0.3 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>

              {/* Quick Actions */}
              <Grid item xs={12}>
                <Fade in timeout={1600}>
                  <Card elevation={2} sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                        🚀 Hành động nhanh
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                          <Button
                            variant="outlined"
                            fullWidth
                            startIcon={<ShoppingBagIcon />}
                            onClick={() => navigate("/orders")}
                            sx={{
                              py: 1.5,
                              borderRadius: 2,
                              textTransform: "none",
                              fontWeight: 600,
                              borderWidth: 2,
                              "&:hover": { borderWidth: 2 },
                            }}
                          >
                            Đơn hàng
                          </Button>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                          <Button
                            variant="outlined"
                            fullWidth
                            startIcon={<AccountBalanceWalletIcon />}
                            onClick={() => navigate("/wallet/balance")}
                            sx={{
                              py: 1.5,
                              borderRadius: 2,
                              textTransform: "none",
                              fontWeight: 600,
                              borderWidth: 2,
                              "&:hover": { borderWidth: 2 },
                            }}
                          >
                            Ví tiền
                          </Button>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                          <Button
                            variant="outlined"
                            fullWidth
                            startIcon={<LocalFloristIcon />}
                            onClick={() => navigate("/special-order-history")}
                            sx={{
                              py: 1.5,
                              borderRadius: 2,
                              textTransform: "none",
                              fontWeight: 600,
                              borderWidth: 2,
                              "&:hover": { borderWidth: 2 },
                            }}
                          >
                            Đơn đặc biệt
                          </Button>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                          <Button
                            variant="contained"
                            fullWidth
                            startIcon={<StorefrontIcon />}
                            onClick={() => navigate("/shop-request")}
                            sx={{
                              py: 1.5,
                              borderRadius: 2,
                              textTransform: "none",
                              fontWeight: 600,
                              background: "linear-gradient(45deg, #667eea, #764ba2)",
                              "&:hover": {
                                background: "linear-gradient(45deg, #5a67d8, #6b5b95)",
                              },
                            }}
                          >
                            Mở cửa hàng
                          </Button>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            </Grid>
          </Grid>

          {/* Info Card */}
          <Grid item xs={12}>
            <Fade in timeout={1800}>
              <Paper elevation={1} sx={{ p: 3, bgcolor: "info.50", borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  💡 Bạn có biết?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Bạn có thể đặt hoa đặc biệt theo yêu cầu riêng của mình
                  <br />
                  • Mở cửa hàng để trở thành người bán hoa và kiếm thêm thu nhập
                  <br />
                  • Xem lịch sử đơn hàng và theo dõi tình trạng giao hàng
                  <br />• Quản lý ví tiền và rút tiền dễ dàng
                </Typography>
              </Paper>
            </Fade>
          </Grid>
        </Grid>
      </Container>

      {/* Edit Profile Dialog */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "1.5rem" }}>
          ✏️ Chỉnh sửa thông tin cá nhân
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Họ và tên"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Số điện thoại"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              fullWidth
              placeholder="0123456789"
            />
            <TextField
              label="Địa chỉ"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              multiline
              rows={3}
              fullWidth
              placeholder="Số nhà, đường, phường, quận, thành phố"
            />
            
            <Divider />
            
            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Ảnh đại diện
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
                <Button
                  variant="outlined"
                  component="label"
                  size="small"
                  startIcon={uploading ? <CircularProgress size={16} /> : null}
                  disabled={uploading}
                >
                  Chọn ảnh
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageUpload}
                  />
                </Button>
                {!uploading && form.avatar_url && (
                  <CheckCircleIcon color="success" />
                )}
              </Box>
              {form.avatar_url && (
                <Box sx={{ mt: 2, textAlign: "center" }}>
                  <Avatar
                    src={form.avatar_url}
                    alt="Preview"
                    sx={{ width: 100, height: 100, mx: "auto", boxShadow: 2 }}
                  />
                </Box>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setEditOpen(false)} sx={{ textTransform: "none" }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveProfile}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              background: "linear-gradient(45deg, #667eea, #764ba2)",
              "&:hover": {
                background: "linear-gradient(45deg, #5a67d8, #6b5b95)",
              },
            }}
          >
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
