import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Snackbar, Alert } from "@mui/material"; // Added Snackbar and Alert imports
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
} from "@mui/material";
import { Add, Remove, ShoppingCart } from "@mui/icons-material";
import { addToCart } from "../store/slices/cartSlice";
import { useDispatch } from "react-redux";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Added state for snackbar
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Added message state
  const [quantities, setQuantities] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
    ); // Set message
    setSnackbarOpen(true); // Open snackbar
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

  if (loading) {
    return <Box>Loading products...</Box>;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Sản Phẩm Hoa Tươi
      </Typography>

      {/* Filters */}
      <Box sx={{ mb: 4, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <TextField
          label="Tìm kiếm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
        />
        <FormControl size="small">
          <InputLabel>Danh Mục</InputLabel>
          <Select
            value={category}
            label="Danh Mục"
            onChange={(e) => setCategory(e.target.value)}
          >
            <MenuItem value="">Tất Cả</MenuItem>
            <MenuItem value="1">Hoa Sinh Nhật</MenuItem>
            <MenuItem value="2">Hoa Cưới</MenuItem>
            <MenuItem value="3">Hoa Tình Yêu</MenuItem>
          </Select>
        </FormControl>
        <Button variant="outlined" onClick={fetchProducts}>
          Lọc
        </Button>
      </Box>

      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                },
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={product.image_url || "/placeholder-flower.jpg"}
                alt={product.name}
                sx={{
                  transition: "transform 0.3s ease",
                  "&:hover": { transform: "scale(1.02)" },
                }}
              />
              <CardContent
                sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
              >
                <Typography
                  gutterBottom
                  variant="h6"
                  component={Link}
                  to={`/products/${product.id}`}
                  sx={{
                    textDecoration: "none",
                    color: "inherit",
                    fontWeight: 600,
                    "&:hover": {
                      textDecoration: "underline",
                      color: "primary.main",
                    },
                  }}
                >
                  {product.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1, flexGrow: 1 }}
                >
                  {product.description?.substring(0, 100)}...
                </Typography>
                <Typography
                  variant="h5"
                  color="primary"
                  sx={{ mb: 1, fontWeight: 700 }}
                >
                  {parseFloat(product.price).toLocaleString("vi-VN", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}{" "}
                  ₫
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Cửa hàng: {product.shop?.name}
                </Typography>

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
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
                >
                  <Typography variant="body2" sx={{ minWidth: 60 }}>
                    Số lượng:
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleQuantityChange(product.id, -1)}
                      disabled={getQuantity(product.id) <= 1}
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        width: 32,
                        height: 32,
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
                        style: {
                          textAlign: "center",
                          padding: "8px",
                          width: "50px",
                        },
                      }}
                      value={getQuantity(product.id)}
                      onChange={(e) =>
                        handleQuantityInput(product.id, e.target.value)
                      }
                      sx={{
                        width: 70,
                        "& .MuiOutlinedInput-root": {
                          height: 32,
                        },
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleQuantityChange(product.id, 1)}
                      disabled={
                        (product?.stock || 0) === 0 ||
                        getQuantity(product.id) >= (product?.stock || 1)
                      }
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        width: 32,
                        height: 32,
                      }}
                    >
                      <Add fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                {/* Buttons */}
                <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                  <Button
                    variant="outlined"
                    component={Link}
                    to={`/products/${product.id}`}
                    sx={{
                      flex: 1,
                      py: 1,
                      fontWeight: 600,
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
                    startIcon={<ShoppingCart />}
                    disabled={(product?.stock || 0) === 0}
                    sx={{
                      flex: 2,
                      py: 1,
                      fontWeight: 600,
                      "&:hover": {
                        transform: "translateY(-1px)",
                      },
                      "&:disabled": {
                        bgcolor: "grey.300",
                        color: "grey.600",
                      },
                    }}
                  >
                    {(product?.stock || 0) === 0 ? "Hết Hàng" : "Thêm Vào Giỏ"}
                  </Button>
                </Box>

                {/* Buy Now Button */}
                <Button
                  variant="outlined"
                  onClick={() => handleBuyNow(product)}
                  fullWidth
                  disabled={(product?.stock || 0) === 0}
                  sx={{
                    py: 1.2,
                    fontWeight: 600,
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
                  {(product?.stock || 0) === 0 ? "Hết Hàng" : "Mua Ngay"}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

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

export default Products;
