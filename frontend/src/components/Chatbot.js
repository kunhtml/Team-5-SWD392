import React, { useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Button,
  Divider,
  Tooltip,
  Fade,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";

const defaultSuggestions = [
  "Làm sao để đặt hoa?",
  "Phí giao hàng bao nhiêu?",
  "Có khuyến mãi nào không?",
  "Liên hệ chăm sóc khách hàng",
];

const normalize = (text) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

const buildReply = (message) => {
  const content = normalize(message);

  if (/(ship|giao|van chuyen)/.test(content)) {
    return "FlowerShop hỗ trợ giao hàng trong ngày tại các thành phố lớn. Đơn trên 500.000₫ sẽ được miễn phí giao trong bán kính 5km.";
  }

  if (/(thanh toan|payment|tra tien)/.test(content)) {
    return "Bạn có thể thanh toán qua thẻ, ví điện tử Momo/ZaloPay hoặc COD khi nhận hoa. Nếu cần hỗ trợ, hãy để lại số điện thoại nhé!";
  }

  if (/(khuyen mai|uu dai|discount)/.test(content)) {
    return "Hiện FlowerShop đang có chương trình giảm 10% cho các đơn hàng đặt trước 3 ngày. Nhập mã FLORAL10 khi thanh toán để áp dụng.";
  }

  if (/(dat hoa|order|mua|san pham)/.test(content)) {
    return "Để đặt hoa, bạn chọn sản phẩm ưa thích, thêm vào giỏ và tiến hành thanh toán. Nếu cần bó hoa theo yêu cầu, đội ngũ florist sẽ hỗ trợ bạn qua hotline 1900 1234.";
  }

  if (/(lien he|support|tu van)/.test(content)) {
    return "Bạn có thể liên hệ hotline 1900 1234 (8h-22h) hoặc email support@flowershop.vn. Chúng mình luôn sẵn sàng hỗ trợ bạn!";
  }

  if (/(doi tra|bao hanh|hu hong)/.test(content)) {
    return "FlowerShop cam kết hoa tươi mới 100%. Nếu sản phẩm không như mong đợi, bạn vui lòng liên hệ trong 2 giờ kể từ khi nhận để được đổi trả miễn phí.";
  }

  return "FlowerBot chưa hiểu ý bạn. Bạn có thể cung cấp thêm thông tin hoặc để lại số điện thoại để đội hỗ trợ liên hệ nhé!";
};

const Chatbot = ({ suggestions = defaultSuggestions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState(() => [
    {
      id: Date.now(),
      sender: "bot",
      text: "Xin chào! Mình là FlowerBot. Mình có thể giúp gì cho bạn về sản phẩm, giao hàng hoặc hỗ trợ đặt hoa?",
    },
  ]);

  const resolvedSuggestions = useMemo(
    () => (suggestions.length ? suggestions : defaultSuggestions),
    [suggestions]
  );

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const pushMessage = (sender, text) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        sender,
        text,
      },
    ]);
  };

  const handleSend = (presetMessage) => {
    const value = (presetMessage ?? inputValue).trim();
    if (!value || isProcessing) return;

    pushMessage("user", value);
    setInputValue("");
    setIsProcessing(true);

    setTimeout(() => {
      const reply = buildReply(value);
      pushMessage("bot", reply);
      setIsProcessing(false);
    }, 600);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: { xs: 16, sm: 24 },
        right: { xs: 16, sm: 24 },
        zIndex: (theme) => theme.zIndex.snackbar + 10,
      }}
    >
      <Fade in={isOpen} mountOnEnter unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            width: { xs: 320, sm: 360 },
            maxWidth: "calc(100vw - 32px)",
            mb: 2,
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 20px 45px rgba(0,0,0,0.15)",
          }}
        >
          <Box
            sx={{
              px: 2.5,
              py: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
            }}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                FlowerBot
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                Hỗ trợ trực tuyến 24/7
              </Typography>
            </Box>
            <IconButton onClick={handleToggle} size="small" sx={{ color: "inherit" }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box
            sx={{
              maxHeight: 320,
              overflowY: "auto",
              px: 2,
              py: 2.5,
              bgcolor: "grey.50",
            }}
          >
            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: "flex",
                  justifyContent:
                    message.sender === "user" ? "flex-end" : "flex-start",
                  mb: 1.5,
                }}
              >
                <Box
                  sx={{
                    px: 1.75,
                    py: 1.25,
                    borderRadius: 3,
                    maxWidth: "82%",
                    fontSize: "0.92rem",
                    lineHeight: 1.5,
                    whiteSpace: "pre-line",
                    backgroundColor:
                      message.sender === "user"
                        ? "primary.main"
                        : "white",
                    color: message.sender === "user" ? "white" : "text.primary",
                    boxShadow:
                      message.sender === "user"
                        ? "0 5px 16px rgba(102, 126, 234, 0.3)"
                        : "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                >
                  {message.text}
                </Box>
              </Box>
            ))}
            {isProcessing && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontStyle: "italic" }}
              >
                FlowerBot đang soạn câu trả lời...
              </Typography>
            )}
          </Box>

          <Divider />

          <Box sx={{ px: 2, py: 2, display: "flex", flexDirection: "column", gap: 1.25 }}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                multiline
                minRows={1}
                maxRows={3}
                placeholder="Nhập câu hỏi của bạn..."
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isProcessing}
              />
              <IconButton
                color="primary"
                onClick={() => handleSend()}
                disabled={isProcessing || !inputValue.trim()}
                sx={{ alignSelf: "flex-end" }}
              >
                <SendIcon />
              </IconButton>
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {resolvedSuggestions.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outlined"
                  size="small"
                  onClick={() => handleSend(suggestion)}
                  disabled={isProcessing}
                  sx={{ textTransform: "none", borderRadius: 999 }}
                >
                  {suggestion}
                </Button>
              ))}
            </Box>
          </Box>
        </Paper>
      </Fade>

      <Tooltip title={isOpen ? "Ẩn chatbot" : "Hỏi FlowerBot"} placement="left">
        <IconButton
          color="primary"
          onClick={handleToggle}
          sx={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            boxShadow: isOpen
              ? "0 12px 24px rgba(118, 75, 162, 0.4)"
              : "0 12px 24px rgba(102, 126, 234, 0.35)",
            bgcolor: isOpen ? "#764ba2" : "primary.main",
            color: "white",
            "&:hover": {
              bgcolor: isOpen ? "#6b5b95" : "primary.dark",
              transform: "translateY(-2px)",
            },
          }}
        >
          <ChatIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default Chatbot;
