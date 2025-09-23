import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
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
} from "@mui/material";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState(null);
  const [shipEdit, setShipEdit] = useState("");

  useEffect(() => {
    fetchOrders({ page, status });
  }, [page, status]);

  const fetchOrders = async ({ page = 1, status = "" } = {}) => {
    try {
      setLoading(true);
      const response = await api.get("/orders", {
        params: { page, limit: 10, status: status || undefined },
      });
      setOrders(response.data.orders || []);
      setPages(response.data.pages || 1);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Typography>Loading orders...</Typography>;

  return (
    <Box sx={{ mt: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4">Đơn Hàng Của Tôi</Typography>
        <TextField
          select
          size="small"
          label="Trạng thái"
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          sx={{ width: 220 }}
        >
          <MenuItem value="">Tất cả</MenuItem>
          <MenuItem value="pending">Đang chờ</MenuItem>
          <MenuItem value="processing">Đang xử lý</MenuItem>
          <MenuItem value="completed">Hoàn thành</MenuItem>
          <MenuItem value="cancelled">Đã hủy</MenuItem>
        </TextField>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Cửa Hàng</TableCell>
              <TableCell>Ngày Đặt</TableCell>
              <TableCell>Tổng Tiền</TableCell>
              <TableCell>Trạng Thái</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.shop?.name}</TableCell>
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
                    {(order.status === "pending" || order.status === "processing") && (
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={async () => {
                          try {
                            await api.put(`/orders/${order.id}/cancel`);
                            fetchOrders({ page, status });
                          } catch (e) {
                            console.error(e);
                          }
                        }}
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

      {/* Order details dialog */}
      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Chi tiết đơn #{selected?.id}</DialogTitle>
        <DialogContent dividers>
          {selected && (
            <Box>
              <Typography>Shop: {selected.shop?.name}</Typography>
              <Typography>
                Tổng tiền: {parseFloat(selected.total_amount).toLocaleString("vi-VN")} VNĐ
              </Typography>
              <Typography>Trạng thái: {selected.status}</Typography>
              {(selected.status === "pending" || selected.status === "processing") ? (
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
                <Typography sx={{ mt: 2 }}>Địa chỉ: {selected.shipping_address}</Typography>
              )}
              <Typography sx={{ mt: 2 }}>Sản phẩm:</Typography>
              <ul>
                {(selected.items || []).map((it) => (
                  <li key={it.id}>
                    {it.product?.name} x{it.quantity} — {parseFloat(it.price).toLocaleString("vi-VN")} VNĐ
                  </li>
                ))}
              </ul>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Đóng</Button>
          {selected && (selected.status === "pending" || selected.status === "processing") && (
            <Button
              variant="contained"
              onClick={async () => {
                try {
                  await api.put(`/orders/${selected.id}/shipping`, { shipping_address: shipEdit });
                  setSelected(null);
                  fetchOrders({ page, status });
                } catch (e) {
                  console.error(e);
                }
              }}
            >
              Lưu địa chỉ
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Orders;
