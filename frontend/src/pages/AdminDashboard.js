import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../services/api";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [shops, setShops] = useState([]);
  const [requests, setRequests] = useState([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [openWithdrawalDialog, setOpenWithdrawalDialog] = useState(false);
  const [actionNotes, setActionNotes] = useState("");
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [usersRes, shopsRes, requestsRes, withdrawalRes] = await Promise.all([
        api.get("/users"),
        api.get("/shops"),
        api.get("/shops/request"), // Assume endpoint for pending requests
        api.get("/wallet/withdrawals"), // Get all withdrawal requests for admin
      ]);
      setUsers(usersRes.data.users || []);
      setShops(shopsRes.data.shops || []);
      setRequests(requestsRes.data.requests || []);
      setWithdrawalRequests(withdrawalRes.data.requests || []);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      await api.put(`/shops/request/${requestId}/approve`, {
        status: "approved",
      });
      fetchAdminData(); // Refresh
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  const handleWithdrawalAction = async (withdrawalId, status, notes = "") => {
    try {
      await api.put(`/wallet/withdrawals/${withdrawalId}/process`, {
        status,
        notes,
      });
      setToast({
        open: true,
        message: `Đã ${status === "processed" ? "duyệt" : "từ chối"} yêu cầu rút tiền`,
        severity: "success",
      });
      fetchAdminData(); // Refresh
      setOpenWithdrawalDialog(false);
      setSelectedWithdrawal(null);
      setActionNotes("");
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      setToast({
        open: true,
        message: "Có lỗi xảy ra khi xử lý yêu cầu",
        severity: "error",
      });
    }
  };

  const openWithdrawalDetail = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setOpenWithdrawalDialog(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "approved":
        return "info";
      case "processed":
        return "success";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ duyệt";
      case "approved":
        return "Đã duyệt";
      case "processed":
        return "Đã xử lý";
      case "rejected":
        return "Từ chối";
      default:
        return status;
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" onClick={() => navigate("/admin/posts")}>
          Quản lý bài đăng
        </Button>
      </Box>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 4 }}>
        <Tab label="Người Dùng" />
        <Tab label="Cửa Hàng" />
        <Tab label="Yêu Cầu Mở Shop" />
        <Tab label="Yêu Cầu Rút Tiền" />
      </Tabs>

      {tabValue === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Tên</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip label={user.role} color="primary" size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.status}
                      color={user.status === "active" ? "success" : "error"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      onClick={() => navigate(`/admin/users/${user.id}`)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tabValue === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Tên Shop</TableCell>
                <TableCell>Chủ Shop</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Rating</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {shops.map((shop) => (
                <TableRow key={shop.id}>
                  <TableCell>{shop.id}</TableCell>
                  <TableCell>{shop.name}</TableCell>
                  <TableCell>{shop.florist?.name}</TableCell>
                  <TableCell>
                    <Chip label={shop.status} color="primary" size="small" />
                  </TableCell>
                  <TableCell>{shop.rating}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tabValue === 2 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Tên Shop</TableCell>
                <TableCell>Người Nộp</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.id}</TableCell>
                  <TableCell>{request.shop_name}</TableCell>
                  <TableCell>{request.user?.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={request.status}
                      color={
                        request.status === "pending" ? "warning" : "success"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {request.status === "pending" && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleApproveRequest(request.id)}
                      >
                        Duyệt
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tabValue === 3 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Florist</TableCell>
                <TableCell>Số tiền</TableCell>
                <TableCell>Ngân hàng</TableCell>
                <TableCell>Số TK</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {withdrawalRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Không có yêu cầu rút tiền nào
                  </TableCell>
                </TableRow>
              ) : (
                withdrawalRequests.map((withdrawal) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell>{withdrawal.id}</TableCell>
                    <TableCell>
                      {withdrawal.user?.name || withdrawal.user?.email}
                    </TableCell>
                    <TableCell>
                      {Number(withdrawal.amount).toLocaleString("vi-VN")} VND
                    </TableCell>
                    <TableCell>{withdrawal.bank_name}</TableCell>
                    <TableCell>{withdrawal.bank_account}</TableCell>
                    <TableCell>
                      {new Date(withdrawal.createdAt).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(withdrawal.status)}
                        color={getStatusColor(withdrawal.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1, flexDirection: "column" }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => openWithdrawalDetail(withdrawal)}
                        >
                          Chi tiết
                        </Button>
                        {withdrawal.status === "pending" && (
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() =>
                                handleWithdrawalAction(
                                  withdrawal.id,
                                  "processed",
                                  "Đã xử lý rút tiền"
                                )
                              }
                            >
                              Duyệt
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() =>
                                handleWithdrawalAction(
                                  withdrawal.id,
                                  "rejected",
                                  "Yêu cầu bị từ chối"
                                )
                              }
                            >
                              Từ chối
                            </Button>
                          </Box>
                        )}
                        {withdrawal.status === "approved" && (
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() =>
                              handleWithdrawalAction(
                                withdrawal.id,
                                "processed",
                                "Đã hoàn tất thanh toán"
                              )
                            }
                          >
                            Hoàn tất
                          </Button>
                        )}
                        {(withdrawal.status === "processed" ||
                          withdrawal.status === "rejected") && (
                          <Typography variant="body2" color="text.secondary">
                            {withdrawal.processed_at
                              ? new Date(withdrawal.processed_at).toLocaleDateString(
                                  "vi-VN"
                                )
                              : "-"}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Withdrawal Detail Dialog */}
      <Dialog
        open={openWithdrawalDialog}
        onClose={() => {
          setOpenWithdrawalDialog(false);
          setSelectedWithdrawal(null);
          setActionNotes("");
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chi Tiết Yêu Cầu Rút Tiền</DialogTitle>
        <DialogContent>
          {selectedWithdrawal && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body1" gutterBottom>
                <strong>ID:</strong> {selectedWithdrawal.id}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Florist:</strong> {selectedWithdrawal.user?.name || selectedWithdrawal.user?.email}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Số tiền:</strong> {Number(selectedWithdrawal.amount).toLocaleString("vi-VN")} VND
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Ngân hàng:</strong> {selectedWithdrawal.bank_name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Số tài khoản:</strong> {selectedWithdrawal.bank_account}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Ngày tạo:</strong> {new Date(selectedWithdrawal.createdAt).toLocaleString("vi-VN")}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Trạng thái:</strong>{" "}
                <Chip
                  label={getStatusText(selectedWithdrawal.status)}
                  color={getStatusColor(selectedWithdrawal.status)}
                  size="small"
                />
              </Typography>
              {selectedWithdrawal.notes && (
                <Typography variant="body1" gutterBottom>
                  <strong>Ghi chú từ florist:</strong> {selectedWithdrawal.notes}
                </Typography>
              )}
              {selectedWithdrawal.processed_at && (
                <Typography variant="body1" gutterBottom>
                  <strong>Ngày xử lý:</strong> {new Date(selectedWithdrawal.processed_at).toLocaleString("vi-VN")}
                </Typography>
              )}
              
              {selectedWithdrawal.status === "pending" && (
                <Box sx={{ mt: 3 }}>
                  <TextField
                    fullWidth
                    label="Ghi chú xử lý (tùy chọn)"
                    multiline
                    rows={3}
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="Thêm ghi chú về quyết định xử lý..."
                  />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenWithdrawalDialog(false);
              setSelectedWithdrawal(null);
              setActionNotes("");
            }}
          >
            Đóng
          </Button>
          {selectedWithdrawal?.status === "pending" && (
            <>
              <Button
                variant="outlined"
                color="error"
                onClick={() =>
                  handleWithdrawalAction(
                    selectedWithdrawal.id,
                    "rejected",
                    actionNotes || "Yêu cầu bị từ chối"
                  )
                }
              >
                Từ chối
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() =>
                  handleWithdrawalAction(
                    selectedWithdrawal.id,
                    "processed",
                    actionNotes || "Đã xử lý rút tiền"
                  )
                }
              >
                Duyệt & Xử lý
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast((t) => ({ ...t, open: false }))}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard;
