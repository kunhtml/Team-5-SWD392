import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { uploadImageToFreeImage } from "../utils/uploadImage";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  Stack,
  Container,
  Fade,
  Alert,
  Card,
  CardContent,
  Divider,
  Grid,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StorefrontIcon from "@mui/icons-material/Storefront";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ImageIcon from "@mui/icons-material/Image";

const FloristShopEdit = () => {
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    image_url: "",
  });

  useEffect(() => {
    fetchShopData();
  }, []);

  const fetchShopData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/shops/my-shop");
      const shopData = res.data.shop;

      // Handle case when florist doesn't have a shop yet
      if (!shopData) {
        setShop(null);
        setErrorMessage(
          "Bạn chưa có cửa hàng. Vui lòng liên hệ admin để được phê duyệt."
        );
        return;
      }

      setShop(shopData);
      setForm({
        name: shopData.name || "",
        description: shopData.description || "",
        address: shopData.address || "",
        phone: shopData.phone || "",
        email: shopData.email || "",
        image_url: shopData.image_url || "",
      });
    } catch (error) {
      console.error("Error fetching shop:", error);
      setErrorMessage("Không thể tải thông tin cửa hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setErrorMessage("");
    try {
      const url = await uploadImageToFreeImage(file);
      setForm((prev) => ({ ...prev, image_url: url }));
      setSuccessMessage("Tải ảnh lên thành công!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Upload ảnh thất bại:", err);
      setErrorMessage("Không thể tải ảnh lên. Vui lòng thử lại.");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setErrorMessage("Tên cửa hàng là bắt buộc");
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await api.put("/shops/my-shop", form);
      setSuccessMessage("Cập nhật thông tin cửa hàng thành công!");

      // Reload shop data
      await fetchShopData();

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/florist");
      }, 2000);
    } catch (err) {
      console.error("Cập nhật thất bại:", err);
      setErrorMessage(
        err.response?.data?.message ||
          "Không thể cập nhật thông tin. Vui lòng thử lại."
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

  // Show message if no shop exists
  if (!shop) {
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
          <Container maxWidth="md">
            <Fade in timeout={800}>
              <Box>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate("/florist")}
                  sx={{
                    color: "white",
                    mb: 2,
                    "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                  }}
                >
                  Quay lại Dashboard
                </Button>
                <Typography variant="h3" fontWeight={800} gutterBottom>
                  <StorefrontIcon
                    sx={{ fontSize: 40, mr: 2, verticalAlign: "middle" }}
                  />
                  Chỉnh Sửa Thông Tin Shop
                </Typography>
              </Box>
            </Fade>
          </Container>
        </Box>

        <Container maxWidth="md">
          <Alert severity="warning" sx={{ mb: 3 }}>
            {errorMessage || "Bạn chưa có cửa hàng"}
          </Alert>

          <Paper elevation={2} sx={{ p: 4, textAlign: "center" }}>
            <StorefrontIcon sx={{ fontSize: 80, color: "grey.400", mb: 2 }} />
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Chưa có cửa hàng
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Bạn cần có cửa hàng được phê duyệt để sử dụng tính năng này.
              <br />
              Vui lòng liên hệ admin hoặc tạo yêu cầu mở shop.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/florist")}
              sx={{
                background: "linear-gradient(45deg, #667eea, #764ba2)",
                "&:hover": {
                  background: "linear-gradient(45deg, #5a67d8, #6b5b95)",
                },
              }}
            >
              Quay lại Dashboard
            </Button>
          </Paper>
        </Container>
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
        <Container maxWidth="md">
          <Fade in timeout={800}>
            <Box>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate("/florist")}
                sx={{
                  color: "white",
                  mb: 2,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                Quay lại Dashboard
              </Button>
              <Typography variant="h3" fontWeight={800} gutterBottom>
                <StorefrontIcon
                  sx={{ fontSize: 40, mr: 2, verticalAlign: "middle" }}
                />
                Chỉnh Sửa Thông Tin Shop
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Cập nhật thông tin cửa hàng của bạn
              </Typography>
            </Box>
          </Fade>
        </Container>
      </Box>

      <Container maxWidth="md">
        {/* Success/Error Messages */}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Shop Preview Card */}
          <Grid item xs={12} md={4}>
            <Card elevation={2} sx={{ position: "sticky", top: 20 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Xem Trước
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ textAlign: "center" }}>
                  <Avatar
                    src={form.image_url || undefined}
                    alt={form.name}
                    sx={{
                      width: 120,
                      height: 120,
                      mx: "auto",
                      mb: 2,
                      border: "4px solid",
                      borderColor: "primary.main",
                    }}
                  >
                    {(form.name || "?").charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="h6" fontWeight={700}>
                    {form.name || "Tên cửa hàng"}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    {form.description || "Mô tả cửa hàng"}
                  </Typography>
                  {form.phone && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      📞 {form.phone}
                    </Typography>
                  )}
                  {form.email && (
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      📧 {form.email}
                    </Typography>
                  )}
                  {form.address && (
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      📍 {form.address}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Edit Form */}
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 4 }}>
              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  {/* Shop Name */}
                  <TextField
                    label="Tên cửa hàng"
                    value={form.name}
                    onChange={handleInputChange("name")}
                    required
                    fullWidth
                    placeholder="Ví dụ: Hoa Tươi Xinh"
                    helperText="Tên hiển thị của cửa hàng (bắt buộc)"
                  />

                  {/* Description */}
                  <TextField
                    label="Mô tả"
                    value={form.description}
                    onChange={handleInputChange("description")}
                    multiline
                    rows={4}
                    fullWidth
                    placeholder="Giới thiệu ngắn gọn về cửa hàng của bạn..."
                    helperText="Mô tả chi tiết về sản phẩm và dịch vụ"
                  />

                  {/* Address */}
                  <TextField
                    label="Địa chỉ"
                    value={form.address}
                    onChange={handleInputChange("address")}
                    fullWidth
                    placeholder="Số nhà, đường, phường, quận, thành phố"
                    helperText="Địa chỉ cửa hàng của bạn"
                  />

                  {/* Phone */}
                  <TextField
                    label="Số điện thoại"
                    value={form.phone}
                    onChange={handleInputChange("phone")}
                    fullWidth
                    placeholder="0123456789"
                    helperText="Số điện thoại liên hệ"
                  />

                  {/* Email */}
                  <TextField
                    label="Email"
                    value={form.email}
                    onChange={handleInputChange("email")}
                    type="email"
                    fullWidth
                    placeholder="shop@example.com"
                    helperText="Email liên hệ cho khách hàng"
                  />

                  {/* Image Upload */}
                  <Box>
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      gutterBottom
                    >
                      Logo/Ảnh đại diện cửa hàng
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <input
                        id="shop-image-upload"
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleImageUpload}
                      />
                      <label htmlFor="shop-image-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<ImageIcon />}
                          disabled={uploadingImage}
                        >
                          Chọn ảnh
                        </Button>
                      </label>
                      {uploadingImage && <CircularProgress size={24} />}
                      {!uploadingImage && form.image_url && (
                        <CheckCircleIcon color="success" />
                      )}
                    </Box>
                    {form.image_url && (
                      <Box sx={{ mt: 2 }}>
                        <Avatar
                          src={form.image_url}
                          alt="Preview"
                          sx={{ width: 80, height: 80 }}
                        />
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "block",
                            mt: 1,
                            wordBreak: "break-all",
                          }}
                        >
                          {form.image_url}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Divider />

                  {/* Action Buttons */}
                  <Box
                    sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}
                  >
                    <Button
                      variant="outlined"
                      onClick={() => navigate("/florist")}
                      disabled={saving}
                    >
                      Hủy
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={
                        saving ? <CircularProgress size={20} /> : <SaveIcon />
                      }
                      disabled={saving || uploadingImage}
                      sx={{
                        minWidth: 150,
                        background: "linear-gradient(45deg, #667eea, #764ba2)",
                        "&:hover": {
                          background:
                            "linear-gradient(45deg, #5a67d8, #6b5b95)",
                        },
                      }}
                    >
                      {saving ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                  </Box>
                </Stack>
              </form>
            </Paper>
          </Grid>
        </Grid>

        {/* Additional Info */}
        <Paper elevation={1} sx={{ p: 3, mt: 4, bgcolor: "info.50" }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            💡 Lưu ý
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Thông tin cửa hàng sẽ được hiển thị công khai cho khách hàng
            <br />
            • Logo/ảnh đại diện nên có kích thước vuông (tỷ lệ 1:1) để hiển thị
            tốt nhất
            <br />
            • Mô tả chi tiết giúp khách hàng hiểu rõ hơn về sản phẩm và dịch vụ
            của bạn
            <br />• Cập nhật thông tin liên hệ chính xác để khách hàng dễ dàng
            liên lạc
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default FloristShopEdit;
