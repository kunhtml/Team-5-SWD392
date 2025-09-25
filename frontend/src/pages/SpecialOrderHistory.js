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
} from "@mui/material";

const SpecialOrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchSpecialOrderHistory({ page });
  }, [page]);

  const fetchSpecialOrderHistory = async ({ page = 1 } = {}) => {
    try {
      setLoading(true);
      const response = await api.get("/orders/special", {
        params: { page, limit: 10 },
      });
      setOrders(response.data.orders || []);
      setPages(response.data.pages || 1);
    } catch (error) {
      console.error("Error fetching special order history:", error);
    } finally {
      setLoading(false);
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
        Đơn Hàng Đặc Biệt Đã Tạo
      </Typography>
      
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
                        : order.status === "processing"
                        ? "primary"
                        : order.status === "pending"
                        ? "warning"
                        : "error"
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>{order.shop?.name || "N/A"}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setSelected(order)}
                  >
                    Chi Tiết
                  </Button>
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
              <Typography sx={{ mt: 2 }}>
                Địa chỉ: {selected.shipping_address}
              </Typography>
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
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SpecialOrderHistory;