import React, { useState } from "react";
import { useSelector } from "react-redux";
import api from "../services/api";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
} from "@mui/material";

const ShopRequest = () => {
  const [formData, setFormData] = useState({
    shop_name: "",
    business_description: "",
    address: "",
    phone: "",
    business_email: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await api.post("/shops/request", formData);
      setSuccess(true);
      setFormData({
        // Reset form
        shop_name: "",
        business_description: "",
        address: "",
        phone: "",
        business_email: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi gửi yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Alert severity="success">
          Yêu cầu mở cửa hàng đã được gửi thành công! Admin sẽ xem xét trong
          thời gian sớm.
        </Alert>
        <Button variant="contained" href="/dashboard" sx={{ mt: 2 }}>
          Quay Lại Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Box sx={{ p: 4, boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom align="center">
          Yêu Cầu Mở Cửa Hàng
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Tên Cửa Hàng"
            name="shop_name"
            value={formData.shop_name}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Mô Tả Kinh Doanh"
            name="business_description"
            value={formData.business_description}
            onChange={handleChange}
            multiline
            rows={4}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Địa Chỉ Cửa Hàng"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Số Điện Thoại"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Email Kinh Doanh"
            name="business_email"
            type="email"
            value={formData.business_email}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
          />
          {/* Note: File upload for business_license would use input type="file" and FormData */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            * Giấy phép kinh doanh (PDF/Image) sẽ được upload trong phiên bản
            đầy đủ
          </Typography>

          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={loading}
          >
            {loading ? "Đang Gửi..." : "Gửi Yêu Cầu"}
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default ShopRequest;
