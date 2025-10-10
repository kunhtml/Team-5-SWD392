import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import logger from "../utils/logger";
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
  Chip,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  CircularProgress,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const SpecialOrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [selected, setSelected] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({
    productName: "",
    description: "",
    category: "",
    budget: "",
    quantity: 1,
    deliveryDate: "",
    shippingAddress: "",
    additionalNotes: "",
  });
  const [editLoading, setEditLoading] = useState(false);
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
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Log state changes
  useEffect(() => {
    logger.log("📊 [SpecialOrderHistory] State - orders count:", orders.length);
  }, [orders]);

  useEffect(() => {
    logger.log("⏳ [SpecialOrderHistory] State - loading:", loading);
  }, [loading]);

  useEffect(() => {
    logger.log("📄 [SpecialOrderHistory] State - page changed to:", page);
  }, [page]);

  useEffect(() => {
    logger.log("📋 [SpecialOrderHistory] State - total pages:", pages);
  }, [pages]);

  useEffect(() => {
    console.log(
      "🚀 [SpecialOrderHistory] Component mounted, fetching page:",
      page
    );
    fetchSpecialOrderHistory({ page });
  }, [page]);

  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const response = await api.get("/special-orders/categories", {
          params: { limit: 100 },
          skipErrorLogging: true,
        });
        const fetched = response.data?.categories ?? [];
        if (fetched.length > 0) {
          setCategories(
            fetched.map((category) => category.name).filter(Boolean)
          );
        }
      } catch (error) {
        console.error(
          "⚠️ [SpecialOrderHistory] Không thể tải danh mục:",
          error.response?.data || error.message
        );
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const fetchSpecialOrderHistory = async ({ page = 1 } = {}) => {
    try {
      console.log(
        "🔍 [SpecialOrderHistory] Starting to fetch data, page:",
        page
      );
      setLoading(true);

      const response = await api.get("/special-orders", {
        params: { page, limit: 10 },
      });

      console.log("📡 [SpecialOrderHistory] API Response:", response.data);
      console.log(
        "📊 [SpecialOrderHistory] Special Requests:",
        response.data.specialRequests
      );
      console.log("📄 [SpecialOrderHistory] Total pages:", response.data.pages);

      setOrders(response.data.specialRequests || []);
      setPages(response.data.pages || 1);

      console.log(
        "✅ [SpecialOrderHistory] Data successfully loaded:",
        response.data.specialRequests?.length || 0,
        "items"
      );
    } catch (error) {
      console.error(
        "❌ [SpecialOrderHistory] Error fetching special order history:",
        error
      );
      console.error("❌ [SpecialOrderHistory] Error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
    } finally {
      setLoading(false);
    }
  };

  const resetEditForm = () => {
    setEditForm({
      productName: "",
      description: "",
      category: "",
      budget: "",
      quantity: 1,
      deliveryDate: "",
      shippingAddress: "",
      additionalNotes: "",
    });
  };

  const openEditDialog = (order) => {
    logger.log(
      "✏️ [SpecialOrderHistory] Opening edit dialog for order:",
      order.id
    );
    setEditTarget(order);
    setEditForm({
      productName: order.product_name || "",
      description: order.description || "",
      category: order.category || "",
      budget:
        order.budget !== null && order.budget !== undefined
          ? String(order.budget)
          : "",
      quantity: order.quantity || 1,
      deliveryDate: order.delivery_date || "",
      shippingAddress: order.shipping_address || "",
      additionalNotes: order.additional_notes || "",
    });
  };

  const closeEditDialog = () => {
    logger.log("❌ [SpecialOrderHistory] Closing edit dialog");
    setEditTarget(null);
    resetEditForm();
  };

  const handleEditChange = (field) => (event) => {
    const value = event.target.value;
    const parsedValue =
      field === "quantity" ? Math.max(1, Number(value)) : value;
    setEditForm((prev) => ({ ...prev, [field]: parsedValue }));
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (!editTarget) return;

    setEditLoading(true);
    try {
      const payload = {
        product_name: editForm.productName.trim(),
        description: editForm.description.trim(),
        category: editForm.category || null,
        budget: editForm.budget !== "" ? Number(editForm.budget) : null,
        quantity: Number(editForm.quantity) || 1,
        delivery_date: editForm.deliveryDate || null,
        shipping_address: editForm.shippingAddress.trim(),
        additional_notes: editForm.additionalNotes.trim() || null,
      };

      const response = await api.put(
        `/special-orders/${editTarget.id}`,
        payload
      );
      const updatedOrder = response.data?.specialRequest || editTarget;

      setOrders((prev) =>
        prev.map((order) =>
          order.id === editTarget.id ? { ...order, ...updatedOrder } : order
        )
      );

      if (selected?.id === editTarget.id) {
        setSelected((prev) => (prev ? { ...prev, ...updatedOrder } : prev));
      }

      setNotification({
        open: true,
        message: response.data?.message || "Đã cập nhật đơn hàng thành công.",
        severity: "success",
      });
      closeEditDialog();
    } catch (error) {
      console.error("❌ [SpecialOrderHistory] Error updating order:", error);
      setNotification({
        open: true,
        message:
          error.response?.data?.message ||
          "Không thể cập nhật đơn hàng. Vui lòng thử lại.",
        severity: "error",
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handleNotificationClose = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  if (loading) {
    console.log("⏳ [SpecialOrderHistory] Loading...");
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  console.log("🎨 [SpecialOrderHistory] Rendering with orders:", orders.length);

  return (
    <Box sx={{ mt: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Đơn Hàng Đặc Biệt Đã Tạo</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate("/order-request")}
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
            },
          }}
        >
          Tạo Đơn Mới
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Khách Hàng</TableCell>
              <TableCell>Ngày Đặt</TableCell>
              <TableCell>Ngân Sách</TableCell>
              <TableCell>Trạng Thái</TableCell>
              <TableCell>Cửa Hàng</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.customer?.name}</TableCell>
                <TableCell>
                  {(() => {
                    const d = order.createdAt || order.created_at;
                    return d ? new Date(d).toLocaleDateString("vi-VN") : "-";
                  })()}
                </TableCell>
                <TableCell>
                  {order.budget
                    ? parseFloat(order.budget).toLocaleString("vi-VN", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      })
                    : "N/A"}{" "}
                  VNĐ
                </TableCell>
                <TableCell>
                  <Chip
                    label={order.status}
                    color={
                      order.status === "completed"
                        ? "success"
                        : order.status === "processing"
                        ? "primary"
                        : order.status === "pending"
                        ? "warning"
                        : "error"
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {order.assignedShop?.name || "Chưa phân công"}
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      logger.log(
                        "🔍 [SpecialOrderHistory] Opening details for order:",
                        order.id
                      );
                      setSelected(order);
                    }}
                  >
                    Chi Tiết
                  </Button>
                  {order.status === "pending" && (
                    <Button
                      size="small"
                      variant="contained"
                      sx={{ ml: 1 }}
                      onClick={() => openEditDialog(order)}
                    >
                      Chỉnh Sửa
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack alignItems="center" sx={{ mt: 2 }}>
        <Pagination
          count={pages}
          page={page}
          onChange={(_, p) => {
            logger.log(
              "📄 [SpecialOrderHistory] Pagination clicked, going to page:",
              p
            );
            setPage(p);
          }}
        />
      </Stack>

      {/* Order details dialog */}
      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chi tiết đơn đặc biệt #{selected?.id}</DialogTitle>
        <DialogContent dividers>
          {selected && (
            <Box>
              <Typography>Khách hàng: {selected.customer?.name}</Typography>
              <Typography>
                Ngân sách:{" "}
                {selected.budget
                  ? parseFloat(selected.budget).toLocaleString("vi-VN")
                  : "N/A"}{" "}
                VNĐ
              </Typography>
              <Typography>Trạng thái: {selected.status}</Typography>
              <Typography sx={{ mt: 2 }}>
                Địa chỉ: {selected.shipping_address}
              </Typography>
              <Typography sx={{ mt: 2 }}>Ghi chú thêm:</Typography>
              <Typography sx={{ mt: 1, fontStyle: "italic" }}>
                {selected.additional_notes || "Không có ghi chú thêm"}
              </Typography>
              <Typography sx={{ mt: 2 }}>Thông tin sản phẩm:</Typography>
              <ul>
                <li>Tên sản phẩm: {selected.product_name}</li>
                <li>Mô tả: {selected.description}</li>
                <li>Loại: {selected.category || "N/A"}</li>
                <li>Số lượng: {selected.quantity}</li>
                <li>
                  Ngày giao:{" "}
                  {selected.delivery_date
                    ? new Date(selected.delivery_date).toLocaleDateString(
                        "vi-VN"
                      )
                    : "N/A"}
                </li>
              </ul>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              logger.log("❌ [SpecialOrderHistory] Closing dialog");
              setSelected(null);
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!editTarget}
        onClose={editLoading ? undefined : closeEditDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Chỉnh sửa đơn đặc biệt #{editTarget?.id}</DialogTitle>
        <DialogContent dividers>
          <Box component="form" onSubmit={handleEditSubmit} sx={{ mt: 1 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tên sản phẩm mong muốn"
                  value={editForm.productName}
                  onChange={handleEditChange("productName")}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Mô tả chi tiết"
                  multiline
                  rows={4}
                  value={editForm.description}
                  onChange={handleEditChange("description")}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Loại hoa</InputLabel>
                  <Select
                    value={editForm.category}
                    label="Loại hoa"
                    onChange={handleEditChange("category")}
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
                  label="Ngân sách (VNĐ)"
                  type="number"
                  value={editForm.budget}
                  onChange={handleEditChange("budget")}
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Số lượng"
                  type="number"
                  value={editForm.quantity}
                  onChange={handleEditChange("quantity")}
                  inputProps={{ min: 1 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Ngày giao hàng mong muốn"
                  type="date"
                  value={editForm.deliveryDate || ""}
                  InputLabelProps={{ shrink: true }}
                  onChange={handleEditChange("deliveryDate")}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Địa chỉ nhận hàng"
                  multiline
                  rows={2}
                  value={editForm.shippingAddress}
                  onChange={handleEditChange("shippingAddress")}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Ghi chú bổ sung"
                  multiline
                  rows={2}
                  value={editForm.additionalNotes}
                  onChange={handleEditChange("additionalNotes")}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog} disabled={editLoading}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleEditSubmit}
            disabled={editLoading}
          >
            {editLoading ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleNotificationClose}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SpecialOrderHistory;
