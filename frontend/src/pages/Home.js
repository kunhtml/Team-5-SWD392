import React, { useState, useEffect } from "react";
import LazyWelcome from "../components/LazyWelcome";
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
  Container,
  Paper,
  Chip,
  Fade,
  Grow,
  Avatar,
  IconButton,
  TextField,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StoreIcon from "@mui/icons-material/Store";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import FavoriteIcon from "@mui/icons-material/Favorite";
import StarIcon from "@mui/icons-material/Star";
import { Add, Remove } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useDispatch } from "react-redux";
import { addToCart } from "../store/slices/cartSlice";
import Chatbot from "../components/Chatbot";

const Home = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [quantities, setQuantities] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  const getQuantity = (productId) => {
    return quantities[productId] || 1;
  };

  const setQuantity = (productId, quantity) => {
    const product = featuredProducts.find((p) => p.id === productId);
    const maxStock = Math.max(0, Number(product?.stock || 1));
    const clampedQuantity = Math.min(Math.max(1, quantity), maxStock || 1);

    setQuantities((prev) => ({
      ...prev,
      [productId]: clampedQuantity,
    }));
  };

  const handleQuantityChange = (productId, delta) => {
    const currentQuantity = getQuantity(productId);
    setQuantity(productId, currentQuantity + delta);
  };

  const handleQuantityInput = (productId, value) => {
    const quantity = parseInt(value || "1", 10);
    setQuantity(productId, isNaN(quantity) ? 1 : quantity);
  };

  const handleAddToCart = (product) => {
    const quantity = getQuantity(product.id);
    dispatch(
      addToCart({
        productId: product.id,
        quantity: quantity,
        price: Number(product.price),
        name: product.name,
        shopId: product.shop?.id,
      })
    );
    setSnackbarMessage(
      `${product.name} (${quantity}) đã được thêm vào giỏ hàng!`
    );
    setSnackbarOpen(true);
  };

  const handleBuyNow = (product) => {
    const quantity = getQuantity(product.id);
    dispatch(
      addToCart({
        productId: product.id,
        quantity: quantity,
        price: Number(product.price),
        name: product.name,
        shopId: product.shop?.id,
      })
    );
    navigate("/cart");
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleWelcomeProceed = () => {
    setShowWelcome(false);
  };

  if (showWelcome) {
    return <LazyWelcome onProceed={handleWelcomeProceed} />;
  }

  return (
    <Box sx={{ mt: 2 }}>
      {/* Hero Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          backgroundImage: `url('/images/16240.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          color: "white",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.3)",
            zIndex: 1,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
          <Fade in timeout={1500}>
            <Box sx={{ textAlign: "center" }}>
              <Chip
                label="🌸 FlowerShop Premium"
                sx={{
                  mb: 3,
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontWeight: 600,
                  fontSize: "1rem",
                }}
              />
              <Typography
                variant="h1"
                fontWeight={900}
                gutterBottom
                sx={{
                  fontSize: { xs: "3rem", md: "4.5rem" },
                  lineHeight: 1.1,
                  mb: 3,
                }}
              >
                Chào Mừng Đến Với FlowerShop
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  mb: 4,
                  opacity: 0.95,
                  fontWeight: 300,
                  maxWidth: 800,
                  mx: "auto",
                }}
              >
                Nền tảng mua bán hoa tươi trực tuyến hàng đầu Việt Nam với đa
                dạng sản phẩm và dịch vụ chuyên nghiệp.
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: 3,
                  justifyContent: "center",
                  flexWrap: "wrap",
                  mb: 6,
                }}
              >
                <Button
                  variant="contained"
                  size="large"
                  component={Link}
                  to="/products"
                  startIcon={<LocalFloristIcon />}
                  sx={{
                    bgcolor: "white",
                    color: "primary.main",
                    px: 4,
                    py: 1.5,
                    fontWeight: 700,
                    borderRadius: 3,
                    fontSize: "1.1rem",
                    "&:hover": {
                      bgcolor: "grey.100",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
                    },
                  }}
                >
                  Khám Phá Sản Phẩm
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  component={Link}
                  to="/about"
                  sx={{
                    borderColor: "white",
                    color: "white",
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    borderRadius: 3,
                    fontSize: "1.1rem",
                    borderWidth: 2,
                    "&:hover": {
                      borderColor: "white",
                      bgcolor: "rgba(255,255,255,0.1)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  Tìm Hiểu Thêm
                </Button>
              </Box>

              {/* Stats */}
              <Grid container spacing={4} justifyContent="center">
                <Grid item xs={6} sm={3}>
                  <Box>
                    <Typography variant="h3" fontWeight={800}>
                      5000+
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Khách hàng
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box>
                    <Typography variant="h3" fontWeight={800}>
                      50+
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Loại hoa
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box>
                    <Typography variant="h3" fontWeight={800}>
                      10+
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Năm kinh nghiệm
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box>
                    <Typography variant="h3" fontWeight={800}>
                      24/7
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Hỗ trợ
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 8, bgcolor: "grey.50" }}>
        <Container maxWidth="lg">
          <Fade in timeout={1000}>
            <Box sx={{ textAlign: "center", mb: 6 }}>
              <Typography
                variant="h3"
                fontWeight={800}
                gutterBottom
                sx={{
                  background: "linear-gradient(45deg, #667eea, #764ba2)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  mb: 2,
                }}
              >
                Dành Cho Mọi Đối Tượng
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: 600, mx: "auto" }}
              >
                FlowerShop phục vụ đa dạng nhu cầu từ khách hàng đến doanh
                nghiệp
              </Typography>
            </Box>
          </Fade>

          <Grid container spacing={4}>
            {[
              {
                icon: (
                  <ShoppingCartIcon
                    fontSize="large"
                    sx={{ color: "primary.main" }}
                  />
                ),
                title: "Khách Hàng",
                desc: "Duyệt và mua hoa dễ dàng với giao diện thân thiện, thanh toán an toàn",
                color: "primary.main",
              },
              {
                icon: (
                  <StoreIcon fontSize="large" sx={{ color: "success.main" }} />
                ),
                title: "Người Bán",
                desc: "Quản lý cửa hàng, sản phẩm và đơn hàng một cách hiệu quả nhất",
                color: "success.main",
              },
              {
                icon: (
                  <AdminPanelSettingsIcon
                    fontSize="large"
                    sx={{ color: "warning.main" }}
                  />
                ),
                title: "Quản Trị Viên",
                desc: "Quản lý hệ thống toàn diện với dashboard thông minh và báo cáo chi tiết",
                color: "warning.main",
              },
            ].map((feature, idx) => (
              <Grid item xs={12} md={4} key={idx}>
                <Grow in timeout={1000 + idx * 300}>
                  <Card
                    elevation={0}
                    sx={{
                      height: "100%",
                      p: 4,
                      textAlign: "center",
                      background:
                        "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 4,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 16px 40px rgba(0,0,0,0.1)",
                        borderColor: feature.color,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        mb: 3,
                        p: 2,
                        borderRadius: "50%",
                        bgcolor: "background.paper",
                        display: "inline-flex",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" fontWeight={700} gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ lineHeight: 1.6 }}
                    >
                      {feature.desc}
                    </Typography>
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Featured Products Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Fade in timeout={1200}>
            <Box sx={{ textAlign: "center", mb: 6 }}>
              <Typography
                variant="h3"
                fontWeight={800}
                gutterBottom
                sx={{
                  background: "linear-gradient(45deg, #667eea, #764ba2)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  mb: 2,
                }}
              >
                Sản Phẩm Nổi Bật
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: 600, mx: "auto" }}
              >
                Khám phá những bó hoa tươi đẹp nhất được khách hàng yêu thích
              </Typography>
            </Box>
          </Fade>

          {loading ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                Đang tải sản phẩm...
              </Typography>
            </Box>
          ) : featuredProducts.length > 0 ? (
            <Grid container spacing={4}>
              {featuredProducts.slice(0, 6).map((product, idx) => (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
                  <Grow in timeout={800 + idx * 200}>
                    <Card
                      elevation={0}
                      sx={{
                        height: "100%",
                        borderRadius: 4,
                        border: "1px solid",
                        borderColor: "divider",
                        overflow: "hidden",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-8px)",
                          boxShadow: "0 16px 40px rgba(0,0,0,0.15)",
                          borderColor: "primary.main",
                        },
                      }}
                    >
                      <Box sx={{ position: "relative", overflow: "hidden" }}>
                        <CardMedia
                          component="img"
                          height="240"
                          image={product.image_url || "/placeholder-flower.jpg"}
                          alt={product.name}
                          sx={{
                            transition: "transform 0.3s ease",
                            "&:hover": { transform: "scale(1.05)" },
                          }}
                        />
                        <Chip
                          label="Nổi bật"
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 12,
                            right: 12,
                            bgcolor: "primary.main",
                            color: "white",
                            fontWeight: 600,
                          }}
                        />
                      </Box>

                      <CardContent sx={{ p: 3 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <FavoriteIcon
                            sx={{ color: "error.main", fontSize: "1rem" }}
                          />
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            {[...Array(5)].map((_, i) => (
                              <StarIcon
                                key={i}
                                sx={{ color: "warning.main", fontSize: "1rem" }}
                              />
                            ))}
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ ml: 0.5 }}
                            >
                              (4.8)
                            </Typography>
                          </Box>
                        </Box>

                        <Typography
                          variant="h6"
                          fontWeight={700}
                          gutterBottom
                          sx={{ mb: 1 }}
                          component={Link}
                          to={`/products/${product.id}`}
                          color="inherit"
                          style={{ textDecoration: "none" }}
                        >
                          {product.name}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1, fontWeight: 500 }}
                        >
                          {product.shop?.name}
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 2,
                          }}
                        >
                          <Typography
                            variant="h5"
                            color="primary"
                            fontWeight={800}
                          >
                            {parseFloat(product.price).toLocaleString("vi-VN", {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
                            })}{" "}
                            ₫
                          </Typography>
                          <Chip
                            label="Miễn phí ship"
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        </Box>

                        {/* Stock Information */}
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2 }}
                        >
                          Tồn kho: {product?.stock || 0} sản phẩm
                        </Typography>

                        {/* Quantity Selector */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 2,
                          }}
                        >
                          <Typography variant="body2" sx={{ minWidth: 60 }}>
                            Số lượng:
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleQuantityChange(product.id, -1)
                              }
                              disabled={getQuantity(product.id) <= 1}
                              sx={{
                                border: "1px solid",
                                borderColor: "divider",
                                width: 28,
                                height: 28,
                              }}
                            >
                              <Remove fontSize="small" />
                            </IconButton>
                            <TextField
                              size="small"
                              type="number"
                              inputProps={{
                                min: 1,
                                max: product?.stock || 1,
                                style: { textAlign: "center", padding: "6px" },
                              }}
                              value={getQuantity(product.id)}
                              onChange={(e) =>
                                handleQuantityInput(product.id, e.target.value)
                              }
                              sx={{
                                width: 60,
                                "& .MuiOutlinedInput-root": {
                                  height: 28,
                                },
                              }}
                            />
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleQuantityChange(product.id, 1)
                              }
                              disabled={
                                (product?.stock || 0) === 0 ||
                                getQuantity(product.id) >= (product?.stock || 1)
                              }
                              sx={{
                                border: "1px solid",
                                borderColor: "divider",
                                width: 28,
                                height: 28,
                              }}
                            >
                              <Add fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>

                        <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                          <Button
                            variant="outlined"
                            component={Link}
                            to={`/products/${product.id}`}
                            sx={{
                              flex: 1,
                              py: 1,
                              fontWeight: 600,
                              borderRadius: 2,
                              fontSize: "0.8rem",
                              "&:hover": {
                                transform: "translateY(-1px)",
                              },
                            }}
                          >
                            Chi Tiết
                          </Button>
                          <Button
                            variant="contained"
                            onClick={() => handleAddToCart(product)}
                            startIcon={<ShoppingCartIcon />}
                            disabled={(product?.stock || 0) === 0}
                            sx={{
                              flex: 2,
                              py: 1,
                              fontWeight: 600,
                              borderRadius: 2,
                              fontSize: "0.8rem",
                              background:
                                "linear-gradient(45deg, #667eea, #764ba2)",
                              "&:hover": {
                                background:
                                  "linear-gradient(45deg, #5a67d8, #6b5b95)",
                                transform: "translateY(-1px)",
                                boxShadow:
                                  "0 4px 12px rgba(102, 126, 234, 0.4)",
                              },
                              "&:disabled": {
                                background: "grey.300",
                                color: "grey.600",
                              },
                            }}
                          >
                            {(product?.stock || 0) === 0
                              ? "Hết Hàng"
                              : "Thêm Vào Giỏ"}
                          </Button>
                        </Box>

                        {/* Buy Now Button */}
                        <Button
                          variant="outlined"
                          onClick={() => handleBuyNow(product)}
                          fullWidth
                          disabled={(product?.stock || 0) === 0}
                          sx={{
                            py: 1,
                            fontWeight: 600,
                            borderRadius: 2,
                            borderColor: "primary.main",
                            color: "primary.main",
                            borderWidth: 2,
                            "&:hover": {
                              borderWidth: 2,
                              borderColor: "primary.dark",
                              bgcolor: "primary.main",
                              color: "white",
                              transform: "translateY(-1px)",
                            },
                            "&:disabled": {
                              borderColor: "grey.300",
                              color: "grey.600",
                            },
                          }}
                        >
                          {(product?.stock || 0) === 0
                            ? "Hết Hàng"
                            : "Mua Ngay"}
                        </Button>
                      </CardContent>
                    </Card>
                  </Grow>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                Chưa có sản phẩm nổi bật
              </Typography>
              <Button
                variant="contained"
                component={Link}
                to="/products"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  borderRadius: 3,
                  background: "linear-gradient(45deg, #667eea, #764ba2)",
                }}
              >
                Khám Phá Sản Phẩm
              </Button>
            </Box>
          )}

          {featuredProducts.length > 0 && (
            <Fade in timeout={1500}>
              <Box sx={{ textAlign: "center", mt: 6 }}>
                <Button
                  variant="outlined"
                  size="large"
                  component={Link}
                  to="/products"
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    borderRadius: 3,
                    borderWidth: 2,
                    "&:hover": {
                      borderWidth: 2,
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  Xem Tất Cả Sản Phẩm
                </Button>
              </Box>
            </Fade>
          )}
        </Container>
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
      <Chatbot />
    </Box>
  );
};

export default Home;
