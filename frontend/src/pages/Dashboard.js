import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Avatar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { fetchUserFromToken } from "../store/slices/authSlice";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    avatar_url: "",
  });
  const [uploading, setUploading] = useState(false);
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
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setForm({
                        name: user.name || "",
                        phone: user.phone || "",
                        address: user.address || "",
                        avatar_url: user.avatar_url || "",
                      });
                      setEditOpen(true);
                    }}
                  >
                    Chỉnh sửa thông tin
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Chào {user.name}! ({user.role})
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">Thông Tin Cá Nhân</Typography>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
                >
                  <Avatar
                    src={user.avatar_url || undefined}
                    alt={user.name}
                    sx={{ width: 72, height: 72 }}
                  >
                    {!user.avatar_url && user.name
                      ? user.name.charAt(0).toUpperCase()
                      : null}
                  </Avatar>
                </Box>
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
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/orders")}
                  >
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
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chỉnh sửa thông tin cá nhân</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Họ và tên"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <TextField
              label="Số điện thoại"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <TextField
              label="Địa chỉ"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              multiline
              minRows={2}
            />
            <TextField
              label="Avatar URL"
              value={form.avatar_url}
              onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
              placeholder="https://..."
            />
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button variant="outlined" component="label" size="small">
                Chọn ảnh từ máy
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={async (e) => {
                    try {
                      setUploading(true);
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const imgbbKey = process.env.REACT_APP_IMGBB_KEY;
                      if (!imgbbKey) {
                        window.alert("Thiếu REACT_APP_IMGBB_KEY trong env");
                        return;
                      }
                      const fd = new FormData();
                      fd.append("key", imgbbKey);
                      fd.append("image", file);
                      const res = await fetch(
                        "https://api.imgbb.com/1/upload",
                        {
                          method: "POST",
                          body: fd,
                        }
                      );
                      const data = await res.json();
                      if (!data?.success) {
                        console.error("ImgBB upload failed:", data);
                        window.alert("Upload ảnh thất bại");
                        return;
                      }
                      const url = data.data?.url; // or display_url
                      if (url)
                        setForm((prev) => ({ ...prev, avatar_url: url }));
                    } catch (err) {
                      console.error("Upload ảnh lỗi:", err);
                      window.alert("Không thể upload ảnh. Vui lòng thử lại.");
                    } finally {
                      setUploading(false);
                    }
                  }}
                />
              </Button>
              {uploading && <CircularProgress size={18} />}
              {!uploading && !!form.avatar_url && (
                <CheckCircleIcon
                  fontSize="small"
                  sx={{ color: "success.main" }}
                />
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={async () => {
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
            }}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Dashboard;
