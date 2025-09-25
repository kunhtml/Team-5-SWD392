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
  MenuItem,
  Pagination,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";

const SpecialOrders = () => {
  const [tabValue, setTabValue] = useState(0); // 0 for pending orders, 1 for accepted orders
  const [orders, setOrders] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [selected, setSelected] = useState(null);
  const [shipEdit, setShipEdit] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

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
          // Add order amount to seller's wallet
          await api.post(`/wallets/${order.shop_id}/deposit`, {
            amount: order.total_amount,
            description: `Thanh toán đơn hàng #${orderId}`
          });
        }
      }
      
      // Refresh the appropriate data based on the active tab
      if (tabValue === 0) {
        fetchSpecialOrders({ page });
      } else {
        fetchAcceptedOrders({ page });
      }
      setSelected(null);
    } catch (error) {
      console.error("Error updating order status:", error);
      // Show error message to user
      alert("Có lỗi xảy ra khi cập nhật trạng thái đơn hàng hoặc cộng tiền vào ví.");
    } finally {
      setActionLoading(false);
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
        Đơn Đặc Biệt
      </Typography>
      
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
                        label={order.status}
                        color={
                          order.status === "completed"
                            ? "success"
                            : order.status === "pending"
                            ? "warning"
                            : "error"
                        }
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
                        label={order.status}
                        color={
                          order.status === "completed"
                            ? "success"
                            : order.status === "processing"
                            ? "primary"
                            : "error"
                        }
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
              <Typography>Trạng thái: {selected.status}</Typography>
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
    </Box>
  );
};

export default SpecialOrders;