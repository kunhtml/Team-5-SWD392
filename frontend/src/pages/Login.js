import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { login, clearError } from "../store/slices/authSlice";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
} from "@mui/material";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(login(formData)).then((result) => {
      if (login.fulfilled.match(result)) {
        const role = result.payload?.user?.role;
        if (role === "florist") {
          navigate("/florist");
        } else if (role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }
    });
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Box sx={{ p: 4, boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom align="center">
          Đăng Nhập
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Mật Khẩu"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
          />
          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={isLoading}
            sx={{ mb: 2 }}
          >
            {isLoading ? "Đang Đăng Nhập..." : "Đăng Nhập"}
          </Button>
        </form>

        <Box sx={{ textAlign: "center" }}>
          <Link to="/register">Chưa có tài khoản? Đăng ký</Link>
        </Box>

        <Typography
          variant="body2"
          align="center"
          sx={{ mt: 2, color: "text.secondary" }}
        >
          Demo: newadmin@flowershop.com / admin456 (Admin)
        </Typography>
      </Box>
    </Container>
  );
};

export default Login;
