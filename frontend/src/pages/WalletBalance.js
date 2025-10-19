import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../services/api";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Pagination,
} from "@mui/material";
import {
  History,
  TrendingUp,
  TrendingDown,
  AccountBalanceWallet,
  CheckCircle,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { keyframes } from "@mui/system";

// Animation keyframes
const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
`;

const popIn = keyframes`
  0% { 
    transform: scale(0.5) translateY(-50px);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  100% { 
    transform: scale(1) translateY(0);
    opacity: 1;
  }
`;

export default function WalletBalance() {
  const { user } = useSelector((state) => state.auth);
  const [balance, setBalance] = useState(0);
  const [currency, setCurrency] = useState("VND");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDeposit, setOpenDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [successModal, setSuccessModal] = useState({
    open: false,
    message: "",
    title: "",
  });
  const [countdownSeconds, setCountdownSeconds] = useState(0);
  const [qrUrl, setQrUrl] = useState("");
  const [descriptor, setDescriptor] = useState("");
  const [debugOpen, setDebugOpen] = useState(false);
  const [debugLoading, setDebugLoading] = useState(false);
  const [debugData, setDebugData] = useState(null);

  // Withdrawal states
  const [openWithdraw, setOpenWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankName, setBankName] = useState("");
  const [withdrawNotes, setWithdrawNotes] = useState("");
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [withdrawalPage, setWithdrawalPage] = useState(1);
  const [withdrawalTotal, setWithdrawalTotal] = useState(0);
  const [withdrawalPages, setWithdrawalPages] = useState(1);

  // Transaction history states
  const [transactions, setTransactions] = useState([]);
  const [transactionPage, setTransactionPage] = useState(1);
  const [transactionTotal, setTransactionTotal] = useState(0);
  const [transactionPages, setTransactionPages] = useState(1);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoading(true);
        const res = await api.get("/wallet/balance");
        setBalance(Number(res.data.balance || 0));
        setCurrency(res.data.currency || "VND");
      } catch (e) {
        setError(e.response?.data?.message || "Không thể tải số dư");
      } finally {
        setLoading(false);
      }
    };
    fetchBalance();
  }, []);

  useEffect(() => {
    if (user?.role === "florist") {
      fetchWithdrawalRequests();
    }
  }, [user, withdrawalPage]);

  useEffect(() => {
    fetchTransactions();
  }, [transactionPage]);

  // Countdown effect cho success modal
  useEffect(() => {
    if (successModal.open && countdownSeconds > 0) {
      const timer = setTimeout(() => {
        setCountdownSeconds(countdownSeconds - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdownSeconds === 0 && successModal.open) {
      // Auto close khi hết thời gian
      setSuccessModal({ ...successModal, open: false });
    }
  }, [successModal.open, countdownSeconds]);

  const fetchTransactions = async () => {
    try {
      const res = await api.get("/wallet/transactions", {
        params: { page: transactionPage, limit: 10 },
      });
      setTransactions(res.data.transactions || []);
      setTransactionTotal(res.data.total || 0);
      setTransactionPages(res.data.pages || 1);
    } catch (e) {
      console.error("Failed to fetch transactions:", e);
    }
  };

  const fetchWithdrawalRequests = async () => {
    try {
      const res = await api.get("/wallet/withdrawals", {
        params: { page: withdrawalPage, limit: 10 },
      });
      setWithdrawalRequests(res.data.requests || []);
      setWithdrawalTotal(res.data.total || 0);
      setWithdrawalPages(res.data.pages || 1);
    } catch (e) {
      console.error("Failed to fetch withdrawal requests:", e);
    }
  };

  const showSuccessModal = (message = "", title = "") => {
    setSuccessModal({
      open: true,
      message: message || "Thành công!",
      title: title || "✓ Thành công",
    });
    setCountdownSeconds(2);
  };

  const handleWithdraw = async () => {
    try {
      setSubmitting(true);
      const amount = parseFloat(withdrawAmount);

      if (!amount || amount <= 0) {
        setToast({
          open: true,
          message: "Số tiền không hợp lệ",
          severity: "error",
        });
        return;
      }

      if (amount > balance) {
        setToast({
          open: true,
          message: "Số dư không đủ",
          severity: "error",
        });
        return;
      }

      if (!bankAccount.trim() || !bankName.trim()) {
        setToast({
          open: true,
          message: "Vui lòng điền đầy đủ thông tin ngân hàng",
          severity: "error",
        });
        return;
      }

      const res = await api.post("/wallet/withdraw", {
        amount,
        bank_account: bankAccount.trim(),
        bank_name: bankName.trim(),
        notes: withdrawNotes.trim(),
      });

      setToast({
        open: true,
        message: res.data.message || "Yêu cầu rút tiền đã được gửi",
        severity: "success",
      });

      // Reset form and close dialog
      setOpenWithdraw(false);
      setWithdrawAmount("");
      setBankAccount("");
      setBankName("");
      setWithdrawNotes("");

      // Refresh withdrawal requests
      fetchWithdrawalRequests();
    } catch (e) {
      setToast({
        open: true,
        message: e.response?.data?.message || "Có lỗi xảy ra",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
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

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case "deposit":
        return "success";
      case "payment":
        return "error";
      case "refund":
        return "info";
      case "withdrawal":
        return "warning";
      default:
        return "default";
    }
  };

  const getTransactionTypeText = (type) => {
    switch (type) {
      case "deposit":
        return "Nạp tiền";
      case "payment":
        return "Thanh toán";
      case "refund":
        return "Hoàn tiền";
      case "withdrawal":
        return "Rút tiền";
      default:
        return type;
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Ví Của Tôi
        </Typography>
        {loading ? (
          <Typography>Đang tải...</Typography>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <>
            <Typography variant="h4" color="primary" gutterBottom>
              {balance.toLocaleString("vi-VN")} {currency}
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button variant="contained" onClick={() => setOpenDeposit(true)}>
                Nạp Tiền
              </Button>
              {user?.role === "florist" && (
                <Button
                  variant="outlined"
                  onClick={() => setOpenWithdraw(true)}
                  disabled={balance <= 0}
                >
                  Rút Tiền
                </Button>
              )}
            </Stack>
          </>
        )}
      </Paper>

      {/* Transaction History */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <History sx={{ color: "#667eea" }} />
          <Typography variant="h6" fontWeight="bold">
            Lịch Sử Giao Dịch
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ngày</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Số tiền</TableCell>
                <TableCell>Mô tả</TableCell>
                <TableCell>Số dư sau</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Chưa có giao dịch nào
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      {new Date(tx.created_at || tx.createdAt).toLocaleString("vi-VN")}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getTransactionTypeText(tx.type)}
                        color={getTransactionTypeColor(tx.type)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        sx={{
                          color:
                            tx.amount >= 0 ? "success.main" : "error.main",
                          fontWeight: "bold",
                        }}
                      >
                        {tx.amount >= 0 ? "+" : ""}
                        {Number(tx.amount).toLocaleString("vi-VN")} VND
                      </Typography>
                    </TableCell>
                    <TableCell>{tx.description || "-"}</TableCell>
                    <TableCell>
                      {Number(tx.balance_after || 0).toLocaleString("vi-VN")}{" "}
                      VND
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {transactionPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Pagination
              count={transactionPages}
              page={transactionPage}
              onChange={(e, page) => setTransactionPage(page)}
              color="primary"
            />
          </Box>
        )}
      </Paper>

      {/* Withdrawal History for Florists */}
      {user?.role === "florist" && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Lịch Sử Rút Tiền
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ngày</TableCell>
                  <TableCell>Số tiền</TableCell>
                  <TableCell>Ngân hàng</TableCell>
                  <TableCell>Số tài khoản</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Ghi chú</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {withdrawalRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Chưa có yêu cầu rút tiền nào
                    </TableCell>
                  </TableRow>
                ) : (
                  withdrawalRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        {new Date(request.createdAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </TableCell>
                      <TableCell>
                        {Number(request.amount).toLocaleString("vi-VN")} VND
                      </TableCell>
                      <TableCell>{request.bank_name}</TableCell>
                      <TableCell>{request.bank_account}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(request.status)}
                          color={getStatusColor(request.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{request.notes || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {withdrawalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Pagination
                count={withdrawalPages}
                page={withdrawalPage}
                onChange={(e, page) => setWithdrawalPage(page)}
                color="primary"
              />
            </Box>
          )}
        </Paper>
      )}

      {/* Withdraw Dialog */}
      <Dialog
        open={openWithdraw}
        onClose={() => setOpenWithdraw(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Yêu Cầu Rút Tiền</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Số dư hiện tại: {balance.toLocaleString("vi-VN")} VND
          </Typography>
          <TextField
            label="Số tiền muốn rút (VND)"
            type="number"
            fullWidth
            margin="normal"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            inputProps={{ min: 1000, max: balance, step: 1000 }}
            helperText="Số tiền tối thiểu: 10,000 VND"
          />
          <TextField
            label="Tên ngân hàng"
            fullWidth
            margin="normal"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="VD: Vietcombank, BIDV, Techcombank..."
          />
          <TextField
            label="Số tài khoản"
            fullWidth
            margin="normal"
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
            placeholder="Nhập số tài khoản ngân hàng"
          />
          <TextField
            label="Ghi chú (tùy chọn)"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={withdrawNotes}
            onChange={(e) => setWithdrawNotes(e.target.value)}
            placeholder="Thêm ghi chú nếu cần..."
          />
          <Alert severity="info" sx={{ mt: 2 }}>
            Yêu cầu rút tiền sẽ được admin xem xét và xử lý trong 1-3 ngày làm
            việc.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenWithdraw(false);
              setWithdrawAmount("");
              setBankAccount("");
              setBankName("");
              setWithdrawNotes("");
            }}
            disabled={submitting}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleWithdraw}
            disabled={submitting}
          >
            {submitting ? "Đang xử lý..." : "Gửi Yêu Cầu"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Deposit Dialog */}
      <Dialog
        open={openDeposit}
        onClose={() => setOpenDeposit(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Nạp Tiền Vào Ví</DialogTitle>
        <DialogContent>
          <TextField
            label="Số tiền (VND)"
            type="number"
            fullWidth
            margin="normal"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            inputProps={{ min: 1000, step: 1000 }}
          />
          <TextField
            select
            fullWidth
            label="Phương thức thanh toán"
            margin="normal"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <MenuItem value="bank_transfer">Chuyển khoản ngân hàng</MenuItem>
            <MenuItem value="card">Thẻ (demo)</MenuItem>
            <MenuItem value="wallet">Ví khác (demo)</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenDeposit(false);
              setQrUrl("");
              setDescriptor("");
            }}
            disabled={submitting}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={async () => {
              // Build sepay QR URL and show QR image
              try {
                setSubmitting(true);
                const amt = Number(depositAmount);
                if (!amt || amt <= 0) {
                  setToast({
                    open: true,
                    message: "Số tiền không hợp lệ",
                    severity: "error",
                  });
                  setSubmitting(false);
                  return;
                }

                // Generate descriptor: flowershop+<random>
                const randomToken = Array.from(
                  crypto.getRandomValues(new Uint8Array(12))
                )
                  .map((b) => (b % 36).toString(36))
                  .join("");
                const desc = `flowershop+${randomToken}`;
                setDescriptor(desc);

                const params = new URLSearchParams({
                  acc: process.env.REACT_APP_SEPAY_ACC || "",
                  bank: process.env.REACT_APP_SEPAY_BANK || "",
                  amount: String(amt),
                  des: desc,
                  template: process.env.REACT_APP_SEPAY_TEMPLATE || "compact",
                  download: process.env.REACT_APP_SEPAY_DOWNLOAD || "0",
                });
                const url = `https://qr.sepay.vn/img?${params.toString()}`;
                setQrUrl(url);
                // Keep dialog open and show QR below
                setToast({
                  open: true,
                  message:
                    "Đã tạo QR nạp tiền. Vui lòng quét và ghi đúng nội dung.",
                  severity: "success",
                });
              } catch (e) {
                setToast({
                  open: true,
                  message: "Không thể tạo QR nạp tiền",
                  severity: "error",
                });
              } finally {
                setSubmitting(false);
              }
            }}
            disabled={submitting}
          >
            {submitting ? "Đang xử lý..." : "Xác nhận"}
          </Button>
        </DialogActions>
        {qrUrl && (
          <Box sx={{ px: 3, pb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Nội dung chuyển khoản (des):
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <TextField
                fullWidth
                value={descriptor}
                InputProps={{ readOnly: true }}
              />
              <Button
                variant="outlined"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(descriptor);
                    setToast({
                      open: true,
                      message: "Đã copy nội dung",
                      severity: "success",
                    });
                  } catch (_) {
                    setToast({
                      open: true,
                      message: "Không thể copy",
                      severity: "error",
                    });
                  }
                }}
              >
                Copy
              </Button>
            </Stack>
            <Box sx={{ textAlign: "center" }}>
              <img
                src={qrUrl}
                alt="QR nạp tiền"
                style={{ maxWidth: "100%", borderRadius: 8 }}
              />
              <Stack
                direction="row"
                spacing={2}
                justifyContent="center"
                sx={{ mt: 2 }}
              >
                <Button
                  variant="outlined"
                  onClick={() => window.open(qrUrl, "_blank")}
                >
                  Mở ảnh QR
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={async () => {
                    setDebugOpen(true);
                    setDebugLoading(true);
                    setDebugData(null);
                    try {
                      const res = await api.get("/wallet/debug/sepay");
                      setDebugData(res.data);
                    } catch (e) {
                      setToast({
                        open: true,
                        message:
                          e.response?.data?.message || "Debug GET thất bại",
                        severity: "error",
                      });
                    } finally {
                      setDebugLoading(false);
                    }
                  }}
                >
                  Debug API GET
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={async () => {
                    try {
                      // Call backend to verify against Sepay transactions
                      const amt = Number(depositAmount);
                      const res = await api.post("/wallet/deposit/verify", {
                        descriptor,
                        amount: amt || undefined,
                      });
                      setBalance(Number(res.data.balance || 0));
                      fetchTransactions(); // Refresh transaction history
                      showSuccessModal(
                        res.data.message || "Xác nhận nạp tiền thành công!",
                        "🎉 Xác nhận thành công"
                      );
                    } catch (e) {
                      setToast({
                        open: true,
                        message:
                          e.response?.data?.message ||
                          "Chưa tìm thấy giao dịch phù hợp",
                        severity: "warning",
                      });
                    } finally {
                      setOpenDeposit(false);
                      setQrUrl("");
                      setDescriptor("");
                      setDepositAmount("");
                    }
                  }}
                >
                  Xong
                </Button>
              </Stack>
            </Box>
          </Box>
        )}
      </Dialog>

      {/* Debug Dialog: show full API JSON */}
      <Dialog
        open={debugOpen}
        onClose={() => setDebugOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Sepay Debug Response</DialogTitle>
        <DialogContent dividers>
          {debugLoading ? (
            <Typography>Đang tải...</Typography>
          ) : debugData ? (
            <Box
              component="pre"
              sx={{
                maxHeight: 500,
                overflow: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark" ? "#222" : "#f5f5f5",
                p: 2,
                borderRadius: 1,
              }}
            >
              {JSON.stringify(debugData, null, 2)}
            </Box>
          ) : (
            <Typography>Không có dữ liệu</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(
                  JSON.stringify(debugData, null, 2)
                );
                setToast({
                  open: true,
                  message: "Đã copy JSON",
                  severity: "success",
                });
              } catch (_) {
                setToast({
                  open: true,
                  message: "Không thể copy",
                  severity: "error",
                });
              }
            }}
            disabled={!debugData}
          >
            Copy JSON
          </Button>
          <Button variant="contained" onClick={() => setDebugOpen(false)}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Modal - Nổi bật hơn */}
      <Dialog
        open={successModal.open}
        onClose={() => {
          setSuccessModal({ ...successModal, open: false });
          setCountdownSeconds(0);
        }}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "20px",
            boxShadow: "0 20px 60px rgba(76, 175, 80, 0.3)",
            background: "linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 100%)",
            animation: `${popIn} 0.5s ease-out`,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 20px",
            textAlign: "center",
          }}
        >
          {/* Animated Success Icon */}
          <Box
            sx={{
              mb: 2,
              animation: `${bounce} 0.6s ease-in-out infinite`,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <CheckCircle
              sx={{
                fontSize: "80px",
                color: "#4CAF50",
                filter: "drop-shadow(0 4px 12px rgba(76, 175, 80, 0.4))",
              }}
            />
          </Box>

          {/* Title */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "#2E7D32",
              mb: 1,
              fontSize: "24px",
              letterSpacing: "0.5px",
            }}
          >
            {successModal.title}
          </Typography>

          {/* Message */}
          <Typography
            variant="body1"
            sx={{
              color: "#558B2F",
              mb: 3,
              fontSize: "16px",
              lineHeight: "1.6",
            }}
          >
            {successModal.message}
          </Typography>

          {/* Progress Bar */}
          <Box
            sx={{
              width: "100%",
              height: "4px",
              backgroundColor: "#E0E0E0",
              borderRadius: "2px",
              overflow: "hidden",
              mb: 2,
            }}
          >
            <Box
              sx={{
                height: "100%",
                backgroundColor: "#4CAF50",
                width: `${(countdownSeconds / 2) * 100}%`,
                transition: "width 0.3s ease",
              }}
            />
          </Box>

          {/* Countdown Text */}
          <Typography
            variant="caption"
            sx={{
              color: "#81C784",
              fontSize: "13px",
              fontWeight: 500,
            }}
          >
            Đóng tự động trong {countdownSeconds} giây
          </Typography>
        </Box>
      </Dialog>

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
}
