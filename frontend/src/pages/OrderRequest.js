import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Snackbar,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const OrderRequest = () => {
  const navigate = useNavigate();
  const initialFormState = {
    productName: "",
    description: "",
    category: "",
    budget: "",
    quantity: 1,
    deliveryDate: "",
    shippingAddress: "",
    additionalNotes: "",
  };

  const [form, setForm] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [categories, setCategories] = useState([
    "Hoa Sinh Nhật",
    "Hoa Cưới",
    "Hoa Tình Yêu",
    "Hoa Chia Buổi",
    "Hoa Khai Trương",
    "Hoa Tặng Mẹ",
    "Hoa Tặng Thầy Cô",
    "Hoa Sự Kiện",
    "Khác",
  ]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [walletError, setWalletError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const response = await api.get("/special-orders/categories", {
          params: { limit: 100 },
          skipErrorLogging: true,
        });
        const fetchedCategories = response.data?.categories ?? [];

        if (fetchedCategories.length > 0) {
          setCategories(
            fetchedCategories.map((category) => category.name).filter(Boolean)
          );
        }
      } catch (error) {
        console.error(
          "Không thể tải danh mục đặc biệt:",
          error.response?.data || error.message
        );
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    if (field === "quantity") {
      const numericValue = Number(value);
      const sanitizedQuantity = Number.isNaN(numericValue)
        ? 1
        : Math.max(1, Math.floor(numericValue));
      setForm((prev) => ({ ...prev, quantity: sanitizedQuantity }));
      return;
    }

    if (field === "budget") {
      if (value === "") {
        setForm((prev) => ({ ...prev, budget: "" }));
        return;
      }

      const numericBudget = Number(value);
      if (Number.isNaN(numericBudget) || numericBudget < 0) {
        setForm((prev) => ({ ...prev, budget: "" }));
        return;
      }

      const clampedBudget =
        walletBalance !== null
          ? Math.min(numericBudget, Number(walletBalance))
          : numericBudget;

      setForm((prev) => ({ ...prev, budget: String(clampedBudget) }));
      return;
    }

    setForm((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const fetchWalletBalance = async () => {
      setWalletLoading(true);
      setWalletError(null);
      try {
        const response = await api.get("/wallet/balance", {
          skipErrorLogging: true,
        });
        const balanceValue = Number(response.data?.balance ?? 0);
        setWalletBalance(balanceValue);
        setForm((prev) => ({
          ...prev,
          budget: balanceValue > 0 ? String(balanceValue) : "",
        }));
      } catch (error) {
        console.error(
          "⚠️ [OrderRequest] Không thể tải số dư ví:",
          error.response?.data || error.message
        );
        setWalletError(
          "Không thể lấy số dư ví. Vui lòng thử lại sau hoặc kiểm tra lại tài khoản của bạn."
        );
        setWalletBalance(0);
        setForm((prev) => ({ ...prev, budget: "" }));
      } finally {
        setWalletLoading(false);
      }
    };

    fetchWalletBalance();
  }, []);

  const walletHelperText = useMemo(() => {
    if (walletLoading) {
      return "Đang kiểm tra số dư ví...";
    }
    if (walletError) {
      return walletError;
    }
    const formattedBalance = Number(walletBalance || 0).toLocaleString("vi-VN");
    return walletBalance > 0
      ? `Số dư ví hiện tại: ${formattedBalance} VNĐ`
      : "Ví của bạn hiện chưa có số dư. Vui lòng nạp thêm tiền để tạo đơn.";
  }, [walletBalance, walletLoading, walletError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const budgetValue = form.budget !== "" ? Number(form.budget) : null;

      if (
        walletBalance !== null &&
        budgetValue !== null &&
        budgetValue > Number(walletBalance)
      ) {
        setNotification({
          open: true,
          message: "Ngân sách không được vượt quá số dư ví của bạn.",
          severity: "error",
        });
        setLoading(false);
        return;
      }

      if (walletBalance !== null && Number(walletBalance) <= 0) {
        setNotification({
          open: true,
          message:
            "Ví của bạn không đủ tiền để tạo đơn hàng đặc biệt. Vui lòng nạp thêm tiền.",
          severity: "error",
        });
        setLoading(false);
        return;
      }

      const payload = {
        product_name: form.productName.trim(),
        description: form.description.trim(),
        category: form.category || null,
        budget: budgetValue,
        quantity: Number(form.quantity) || 1,
        delivery_date: form.deliveryDate || null,
        shipping_address: form.shippingAddress.trim(),
        additional_notes: form.additionalNotes.trim() || null,
      };

      const response = await api.post("/special-orders", payload);

      setNotification({
        open: true,
        message:
          response.data?.message ||
          "Yêu cầu đặt hàng đã được gửi thành công! Chúng tôi sẽ liên hệ với bạn sớm.",
        severity: "success",
      });

      // Reset form
      setForm({ ...initialFormState });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.";
      setNotification({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
      if (!walletError && walletBalance !== null) {
        setForm((prev) => ({ ...prev, budget: String(walletBalance) }));
      }
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h4" gutterBottom>
          Yêu Cầu Đặt Hàng Đặc Biệt
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate("/special-order-history")}
          sx={{ height: "fit-content" }}
        >
          Đơn Đã Tạo
        </Button>
      </Box>

      <Paper sx={{ p: 4 }}>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Hãy mô tả chi tiết sản phẩm bạn muốn đặt hàng. Chúng tôi sẽ liên hệ
          với bạn để xác nhận thông tin và báo giá.
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên sản phẩm mong muốn"
                value={form.productName}
                onChange={handleChange("productName")}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả chi tiết"
                multiline
                rows={4}
                value={form.description}
                onChange={handleChange("description")}
                helperText="Mô tả chi tiết về sản phẩm bạn muốn, bao gồm màu sắc, kiểu dáng, kích thước, v.v."
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Loại hoa</InputLabel>
                <Select
                  value={form.category}
                  label="Loại hoa"
                  onChange={handleChange("category")}
                  MenuProps={{ PaperProps: { style: { maxHeight: 240 } } }}
                >
                  {categoriesLoading ? (
                    <MenuItem disabled>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <CircularProgress size={18} /> Đang tải danh mục...
                      </Box>
                    </MenuItem>
                  ) : (
                    categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))
                  )}
                  {!categoriesLoading && categories.length === 0 && (
                    <MenuItem disabled>Không có danh mục khả dụng</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ngân sách dự kiến (VNĐ)"
                type="number"
                value={form.budget}
                onChange={handleChange("budget")}
                disabled={walletLoading || Number(walletBalance) <= 0}
                InputProps={{
                  inputProps: {
                    min: 0,
                    max: walletBalance ?? undefined,
                    step: 1,
                  },
                }}
                helperText={walletHelperText}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số lượng"
                type="number"
                value={form.quantity}
                onChange={handleChange("quantity")}
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ngày giao hàng mong muốn"
                type="date"
                value={form.deliveryDate}
                onChange={handleChange("deliveryDate")}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Địa chỉ nhận hàng"
                multiline
                rows={2}
                value={form.shippingAddress}
                onChange={handleChange("shippingAddress")}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ghi chú bổ sung"
                multiline
                rows={2}
                value={form.additionalNotes}
                onChange={handleChange("additionalNotes")}
                helperText="Yêu cầu đặc biệt khác (nếu có)"
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                type="submit"
                disabled={
                  loading || walletLoading || Number(walletBalance) <= 0
                }
                sx={{ mt: 2 }}
              >
                {loading ? "Đang gửi..." : "Gửi Yêu Cầu"}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate(-1)}
                sx={{ mt: 2, ml: 2 }}
              >
                Hủy
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrderRequest;
