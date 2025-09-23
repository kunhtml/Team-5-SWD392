import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import api from "../services/api";
import { addToCart } from "../store/slices/cartSlice";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Button,
  Chip,
  Divider,
  IconButton,
  TextField,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${id}`);
      setProduct(response.data.product);
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const clampQuantity = (q) => {
    const max = Math.max(0, Number(product?.stock || 0));
    return Math.min(Math.max(1, q), max || 1);
  };

  const handleDecrement = () => {
    setQuantity((q) => clampQuantity(q - 1));
  };

  const handleIncrement = () => {
    setQuantity((q) => clampQuantity(q + 1));
  };

  const handleQtyInput = (e) => {
    const val = parseInt(e.target.value || "1", 10);
    setQuantity(clampQuantity(isNaN(val) ? 1 : val));
  };

  const handleAddToCart = () => {
    if (product) {
      dispatch(
        addToCart({
          productId: product.id,
          quantity: quantity,
          price: Number(product.price),
          name: product.name,
          shopId: product.shop?.id,
        })
      );
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (!product) return <Typography>Product not found</Typography>;

  return (
    <Box sx={{ mt: 4, display: "flex", gap: 4 }}>
      <Card sx={{ flex: 1 }}>
        <CardMedia
          component="img"
          height="400"
          image={product.image_url || "/placeholder-flower.jpg"}
          alt={product.name}
        />
      </Card>

      <Box sx={{ flex: 2 }}>
        <Typography variant="h4" gutterBottom>
          {product.name}
        </Typography>
        <Chip
          label={`Cửa hàng: ${product.shop?.name}`}
          color="primary"
          sx={{ mb: 2, cursor: product.shop?.id ? "pointer" : "default" }}
          onClick={() => {
            if (product.shop?.id) navigate(`/shops/${product.shop.id}`);
          }}
        />
        <Typography variant="h5" color="primary" gutterBottom>
          {parseFloat(product.price).toLocaleString("vi-VN", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })}{" "}
          VNĐ
        </Typography>
        <Typography variant="body1" gutterBottom>
          Danh mục: {product.category?.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Tồn kho: {product.stock} sản phẩm
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body1" sx={{ mb: 3 }}>
          {product.description}
        </Typography>
        {/* Quantity selector */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Typography>Số lượng:</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              size="small"
              onClick={handleDecrement}
              disabled={quantity <= 1}
            >
              <Remove />
            </IconButton>
            <TextField
              size="small"
              type="number"
              inputProps={{ min: 1, max: product.stock }}
              value={quantity}
              onChange={handleQtyInput}
              sx={{ width: 80 }}
            />
            <IconButton
              size="small"
              onClick={handleIncrement}
              disabled={product.stock === 0 || quantity >= product.stock}
            >
              <Add />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? "Hết Hàng" : "Thêm Vào Giỏ"}
          </Button>
          <Button variant="outlined" size="large">
            Mua Ngay
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ProductDetail;
