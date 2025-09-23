import React, { useEffect, useState } from "react";
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
} from "@mui/material";

export default function WalletBalance() {
  const [balance, setBalance] = useState(0);
  const [currency, setCurrency] = useState("VND");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDeposit, setOpenDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  const [qrUrl, setQrUrl] = useState("");
  const [descriptor, setDescriptor] = useState("");
  const [debugOpen, setDebugOpen] = useState(false);
  const [debugLoading, setDebugLoading] = useState(false);
  const [debugData, setDebugData] = useState(null);

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
              <Button variant="outlined" disabled>
                Rút Tiền (sắp có)
              </Button>
            </Stack>
          </>
        )}
      </Paper>

      {/* Deposit Dialog */}
      <Dialog open={openDeposit} onClose={() => setOpenDeposit(false)} maxWidth="xs" fullWidth>
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
                  setToast({ open: true, message: "Số tiền không hợp lệ", severity: "error" });
                  setSubmitting(false);
                  return;
                }

                // Generate descriptor: flowershop+<random>
                const randomToken = Array.from(crypto.getRandomValues(new Uint8Array(12)))
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
                setToast({ open: true, message: "Đã tạo QR nạp tiền. Vui lòng quét và ghi đúng nội dung.", severity: "success" });
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
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <TextField fullWidth value={descriptor} InputProps={{ readOnly: true }} />
              <Button
                variant="outlined"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(descriptor);
                    setToast({ open: true, message: "Đã copy nội dung", severity: "success" });
                  } catch (_) {
                    setToast({ open: true, message: "Không thể copy", severity: "error" });
                  }
                }}
              >
                Copy
              </Button>
            </Stack>
            <Box sx={{ textAlign: "center" }}>
              <img src={qrUrl} alt="QR nạp tiền" style={{ maxWidth: "100%", borderRadius: 8 }} />
              <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
                <Button variant="outlined" onClick={() => window.open(qrUrl, "_blank")}>Mở ảnh QR</Button>
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
                      setToast({ open: true, message: e.response?.data?.message || "Debug GET thất bại", severity: "error" });
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
                      setToast({ open: true, message: res.data.message || "Đã xác nhận nạp tiền", severity: "success" });
                    } catch (e) {
                      setToast({ open: true, message: e.response?.data?.message || "Chưa tìm thấy giao dịch phù hợp", severity: "warning" });
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
      <Dialog open={debugOpen} onClose={() => setDebugOpen(false)} maxWidth="md" fullWidth>
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
                backgroundColor: (theme) => theme.palette.mode === "dark" ? "#222" : "#f5f5f5",
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
                await navigator.clipboard.writeText(JSON.stringify(debugData, null, 2));
                setToast({ open: true, message: "Đã copy JSON", severity: "success" });
              } catch (_) {
                setToast({ open: true, message: "Không thể copy", severity: "error" });
              }
            }}
            disabled={!debugData}
          >
            Copy JSON
          </Button>
          <Button variant="contained" onClick={() => setDebugOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={toast.severity} onClose={() => setToast((t) => ({ ...t, open: false }))}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
