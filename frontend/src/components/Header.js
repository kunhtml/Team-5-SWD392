import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Divider,
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
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

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
          <Button color="inherit" component={Link} to="/about">
            Về chúng tôi
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

              <Button
                color="inherit"
                startIcon={<AccountCircle />}
                onClick={handleMenuOpen}
                aria-controls={open ? "user-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
              >
                {user.name || user.email}
              </Button>

              <Menu
                id="user-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                {user.role !== "florist" && user.role !== "admin" && (
                  <MenuItem
                    component={Link}
                    to="/orders"
                    onClick={handleMenuClose}
                  >
                    Đơn hàng của tôi
                  </MenuItem>
                )}
                {user.role !== "florist" && user.role !== "admin" && (
                  <MenuItem
                    component={Link}
                    to="/wallet/balance"
                    onClick={handleMenuClose}
                  >
                    Ví
                  </MenuItem>
                )}
                {user.role === "admin" && (
                  <MenuItem
                    component={Link}
                    to="/admin"
                    onClick={handleMenuClose}
                  >
                    Admin
                  </MenuItem>
                )}
                {user.role === "florist" && (
                  <MenuItem
                    component={Link}
                    to="/florist"
                    onClick={handleMenuClose}
                  >
                    Cửa hàng của tôi
                  </MenuItem>
                )}
                {user.role === "customer" && (
                  <MenuItem
                    component={Link}
                    to="/shop-request"
                    onClick={handleMenuClose}
                  >
                    Mở cửa hàng
                  </MenuItem>
                )}
                <Divider />
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    handleLogout();
                  }}
                >
                  Đăng xuất
                </MenuItem>
              </Menu>
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
