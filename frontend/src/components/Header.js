import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Badge,
} from "@mui/material";
import { ShoppingCart, AccountCircle } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../store/slices/authSlice";

const Header = () => {
  const { user } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const totalCartItems = cartItems.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ flexGrow: 1, textDecoration: "none", color: "inherit" }}
        >
          🌸 FlowerShop
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button color="inherit" component={Link} to="/products">
            Sản Phẩm
          </Button>

          {user ? (
            <>
              <Badge
                badgeContent={totalCartItems}
                color="secondary"
                sx={{
                  "& .MuiBadge-badge": { right: -10, top: 10 },
                }}
              >
                <IconButton color="inherit" component={Link} to="/cart">
                  <ShoppingCart />
                </IconButton>
              </Badge>

              <Button color="inherit" component={Link} to="/wallet/balance">
                Ví
              </Button>

              <Button color="inherit" onClick={handleLogout}>
                Đăng Xuất ({user.role})
              </Button>

              {user.role === "admin" && (
                <Button color="inherit" component={Link} to="/admin">
                  Admin
                </Button>
              )}
              {user.role === "florist" && (
                <Button color="inherit" component={Link} to="/florist">
                  Cửa Hàng
                </Button>
              )}
              {user.role === "customer" && (
                <Button color="inherit" component={Link} to="/shop-request">
                  Mở Cửa Hàng
                </Button>
              )}
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Đăng Nhập
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Đăng Ký
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
