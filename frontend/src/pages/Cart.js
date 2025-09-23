import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  removeFromCart,
  updateQuantity,
  clearCart,
} from "../store/slices/cartSlice"; // Added clearCart import
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  TextField,
} from "@mui/material"; // Added TextField import
import { Delete, Add, Remove } from "@mui/icons-material";
import api from "../services/api";

const Cart = () => {
  const { items, total } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const [shippingAddress, setShippingAddress] = React.useState("");

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity > 0) {
      dispatch(updateQuantity({ productId, quantity: newQuantity }));
    }
  };

  const handleRemove = (productId) => {
    dispatch(removeFromCart(productId));
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;

    try {
      // Assume all items from same shop for simplicity
      const shopId = items[0].shopId || 1; // Placeholder
      const orderData = {
        items: items.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
          shop_id: shopId,
        })),
        shipping_address: shippingAddress,
        payment_method: "wallet", // Default
      };

      const response = await api.post("/orders", orderData);
      dispatch(clearCart()); // Clear cart after order
      alert("Đặt hàng thành công!");
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Lỗi đặt hàng: " + error.response?.data?.message);
    }
  };

  if (items.length === 0) {
    return (
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="h6">Giỏ Hàng Trống</Typography>
        <Button variant="outlined" href="/products">
          Tiếp Tục Mua Sắm
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Giỏ Hàng
      </Typography>

      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sản Phẩm</TableCell>
              <TableCell>Số Lượng</TableCell>
              <TableCell>Giá</TableCell>
              <TableCell>Tổng</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.productId}>
                <TableCell>
                  {item.name || `Sản phẩm ${item.productId}`}
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() =>
                      handleQuantityChange(item.productId, item.quantity - 1)
                    }
                  >
                    <Remove />
                  </IconButton>
                  {item.quantity}
                  <IconButton
                    onClick={() =>
                      handleQuantityChange(item.productId, item.quantity + 1)
                    }
                  >
                    <Add />
                  </IconButton>
                </TableCell>
                <TableCell>
                  {Number(item.price || 0).toLocaleString("vi-VN", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}{" "}
                  VNĐ
                </TableCell>
                <TableCell>
                  {Number((item.price || 0) * item.quantity).toLocaleString(
                    "vi-VN",
                    {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    }
                  )}{" "}
                  VNĐ
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleRemove(item.productId)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <TextField
          label="Địa Chỉ Giao Hàng"
          value={shippingAddress}
          onChange={(e) => setShippingAddress(e.target.value)}
          fullWidth
          sx={{ maxWidth: 400 }}
        />
        <Typography variant="h6">
          Tổng:{" "}
          {parseFloat(total).toLocaleString("vi-VN", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })}{" "}
          VNĐ
        </Typography>
      </Box>

      <Button
        variant="contained"
        size="large"
        onClick={handleCheckout}
        disabled={items.length === 0 || !shippingAddress}
      >
        Đặt Hàng
      </Button>
    </Box>
  );
};

export default Cart;
