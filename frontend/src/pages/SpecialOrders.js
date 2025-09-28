import React, { useState, useEffect } from "react";
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

const SpecialOrders = () => {
  const [tabValue, setTabValue] = useState(0);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [processingRequests, setProcessingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingPages, setPendingPages] = useState(1);
  const [processingPage, setProcessingPage] = useState(1);
  const [processingPages, setProcessingPages] = useState(1);
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [shop, setShop] = useState(null);

  useEffect(() => {
    const fetchFloristShop = async () => {
      try {
        const response = await api.get("/shops/my-shop", {
          skipErrorLogging: true,
        });
        setShop(response.data.shop || null);
      } catch (error) {
        if (error.response?.status === 404) {
          setShop(null);
        } else {
          console.error("Error fetching florist shop:", error);
          setShop(null);
        }
      }
    };

    fetchFloristShop();
  }, []);

  useEffect(() => {
    fetchPendingRequests(pendingPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPage]);

  useEffect(() => {
    if (tabValue !== 1) return;
    fetchProcessingRequests(processingPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabValue, processingPage]);

  const fetchPendingRequests = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.get("/special-orders", {
        params: { page, limit: PAGE_SIZE, status: "pending" },
      });
      setPendingRequests(response.data.specialRequests || []);
      setPendingPages(Number(response.data.pages) || 1);
    } catch (error) {
      console.error("Error fetching pending special orders:", error);
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
      console.error("Error fetching accepted special orders:", error);
      setProcessingRequests([]);
      setProcessingPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_, newValue) => {
    setTabValue(newValue);
  };

  const handleUpdateStatus = async (request, newStatus) => {
    if (!request) return;

    if (newStatus === "processing" && !shop?.id) {
      alert("Không thể nhận yêu cầu vì chưa tìm thấy thông tin cửa hàng.");
      return;
    }

    try {
      setActionLoading(true);
      const payload = { status: newStatus };
      if (newStatus === "processing" && !request.assigned_shop_id && shop?.id) {
        payload.assigned_shop_id = shop.id;
      }

      await api.put(`/special-orders/${request.id}/status`, payload);

      if (tabValue === 0) {
        fetchPendingRequests(pendingPage);
      } else {
        fetchProcessingRequests(processingPage);
      }
      setSelected(null);
    } catch (error) {
      console.error("Error updating special order status:", error);
      alert("Có lỗi xảy ra khi cập nhật trạng thái yêu cầu đặc biệt.");
    } finally {
      setActionLoading(false);
    }
  };

  const renderActionButtons = (request, { size = "small" } = {}) => {
    if (!request) return null;

    const buttons = [];

    if (request.status === "pending") {
      buttons.push(
        <Button
          key="accept"
          size={size}
          color="primary"
          variant="contained"
          onClick={() => handleUpdateStatus(request, "processing")}
          disabled={actionLoading}
        >
          {actionLoading ? "Đang xử lý..." : "Nhận Làm"}
        </Button>
      );
    }

    if (request.status === "processing") {
      buttons.push(
        <Button
          key="complete"
          size={size}
          color="success"
          variant="contained"
          onClick={() => handleUpdateStatus(request, "completed")}
          disabled={actionLoading}
        >
          {actionLoading ? "Đang xử lý..." : "Hoàn Thành"}
        </Button>
      );
      buttons.push(
        <Button
          key="return"
          size={size}
          color="warning"
          variant="outlined"
          onClick={() => handleUpdateStatus(request, "pending")}
          disabled={actionLoading}
        >
          {actionLoading ? "Đang xử lý..." : "Trả Lại"}
        </Button>
      );
      buttons.push(
        <Button
          key="cancel"
          size={size}
          color="error"
          variant="outlined"
          onClick={() => handleUpdateStatus(request, "cancelled")}
          disabled={actionLoading}
        >
          {actionLoading ? "Đang xử lý..." : "Hủy"}
        </Button>
      );
    }

    return buttons;
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const currentRequests = tabValue === 0 ? pendingRequests : processingRequests;
  const currentPages = tabValue === 0 ? pendingPages : processingPages;
  const currentPage = tabValue === 0 ? pendingPage : processingPage;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Yêu Cầu Đơn Đặc Biệt
      </Typography>

      {!shop && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Không tìm thấy thông tin cửa hàng. Bạn vẫn có thể xem yêu cầu nhưng
          cần có cửa hàng để nhận xử lý.
        </Typography>
      )}

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Đơn Chờ Xử Lý" />
        <Tab label="Đơn Đã Nhận Làm" />
      </Tabs>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Sản phẩm mong muốn</TableCell>
              <TableCell>Khách hàng</TableCell>
              <TableCell>Danh mục</TableCell>
              <TableCell>Ngân sách</TableCell>
              <TableCell>Số lượng</TableCell>
              <TableCell>Ngày giao dự kiến</TableCell>
              <TableCell>Cửa hàng phụ trách</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentRequests.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  Chưa có yêu cầu nào.
                </TableCell>
              </TableRow>
            )}

            {currentRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.id}</TableCell>
                <TableCell>{request.product_name}</TableCell>
                <TableCell>{request.customer?.name || "N/A"}</TableCell>
                <TableCell>{request.category || "-"}</TableCell>
                <TableCell>{formatCurrency(request.budget)}</TableCell>
                <TableCell>{request.quantity || 1}</TableCell>
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
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setSelected(request)}
                    >
                      Chi tiết
                    </Button>
                    {renderActionButtons(request)}
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
            onChange={(_, p) =>
              tabValue === 0 ? setPendingPage(p) : setProcessingPage(p)
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
                Số điện thoại: {selected.customer?.phone || "Không có"}
              </Typography>

              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Chi tiết yêu cầu
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
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Đóng</Button>
          {renderActionButtons(selected, { size: "medium" })}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SpecialOrders;
