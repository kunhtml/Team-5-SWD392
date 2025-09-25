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
  TextField,
  Pagination,
  CircularProgress,
  Tabs,
  Tab,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const AdminSpecialOrders = () => {
  const [tabValue, setTabValue] = useState(0); // 0 for pending orders, 1 for accepted orders
  const [orders, setOrders] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [selected, setSelected] = useState(null);
  const [shipEdit, setShipEdit] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const navigate = useNavigate();

  useEffect(() => {
    if (tabValue === 0) {
      fetchSpecialOrders({ page });
    } else {
      fetchAcceptedOrders({ page });
    }
  }, [page, tabValue]);

  const fetchSpecialOrders = async ({ page = 1 } = {}) => {
    try {
      setLoading(true);
      // Only fetch pending orders for the "Đơn Chờ Xử Lý" tab
      const response = await api.get("/orders/special", {
        params: { page, limit: 10, status: "pending" },
      });
      setOrders(response.data.orders || []);
      setPages(response.data.pages || 1);
    } catch (error) {
      console.error("Error fetching special orders:", error);
      setToast({
        open: true,
        message: "Có lỗi xảy ra khi tải đơn chờ xử lý",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAcceptedOrders = async ({ page = 1 } = {}) => {
    try {
      setLoading(true);
      // Fetch orders with "processing" status (Đơn Đã Nhận Làm)
      const response = await api.get("/orders/special", {
        params: { page, limit: 10, status: "processing" },
      });
      setAcceptedOrders(response.data.orders || []);
      setPages(response.data.pages || 1);
    } catch (error) {
      console.error("Error fetching accepted orders:", error);
      setToast({
        open: true,
        message: "Có lỗi xảy ra khi tải đơn đã nhận làm",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setActionLoading(true);
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      
      // If order is completed, add amount to seller's wallet
      if (newStatus === "completed") {
        // Find the order to get its amount and shop_id
        let order;
        if (tabValue === 0) {
          order = orders.find(o => o.id === orderId);
        } else {
          order = acceptedOrders.find(o => o.id === orderId);
        }
        
        if (order) {
          // Get the florist's user ID from the order's shop information
          // The shop object now includes florist information with florist_id
          const floristId = order.shop?.florist_id || order.shop?.florist?.id;
          
          if (floristId) {
            try {
              // Add order amount to seller's wallet
              await api.post(`/wallet/${floristId}/deposit`, {
                amount: order.total_amount,
                description: `Thanh toán đơn hàng #${orderId}`
              });
            } catch (walletError) {
              console.error("Error depositing to wallet:", walletError);
              // Don't fail the whole operation if wallet deposit fails
              setToast({
                open: true,
                message: "Cập nhật trạng thái thành công nhưng có lỗi khi cộng tiền vào ví.",
                severity: "warning"
              });
            }
          } else {
            console.error("Could not find florist ID for order:", order);
            setToast({
              open: true,
              message: "Cập nhật trạng thái thành công nhưng không tìm thấy thông tin ví của người bán.",
              severity: "warning"
            });
          }
        }
      }
      
      // Refresh the appropriate data based on the active tab
      if (tabValue === 0) {
        fetchSpecialOrders({ page });
      } else {
        fetchAcceptedOrders({ page });
      }
      
      setSelected(null);
      setToast({
        open: true,
        message: "Cập nhật trạng thái đơn hàng thành công",
        severity: "success"
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      setToast({
        open: true,
        message: "Có lỗi xảy ra khi cập nhật trạng thái đơn hàng.",
        severity: "error"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "processing":
        return "primary";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ xử lý";
      case "processing":
        return "Đang xử lý";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Quản Lý Đơn Đặc Biệt
      </Typography>
      
      <Alert severity="info" sx={{ mb: 2 }}>
        Trang quản lý đơn đặc biệt cho admin - Theo dõi và quản lý tất cả các đơn hàng đặc biệt từ khách hàng
      </Alert>
      
      <Tabs 
        value={tabValue} 
        onChange={(e, newValue) => setTabValue(newValue)}
        sx={{ mb: 2 }}
      >
        <Tab label="Đơn Chờ Xử Lý" />
        <Tab label="Đơn Đã Nhận Làm" />
      </Tabs>

      {tabValue === 0 && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Khách Hàng</TableCell>
                  <TableCell>Ngày Đặt</TableCell>
                  <TableCell>Tổng Tiền</TableCell>
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
                      {parseFloat(order.total_amount).toLocaleString("vi-VN", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      })}{" "}
                      VNĐ
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(order.status)}
                        color={getStatusColor(order.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{order.shop?.name || "N/A"}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setSelected(order);
                            setShipEdit(order.shipping_address || "");
                          }}
                        >
                          Chi Tiết
                        </Button>
                        {order.status === "pending" && (
                          <Button
                            size="small"
                            color="primary"
                            variant="outlined"
                            onClick={() => handleUpdateStatus(order.id, "processing")}
                            disabled={actionLoading}
                          >
                            Nhận Làm
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Stack alignItems="center" sx={{ mt: 2 }}>
            <Pagination count={pages} page={page} onChange={(_, p) => setPage(p)} />
          </Stack>
        </>
      )}

      {tabValue === 1 && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Khách Hàng</TableCell>
                  <TableCell>Ngày Đặt</TableCell>
                  <TableCell>Tổng Tiền</TableCell>
                  <TableCell>Trạng Thái</TableCell>
                  <TableCell>Cửa Hàng</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {acceptedOrders.map((order) => (
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
                      {parseFloat(order.total_amount).toLocaleString("vi-VN", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      })}{" "}
                      VNĐ
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(order.status)}
                        color={getStatusColor(order.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{order.shop?.name || "N/A"}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setSelected(order);
                            setShipEdit(order.shipping_address || "");
                          }}
                        >
                          Chi Tiết
                        </Button>
                        {order.status === "processing" && (
                          <Button
                            size="small"
                            color="success"
                            variant="outlined"
                            onClick={() => handleUpdateStatus(order.id, "completed")}
                            disabled={actionLoading}
                          >
                            Hoàn Thành
                          </Button>
                        )}
                        {order.status === "processing" && (
                          <Button
                            size="small"
                            color="warning"
                            variant="outlined"
                            onClick={() => handleUpdateStatus(order.id, "pending")}
                            disabled={actionLoading}
                          >
                            Trả Lại
                          </Button>
                        )}
                        {order.status === "processing" && (
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            onClick={() => handleUpdateStatus(order.id, "cancelled")}
                            disabled={actionLoading}
                          >
                            Hủy
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Stack alignItems="center" sx={{ mt: 2 }}>
            <Pagination count={pages} page={page} onChange={(_, p) => setPage(p)} />
          </Stack>
        </>
      )}

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
                Tổng tiền:{" "}
                {parseFloat(selected.total_amount).toLocaleString("vi-VN")} VNĐ
              </Typography>
              <Typography>Trạng thái: {getStatusText(selected.status)}</Typography>
              {selected.status === "pending" ||
              selected.status === "processing" ? (
                <Box sx={{ mt: 2 }}>
                  <TextField
                    label="Địa chỉ giao hàng"
                    fullWidth
                    multiline
                    minRows={2}
                    value={shipEdit}
                    onChange={(e) => setShipEdit(e.target.value)}
                  />
                </Box>
              ) : (
                <Typography sx={{ mt: 2 }}>
                  Địa chỉ: {selected.shipping_address}
                </Typography>
              )}
              <Typography sx={{ mt: 2 }}>Yêu cầu đặc biệt:</Typography>
              <Typography sx={{ mt: 1, fontStyle: 'italic' }}>
                {selected.special_request || "Không có yêu cầu đặc biệt"}
              </Typography>
              <Typography sx={{ mt: 2 }}>Sản phẩm:</Typography>
              <ul>
                {(selected.items || []).map((it) => (
                  <li key={it.id}>
                    {it.product?.name} x{it.quantity} —{" "}
                    {parseFloat(it.price).toLocaleString("vi-VN")} VNĐ
                  </li>
                ))}
              </ul>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Đóng</Button>
          {selected &&
            (selected.status === "pending" ||
              selected.status === "processing") && (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleUpdateStatus(selected.id, "processing")}
                  disabled={actionLoading}
                >
                  {actionLoading ? <CircularProgress size={24} /> : "Xử Lý"}
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleUpdateStatus(selected.id, "cancelled")}
                  disabled={actionLoading}
                >
                  {actionLoading ? <CircularProgress size={24} /> : "Hủy"}
                </Button>
              </>
            )}
          {selected && selected.status === "processing" && (
            <Button
              variant="contained"
              color="success"
              onClick={() => handleUpdateStatus(selected.id, "completed")}
              disabled={actionLoading}
            >
              {actionLoading ? <CircularProgress size={24} /> : "Hoàn Thành"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
      
      {/* Toast Notification */}
      {toast.open && (
        <Alert 
          severity={toast.severity} 
          sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}
          onClose={() => setToast({ ...toast, open: false })}
        >
          {toast.message}
        </Alert>
      )}
    </Box>
  );
};

export default AdminSpecialOrders;