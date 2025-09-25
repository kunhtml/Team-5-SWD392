import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Snackbar,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const OrderRequest = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    productName: "",
    description: "",
    category: "",
    budget: "",
    quantity: 1,
    deliveryDate: "",
    additionalNotes: "",
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });

  const categories = [
    "Hoa Sinh Nhật",
    "Hoa Cưới",
    "Hoa Tình Yêu",
    "Hoa Chia Buổi",
    "Hoa Khai Trương",
    "Hoa Tặng Mẹ",
    "Hoa Tặng Thầy Cô",
    "Hoa Sự Kiện",
    "Khác"
  ];

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // In a real implementation, you would send this to your backend
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setNotification({
        open: true,
        message: "Yêu cầu đặt hàng đã được gửi thành công! Chúng tôi sẽ liên hệ với bạn sớm.",
        severity: "success"
      });
      
      // Reset form
      setForm({
        productName: "",
        description: "",
        category: "",
        budget: "",
        quantity: 1,
        deliveryDate: "",
        additionalNotes: "",
      });
    } catch (error) {
      setNotification({
        open: true,
        message: "Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Yêu Cầu Đặt Hàng Đặc Biệt
      </Typography>
      
      <Paper sx={{ p: 4 }}>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Hãy mô tả chi tiết sản phẩm bạn muốn đặt hàng. Chúng tôi sẽ liên hệ với bạn để xác nhận thông tin và báo giá.
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên sản phẩm mong muốn"
                value={form.productName}
                onChange={handleChange("productName")}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả chi tiết"
                multiline
                rows={4}
                value={form.description}
                onChange={handleChange("description")}
                helperText="Mô tả chi tiết về sản phẩm bạn muốn, bao gồm màu sắc, kiểu dáng, kích thước, v.v."
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Loại hoa</InputLabel>
                <Select
                  value={form.category}
                  label="Loại hoa"
                  onChange={handleChange("category")}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ngân sách dự kiến (VNĐ)"
                type="number"
                value={form.budget}
                onChange={handleChange("budget")}
                helperText="Để trống nếu không xác định"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số lượng"
                type="number"
                value={form.quantity}
                onChange={handleChange("quantity")}
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ngày giao hàng mong muốn"
                type="date"
                value={form.deliveryDate}
                onChange={handleChange("deliveryDate")}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ghi chú bổ sung"
                multiline
                rows={2}
                value={form.additionalNotes}
                onChange={handleChange("additionalNotes")}
                helperText="Thông tin liên hệ, địa chỉ giao hàng, hoặc yêu cầu đặc biệt khác"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                variant="contained"
                type="submit"
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? "Đang gửi..." : "Gửi Yêu Cầu"}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate(-1)}
                sx={{ mt: 2, ml: 2 }}
              >
                Hủy
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrderRequest;