import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { 
  Snackbar, 
  Alert,
  Container,
  Chip,
  Fade,
  Zoom,
  Skeleton,
  Badge,
  Tooltip,
} from "@mui/material";
import api from "../services/api";
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  InputAdornment,
  Paper,
} from "@mui/material";
import { 
  Add, 
  Remove, 
  ShoppingCart,
  Search,
  FilterList,
  LocalOffer,
  Store,
  Inventory,
  FavoriteBorder,
  Favorite,
} from "@mui/icons-material";
import { addToCart } from "../store/slices/cartSlice";
import { useDispatch } from "react-redux";
import Chatbot from "../components/Chatbot";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [quantities, setQuantities] = useState({});
  const [favorites, setFavorites] = useState({});
  const [adminNotification, setAdminNotification] = useState({
    open: false,
    message: "",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    fetchProducts();
  }, [search, category]);

  const fetchProducts = async () => {
    try {
      const params = { search, category_id: category || undefined };
      const response = await api.get("/products", { params });
      setProducts(response.data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const getQuantity = (productId) => {
    return quantities[productId] || 1;
  };

  const setQuantity = (productId, quantity) => {
    const product = products.find((p) => p.id === productId);
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

  // Check if user is admin
  const isAdmin = user && user.role === "admin";

  const toggleFavorite = (productId) => {
    setFavorites(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const handleAddToCart = (product) => {
    // Check if user is admin
    if (isAdmin) {
      setAdminNotification({
        open: true,
        message:
          "Chức năng không cho phép sử dụng khi bạn đang đăng nhập bằng tài khoản quản trị viên",
      });
      return;
    }

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
    ); // Set message
    setSnackbarOpen(true); // Open snackbar
  };

  const handleBuyNow = (product) => {
    // Check if user is admin
    if (isAdmin) {
      setAdminNotification({
        open: true,
        message:
          "Chức năng không cho phép sử dụng khi bạn đang đăng nhập bằng tài khoản quản trị viên",
      });
      return;
    }

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

  // Close admin notification handler
  const handleCloseAdminNotification = () => {
    setAdminNotification({ ...adminNotification, open: false });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Grid item xs={12} sm={6} md={4} key={n}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={40} />
                  <Skeleton variant="text" />
                  <Skeleton variant="text" width="60%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh", pb: 6 }}>
      <Container maxWidth="lg" sx={{ pt: 4 }}>
        {/* Header with gradient */}
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            p: 4,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            borderRadius: 3,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.1)",
            }}
          />
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Store sx={{ fontSize: 48 }} />
              <Box>
                <Typography variant="h3" fontWeight="bold">
                  Cửa Hàng Hoa Tươi
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Tươi mới mỗi ngày • Giao hàng nhanh chóng
                </Typography>
              </Box>
            </Box>
            
            {/* Stats */}
            <Box sx={{ display: "flex", gap: 3, mt: 3 }}>
              <Chip
                icon={<Inventory />}
                label={`${products.length} sản phẩm`}
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  py: 2.5,
                }}
              />
              <Chip
                icon={<ShoppingCart />}
                label={`${totalCartItems} trong giỏ`}
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  py: 2.5,
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.3)",
                  },
                }}
                onClick={() => navigate("/cart")}
              />
            </Box>
          </Box>
        </Paper>

        {/* Filters */}
        <Paper
          elevation={2}
          sx={{
            mb: 4,
            p: 3,
            borderRadius: 3,
            background: "white",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <FilterList sx={{ color: "#667eea" }} />
            <Typography variant="h6" fontWeight="bold">
              Bộ Lọc Tìm Kiếm
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm sản phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: "#667eea" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "&:hover fieldset": { borderColor: "#667eea" },
                    "&.Mui-focused fieldset": { borderColor: "#667eea" },
                  },
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Danh Mục</InputLabel>
                <Select
                  value={category}
                  label="Danh Mục"
                  onChange={(e) => setCategory(e.target.value)}
                  sx={{
                    borderRadius: 2,
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#667eea",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#667eea",
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>Tất Cả</em>
                  </MenuItem>
                  <MenuItem value="1">🎂 Hoa Sinh Nhật</MenuItem>
                  <MenuItem value="2">💐 Hoa Cưới</MenuItem>
                  <MenuItem value="3">❤️ Hoa Tình Yêu</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={fetchProducts}
                sx={{
                  height: "56px",
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  "&:hover": {
                    background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 16px rgba(102, 126, 234, 0.4)",
                  },
                  transition: "all 0.3s",
                }}
              >
                Lọc
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Products Grid */}
        {products.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 8,
              textAlign: "center",
              borderRadius: 3,
            }}
          >
            <Inventory sx={{ fontSize: 80, color: "#ccc", mb: 2 }} />
            <Typography variant="h5" color="text.secondary">
              Không tìm thấy sản phẩm
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {products.map((product, index) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Zoom in={true} timeout={300 + index * 100}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 3,
                      transition: "all 0.3s ease",
                      position: "relative",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
                      },
                    }}
                  >
                    {/* Favorite Button */}
                    <IconButton
                      onClick={() => toggleFavorite(product.id)}
                      sx={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        bgcolor: "white",
                        zIndex: 2,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        "&:hover": {
                          bgcolor: "white",
                          transform: "scale(1.1)",
                        },
                      }}
                    >
                      {favorites[product.id] ? (
                        <Favorite sx={{ color: "#e91e63" }} />
                      ) : (
                        <FavoriteBorder sx={{ color: "#999" }} />
                      )}
                    </IconButton>

                    {/* Stock Badge */}
                    {(product?.stock || 0) <= 5 && (product?.stock || 0) > 0 && (
                      <Chip
                        label={`Chỉ còn ${product.stock}`}
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 12,
                          left: 12,
                          zIndex: 2,
                          bgcolor: "#ff9800",
                          color: "white",
                          fontWeight: "bold",
                        }}
                      />
                    )}

                    {(product?.stock || 0) === 0 && (
                      <Chip
                        label="Hết hàng"
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 12,
                          left: 12,
                          zIndex: 2,
                          bgcolor: "#f44336",
                          color: "white",
                          fontWeight: "bold",
                        }}
                      />
                    )}

                    <Box
                      sx={{
                        position: "relative",
                        paddingTop: "75%",
                        overflow: "hidden",
                        bgcolor: "#f5f5f5",
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={product.image_url || "/placeholder-flower.jpg"}
                        alt={product.name}
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.5s ease",
                          "&:hover": { transform: "scale(1.1)" },
                        }}
                      />
                    </Box>

                    <CardContent
                      sx={{
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                        p: 2.5,
                      }}
                    >
                      <Typography
                        gutterBottom
                        variant="h6"
                        component={Link}
                        to={`/products/${product.id}`}
                        sx={{
                          textDecoration: "none",
                          color: "#333",
                          fontWeight: 700,
                          fontSize: "1.1rem",
                          mb: 1,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          "&:hover": {
                            color: "#667eea",
                          },
                          transition: "color 0.3s",
                        }}
                      >
                        {product.name}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          minHeight: 40,
                        }}
                      >
                        {product.description || "Hoa tươi chất lượng cao"}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 2,
                        }}
                      >
                        <LocalOffer sx={{ fontSize: 20, color: "#667eea" }} />
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 800,
                            background:
                              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }}
                        >
                          {parseFloat(product.price).toLocaleString("vi-VN")} ₫
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 2,
                          p: 1,
                          bgcolor: "#f8f9ff",
                          borderRadius: 2,
                        }}
                      >
                        <Store sx={{ fontSize: 18, color: "#667eea" }} />
                        <Typography variant="caption" fontWeight="600">
                          {product.shop?.name || "Cửa hàng"}
                        </Typography>
                      </Box>

                      {/* Quantity Selector */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 2,
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body2" fontWeight="600">
                          Số lượng:
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            border: "2px solid #667eea",
                            borderRadius: 2,
                            overflow: "hidden",
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(product.id, -1)}
                            disabled={getQuantity(product.id) <= 1}
                            sx={{
                              borderRadius: 0,
                              color: "#667eea",
                              "&:hover": { bgcolor: "rgba(102, 126, 234, 0.1)" },
                            }}
                          >
                            <Remove fontSize="small" />
                          </IconButton>
                          <Typography
                            sx={{
                              px: 2,
                              fontWeight: "bold",
                              color: "#667eea",
                              minWidth: 30,
                              textAlign: "center",
                            }}
                          >
                            {getQuantity(product.id)}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(product.id, 1)}
                            disabled={
                              (product?.stock || 0) === 0 ||
                              getQuantity(product.id) >= (product?.stock || 1)
                            }
                            sx={{
                              borderRadius: 0,
                              color: "#667eea",
                              "&:hover": { bgcolor: "rgba(102, 126, 234, 0.1)" },
                            }}
                          >
                            <Add fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>

                      {/* Buttons */}
                      <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                        <Tooltip title="Xem chi tiết">
                          <Button
                            variant="outlined"
                            component={Link}
                            to={`/products/${product.id}`}
                            fullWidth
                            sx={{
                              borderRadius: 2,
                              borderWidth: 2,
                              fontWeight: "bold",
                              borderColor: "#667eea",
                              color: "#667eea",
                              "&:hover": {
                                borderWidth: 2,
                                borderColor: "#667eea",
                                bgcolor: "rgba(102, 126, 234, 0.05)",
                              },
                            }}
                          >
                            Chi Tiết
                          </Button>
                        </Tooltip>
                      </Box>

                      <Button
                        variant="contained"
                        onClick={() => handleAddToCart(product)}
                        startIcon={<ShoppingCart />}
                        disabled={(product?.stock || 0) === 0 || isAdmin}
                        fullWidth
                        sx={{
                          mb: 1,
                          py: 1.2,
                          borderRadius: 2,
                          fontWeight: "bold",
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          "&:hover": {
                            background:
                              "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                            transform: "translateY(-2px)",
                            boxShadow: "0 6px 20px rgba(102, 126, 234, 0.4)",
                          },
                          "&:disabled": {
                            background: "#ccc",
                            color: "#888",
                          },
                          transition: "all 0.3s",
                        }}
                      >
                        {(product?.stock || 0) === 0
                          ? "Hết Hàng"
                          : "Thêm Vào Giỏ"}
                      </Button>

                      <Button
                        variant="outlined"
                        onClick={() => handleBuyNow(product)}
                        fullWidth
                        disabled={(product?.stock || 0) === 0 || isAdmin}
                        sx={{
                          py: 1.2,
                          borderRadius: 2,
                          fontWeight: "bold",
                          borderWidth: 2,
                          borderColor: "#764ba2",
                          color: "#764ba2",
                          "&:hover": {
                            borderWidth: 2,
                            borderColor: "#764ba2",
                            bgcolor: "#764ba2",
                            color: "white",
                            transform: "translateY(-2px)",
                            boxShadow: "0 6px 20px rgba(118, 75, 162, 0.4)",
                          },
                          "&:disabled": {
                            borderColor: "#ccc",
                            color: "#888",
                          },
                          transition: "all 0.3s",
                        }}
                      >
                        {(product?.stock || 0) === 0 ? "Hết Hàng" : "Mua Ngay"}
                      </Button>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Floating Cart Button */}
      <Zoom in={totalCartItems > 0}>
        <Tooltip title="Xem giỏ hàng">
          <Box
            onClick={() => navigate("/cart")}
            sx={{
              position: "fixed",
              bottom: 32,
              right: 32,
              bgcolor: "white",
              borderRadius: "50%",
              width: 72,
              height: 72,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(102, 126, 234, 0.4)",
              background:
                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              transition: "all 0.3s",
              zIndex: 1000,
              "&:hover": {
                transform: "scale(1.1) rotate(10deg)",
                boxShadow: "0 12px 32px rgba(102, 126, 234, 0.5)",
              },
            }}
          >
            <Badge
              badgeContent={totalCartItems}
              color="error"
              sx={{
                "& .MuiBadge-badge": {
                  bgcolor: "#ff1744",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  minWidth: 24,
                  height: 24,
                },
              }}
            >
              <ShoppingCart sx={{ fontSize: 32 }} />
            </Badge>
          </Box>
        </Tooltip>
      </Zoom>

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

      {/* Admin restriction notification */}
      <Snackbar
        open={adminNotification.open}
        autoHideDuration={6000}
        onClose={handleCloseAdminNotification}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseAdminNotification}
          severity="warning"
          sx={{ width: "100%" }}
        >
          {adminNotification.message}
        </Alert>
      </Snackbar>
      <Chatbot />
    </Box>
  );
};

export default Products;
