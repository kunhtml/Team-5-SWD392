import React, { useState, useEffect, useMemo } from "react";
import api from "../services/api";
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
  Tabs,
  Tab,
  Alert,
} from "@mui/material";

const STATUS_LABELS = {
  pending: "Chờ xử lý",
  processing: "Đang xử lý",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

const STATUS_COLORS = {
  pending: "warning",
  processing: "info",
  completed: "success",
  cancelled: "error",
};

const PAGE_SIZE = 10;

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "Chưa xác định";
  const number = Number(value);
  if (Number.isNaN(number)) return "Chưa xác định";
  return `${number.toLocaleString("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} VNĐ`;
};

const formatDate = (value) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleDateString("vi-VN");
  } catch {
    return value;
  }
};

const AdminSpecialOrders = () => {
  const [tabValue, setTabValue] = useState(0);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [processingRequests, setProcessingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingPages, setPendingPages] = useState(1);
  const [processingPage, setProcessingPage] = useState(1);
  const [processingPages, setProcessingPages] = useState(1);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchPendingRequests(pendingPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPage]);

  useEffect(() => {
    if (tabValue !== 1) return;
    fetchProcessingRequests(processingPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabValue, processingPage]);

  const withToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  const fetchPendingRequests = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.get("/special-orders", {
        params: { page, limit: PAGE_SIZE, status: "pending" },
      });
      setPendingRequests(response.data.specialRequests || []);
      setPendingPages(Number(response.data.pages) || 1);
    } catch (error) {
      console.error("Error fetching pending special orders (admin):", error);
      withToast("Không thể tải danh sách đơn chờ xử lý.", "error");
      setPendingRequests([]);
      setPendingPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchProcessingRequests = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.get("/special-orders", {
        params: { page, limit: PAGE_SIZE, status: "processing" },
      });
      setProcessingRequests(response.data.specialRequests || []);
      setProcessingPages(Number(response.data.pages) || 1);
    } catch (error) {
      console.error("Error fetching processing special orders (admin):", error);
      withToast("Không thể tải danh sách đơn đang xử lý.", "error");
      setProcessingRequests([]);
      setProcessingPages(1);
    } finally {
      setLoading(false);
    }
  };

  const currentRequests = useMemo(
    () => (tabValue === 0 ? pendingRequests : processingRequests),
    [tabValue, pendingRequests, processingRequests]
  );

  const currentPage = tabValue === 0 ? pendingPage : processingPage;
  const currentPages = tabValue === 0 ? pendingPages : processingPages;

  if (loading && currentRequests.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Quản Lý Đơn Đặc Biệt
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        Trang quản lý cho phép admin theo dõi và can thiệp vào tất cả yêu cầu
        đặt hàng đặc biệt của khách hàng.
      </Alert>

      <Tabs
        value={tabValue}
        onChange={(_, value) => setTabValue(value)}
        sx={{ mb: 2 }}
      >
        <Tab label="Đơn Chờ Xử Lý" />
        <Tab label="Đơn Đang Xử Lý" />
      </Tabs>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Khách hàng</TableCell>
              <TableCell>Sản phẩm mong muốn</TableCell>
              <TableCell>Danh mục</TableCell>
              <TableCell>Ngân sách</TableCell>
              <TableCell>Ngày giao dự kiến</TableCell>
              <TableCell>Cửa hàng phụ trách</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentRequests.length === 0 && (
              <TableRow>
                <TableCell align="center" colSpan={9}>
                  Chưa có yêu cầu nào trong danh sách này.
                </TableCell>
              </TableRow>
            )}

            {currentRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.id}</TableCell>
                <TableCell>{request.customer?.name || "-"}</TableCell>
                <TableCell>{request.product_name}</TableCell>
                <TableCell>{request.category || "-"}</TableCell>
                <TableCell>{formatCurrency(request.budget)}</TableCell>
                <TableCell>{formatDate(request.delivery_date)}</TableCell>
                <TableCell>
                  {request.assignedShop?.name || "Chưa phân công"}
                </TableCell>
                <TableCell>
                  <Chip
                    label={STATUS_LABELS[request.status] || request.status}
                    color={STATUS_COLORS[request.status] || "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setSelected(request)}
                    >
                      Chi tiết
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {currentPages > 1 && (
        <Stack alignItems="center" sx={{ mt: 2 }}>
          <Pagination
            count={currentPages}
            page={currentPage}
            onChange={(_, page) =>
              tabValue === 0 ? setPendingPage(page) : setProcessingPage(page)
            }
          />
        </Stack>
      )}

      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chi tiết yêu cầu #{selected?.id}</DialogTitle>
        <DialogContent dividers>
          {selected && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Typography variant="subtitle1">Thông tin khách hàng</Typography>
              <Typography>Họ tên: {selected.customer?.name || "-"}</Typography>
              <Typography>
                Email: {selected.customer?.email || "Không có"}
              </Typography>
              <Typography>
                Điện thoại: {selected.customer?.phone || "Không có"}
              </Typography>

              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Nội dung yêu cầu
              </Typography>
              <Typography>
                Sản phẩm mong muốn: {selected.product_name}
              </Typography>
              <Typography>Mô tả: {selected.description}</Typography>
              <Typography>Danh mục: {selected.category || "-"}</Typography>
              <Typography>
                Ngân sách: {formatCurrency(selected.budget)}
              </Typography>
              <Typography>Số lượng: {selected.quantity || 1}</Typography>
              <Typography>
                Ngày giao dự kiến: {formatDate(selected.delivery_date)}
              </Typography>
              <Typography>
                Địa chỉ giao hàng: {selected.shipping_address || "-"}
              </Typography>
              <Typography>
                Ghi chú thêm: {selected.additional_notes || "Không có"}
              </Typography>
              <Typography>
                Cửa hàng phụ trách:{" "}
                {selected.assignedShop?.name || "Chưa phân công"}
              </Typography>
              <Typography>
                Trạng thái hiện tại:{" "}
                {STATUS_LABELS[selected.status] || selected.status}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {toast.open && (
        <Alert
          severity={toast.severity}
          sx={{ position: "fixed", bottom: 20, right: 20, zIndex: 1300 }}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        >
          {toast.message}
        </Alert>
      )}
    </Box>
  );
};

export default AdminSpecialOrders;
