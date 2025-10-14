import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  removeFromCart,
  updateQuantity,
  clearCart,
} from "../store/slices/cartSlice";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  TextField,
  Divider,
  Container,
  Grid,
  Paper,
  Fade,
  Slide,
  Badge,
  Chip,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Delete,
  Add,
  Remove,
  ShoppingBag,
  LocalShipping,
  Payment,
  ArrowBack,
  ShoppingCart,
} from "@mui/icons-material";
import api from "../services/api";

const Cart = () => {
  const { items, total } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [shippingAddress, setShippingAddress] = useState("");
  const [note, setNote] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity > 0 && newQuantity <= 99) {
      dispatch(updateQuantity({ productId, quantity: newQuantity }));
      setSnackbar({
        open: true,
        message: "Đã cập nhật số lượng",
        severity: "success",
      });
    }
  };

  const handleRemove = (productId) => {
    dispatch(removeFromCart(productId));
    setSnackbar({
      open: true,
      message: "Đã xóa sản phẩm khỏi giỏ hàng",
      severity: "info",
    });
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    if (!shippingAddress.trim()) {
      setSnackbar({
        open: true,
        message: "Vui lòng nhập địa chỉ giao hàng",
        severity: "warning",
      });
      return;
    }

    try {
      const shopId = items[0].shopId || 1;
      const orderData = {
        items: items.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
          shop_id: shopId,
        })),
        shipping_address: shippingAddress,
        note: note,
        payment_method: "wallet",
      };

      const response = await api.post("/orders", orderData);
      dispatch(clearCart());
      setSnackbar({
        open: true,
        message: "🎉 Đặt hàng thành công!",
        severity: "success",
      });

      setTimeout(() => {
        navigate("/orders");
      }, 2000);
    } catch (error) {
      console.error("Error placing order:", error);
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message || "Lỗi đặt hàng. Vui lòng thử lại!",
        severity: "error",
      });
    }
  };

  const shippingFee = 30000; // 30,000 VND
  const finalTotal = total + shippingFee;

  if (items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
        <Fade in={true} timeout={800}>
          <Paper
            elevation={0}
            sx={{
              p: 8,
              textAlign: "center",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              borderRadius: 4,
            }}
          >
            <ShoppingCart sx={{ fontSize: 100, mb: 3, opacity: 0.8 }} />
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Giỏ Hàng Trống
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
              Hãy thêm một số sản phẩm hoa tuyệt đẹp vào giỏ hàng của bạn!
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<ShoppingBag />}
              onClick={() => navigate("/products")}
              sx={{
                bgcolor: "white",
                color: "#667eea",
                fontWeight: "bold",
                px: 4,
                py: 1.5,
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.9)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
                },
                transition: "all 0.3s",
              }}
            >
              Khám Phá Sản Phẩm
            </Button>
          </Paper>
        </Fade>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/products")}
            sx={{ mb: 2, color: "text.secondary" }}
          >
            Tiếp tục mua sắm
          </Button>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <ShoppingCart sx={{ fontSize: 40, color: "#667eea" }} />
            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Giỏ Hàng Của Bạn
            </Typography>
            <Chip
              label={`${items.length} sản phẩm`}
              color="primary"
              sx={{ fontWeight: "bold" }}
            />
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Cart Items */}
          <Grid item xs={12} md={8}>
            {items.map((item, index) => (
              <Slide
                key={item.productId}
                direction="right"
                in={true}
                timeout={300 + index * 100}
              >
                <Card
                  sx={{
                    mb: 2,
                    display: "flex",
                    transition: "all 0.3s",
                    "&:hover": {
                      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    sx={{
                      width: 180,
                      height: 180,
                      objectFit: "cover",
                    }}
                    image={item.image || "https://via.placeholder.com/180"}
                    alt={item.name}
                  />
                  <Box
                    sx={{ display: "flex", flexDirection: "column", flex: 1 }}
                  >
                    <CardContent sx={{ flex: 1 }}>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        gutterBottom
                        sx={{ color: "#667eea" }}
                      >
                        {item.name || `Sản phẩm ${item.productId}`}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {item.description || "Hoa tươi chất lượng cao"}
                      </Typography>

                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        {/* Quantity Control */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            border: "2px solid #667eea",
                            borderRadius: 2,
                            overflow: "hidden",
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleQuantityChange(
                                item.productId,
                                item.quantity - 1
                              )
                            }
                            sx={{
                              color: "#667eea",
                              "&:hover": {
                                bgcolor: "rgba(102, 126, 234, 0.1)",
                              },
                            }}
                          >
                            <Remove />
                          </IconButton>
                          <Typography
                            sx={{
                              px: 2,
                              py: 0.5,
                              minWidth: 40,
                              textAlign: "center",
                              fontWeight: "bold",
                              color: "#667eea",
                            }}
                          >
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleQuantityChange(
                                item.productId,
                                item.quantity + 1
                              )
                            }
                            sx={{
                              color: "#667eea",
                              "&:hover": {
                                bgcolor: "rgba(102, 126, 234, 0.1)",
                              },
                            }}
                          >
                            <Add />
                          </IconButton>
                        </Box>

                        {/* Price */}
                        <Box sx={{ flex: 1, textAlign: "right" }}>
                          <Typography variant="body2" color="text.secondary">
                            Đơn giá
                          </Typography>
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            color="error"
                          >
                            {Number(item.price || 0).toLocaleString("vi-VN")} ₫
                          </Typography>
                        </Box>

                        {/* Subtotal */}
                        <Box sx={{ textAlign: "right", minWidth: 120 }}>
                          <Typography variant="body2" color="text.secondary">
                            Tổng
                          </Typography>
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            sx={{ color: "#667eea" }}
                          >
                            {Number(
                              (item.price || 0) * item.quantity
                            ).toLocaleString("vi-VN")}{" "}
                            ₫
                          </Typography>
                        </Box>

                        {/* Delete Button */}
                        <IconButton
                          onClick={() => handleRemove(item.productId)}
                          sx={{
                            color: "error.main",
                            "&:hover": {
                              bgcolor: "error.light",
                              color: "white",
                            },
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Box>
                </Card>
              </Slide>
            ))}
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} md={4}>
            <Fade in={true} timeout={800}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  position: "sticky",
                  top: 80,
                  borderRadius: 3,
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
                }}
              >
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Tóm Tắt Đơn Hàng
                </Typography>
                <Divider sx={{ my: 2 }} />

                {/* Shipping Address */}
                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <LocalShipping sx={{ color: "#667eea" }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      Địa Chỉ Giao Hàng
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Nhập địa chỉ của bạn..."
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": { borderColor: "#667eea" },
                        "&.Mui-focused fieldset": { borderColor: "#667eea" },
                      },
                    }}
                  />
                </Box>

                {/* Note */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    Ghi Chú
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Ghi chú cho người bán..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": { borderColor: "#667eea" },
                        "&.Mui-focused fieldset": { borderColor: "#667eea" },
                      },
                    }}
                  />
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Price Breakdown */}
                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography>Tạm tính ({items.length} sản phẩm)</Typography>
                    <Typography fontWeight="bold">
                      {parseFloat(total).toLocaleString("vi-VN")} ₫
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography>Phí vận chuyển</Typography>
                    <Typography fontWeight="bold" color="success.main">
                      {shippingFee.toLocaleString("vi-VN")} ₫
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Total */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 3,
                    p: 2,
                    bgcolor: "rgba(102, 126, 234, 0.1)",
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    Tổng Cộng
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{ color: "#667eea" }}
                  >
                    {finalTotal.toLocaleString("vi-VN")} ₫
                  </Typography>
                </Box>

                {/* Checkout Button */}
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<Payment />}
                  onClick={handleCheckout}
                  disabled={items.length === 0 || !shippingAddress.trim()}
                  sx={{
                    py: 1.5,
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 16px rgba(102, 126, 234, 0.4)",
                    },
                    "&:disabled": {
                      background: "#ccc",
                    },
                    transition: "all 0.3s",
                  }}
                >
                  Đặt Hàng Ngay
                </Button>

                {/* Security Badge */}
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: "rgba(76, 175, 80, 0.1)",
                    borderRadius: 2,
                    textAlign: "center",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="success.main"
                    fontWeight="bold"
                  >
                    🔒 Thanh toán an toàn & bảo mật
                  </Typography>
                </Box>
              </Paper>
            </Fade>
          </Grid>
        </Grid>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Cart;
