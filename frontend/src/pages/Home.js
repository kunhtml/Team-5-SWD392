import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Snackbar,
  Alert,
} from "@mui/material";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useDispatch } from "react-redux";
import { addToCart } from "../store/slices/cartSlice";

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await api.get("/products", {
          params: { limit: 5, is_featured: true },
        });
        setFeaturedProducts(response.data.products || []);
      } catch (error) {
        console.error("Error fetching featured products:", error);
        // Fallback to first 5 if featured not available
        try {
          const fallbackResponse = await api.get("/products", {
            params: { limit: 5 },
          });
          setFeaturedProducts(fallbackResponse.data.products || []);
        } catch (fallbackError) {
          console.error("Error fetching fallback products:", fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const handleAddToCart = (product) => {
    dispatch(
      addToCart({
        productId: product.id,
        quantity: 1,
        price: Number(product.price),
        name: product.name,
        shopId: product.shop?.id,
      })
    );
    setSnackbarMessage(`${product.name} đã được thêm vào giỏ hàng!`);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ textAlign: "center", mt: 4 }}>
      <Typography variant="h2" gutterBottom color="primary">
        Chào Mừng Đến Với FlowerShop 🌸
      </Typography>
      <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
        Nền tảng mua bán hoa tươi trực tuyến với đa dạng sản phẩm và dịch vụ
        chuyên nghiệp.
      </Typography>

      <Button
        variant="contained"
        size="large"
        component={Link}
        to="/products"
        sx={{ mb: 4 }}
      >
        Xem Sản Phẩm
      </Button>

      <Grid container spacing={3} justifyContent="center" sx={{ mt: 4 }}>
        <Grid item xs={12} md={4}>
          <Typography variant="h6">Khách Hàng</Typography>
          <Typography>Duyệt và mua hoa dễ dàng</Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="h6">Người Bán</Typography>
          <Typography>Quản lý cửa hàng và đơn hàng</Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="h6">Admin</Typography>
          <Typography>Quản lý hệ thống toàn diện</Typography>
        </Grid>
      </Grid>

      {/* New Featured Products Section */}
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" gutterBottom sx={{ textAlign: "center" }}>
          Sản Phẩm Nổi Bật
        </Typography>
        {loading ? (
          <Typography sx={{ textAlign: "center" }}>
            Đang tải sản phẩm...
          </Typography>
        ) : featuredProducts.length > 0 ? (
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {featuredProducts.slice(0, 5).map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={2.4} key={product.id}>
                <Card sx={{ height: "100%" }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.image_url || "/placeholder-flower.jpg"}
                    alt={product.name}
                  />
                  <CardContent>
                    <Typography
                      gutterBottom
                      variant="h6"
                      noWrap
                      component={Link}
                      to={`/products/${product.id}`}
                      sx={{
                        textDecoration: "none",
                        color: "inherit",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      {product.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {product.shop?.name}
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                      {parseFloat(product.price).toLocaleString("vi-VN", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      })}{" "}
                      VNĐ
                    </Typography>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      component={Link}
                      to={`/products/${product.id}`}
                      sx={{ mb: 1 }}
                    >
                      Xem Chi Tiết
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      onClick={() => handleAddToCart(product)}
                    >
                      Thêm Vào Giỏ
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography sx={{ textAlign: "center", color: "text.secondary" }}>
            Chưa có sản phẩm nổi bật. <Link to="/products">Xem tất cả</Link>
          </Typography>
        )}
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Button
            variant="contained"
            component={Link}
            to="/products"
            size="large"
          >
            Xem Tất Cả Sản Phẩm
          </Button>
        </Box>
      </Box>

      {/* Added Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Home;
