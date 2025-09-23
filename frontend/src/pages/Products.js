import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
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
} from "@mui/material";
import { addToCart } from "../store/slices/cartSlice";
import { useDispatch } from "react-redux";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Added state for snackbar
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Added message state
  const dispatch = useDispatch();

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
    setSnackbarMessage(`${product.name} đã được thêm vào giỏ hàng!`); // Set message
    setSnackbarOpen(true); // Open snackbar
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
                <Typography variant="body2" color="text.secondary">
                  {product.description?.substring(0, 100)}...
                </Typography>
                <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                  {parseFloat(product.price).toLocaleString("vi-VN", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}{" "}
                  VNĐ
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Cửa hàng: {product.shop?.name}
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => handleAddToCart(product)}
                  sx={{ mt: 2 }}
                >
                  Thêm Vào Giỏ
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
