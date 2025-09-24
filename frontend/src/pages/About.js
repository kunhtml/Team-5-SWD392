import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { Link as RouterLink } from "react-router-dom";

const ImgWithFallback = ({ src, alt, height = 400, rounded = true }) => (
  <Box sx={{ position: "relative" }}>
    <img
      src={src}
      alt={alt}
      className="about-image"
      style={{
        width: "100%",
        height,
        objectFit: "cover",
        borderRadius: rounded ? 12 : 0,
        boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
      }}
      onError={(e) => {
        e.currentTarget.style.display = "none";
        const placeholder = e.currentTarget.nextSibling;
        if (placeholder) placeholder.style.display = "flex";
      }}
    />
    <Box
      sx={{
        display: "none",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height,
        border: "2px dashed #dee2e6",
        borderRadius: rounded ? 12 : 0,
        bgcolor: "#f8f9fa",
        color: "text.secondary",
      }}
    >
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h6" sx={{ opacity: 0.7 }}>
          Hình ảnh không khả dụng
        </Typography>
      </Box>
    </Box>
  </Box>
);

const Stat = ({ value, label }) => (
  <Box sx={{ textAlign: "center" }}>
    <Typography variant="h4" color="primary" fontWeight={700}>
      {value}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
  </Box>
);

const ValueCard = ({ icon, title, desc }) => (
  <Card elevation={2} sx={{ height: "100%" }}>
    <CardContent sx={{ textAlign: "center", p: 4 }}>
      <Box sx={{ mb: 2 }}>{icon}</Box>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {desc}
      </Typography>
    </CardContent>
  </Card>
);

const About = () => {
  const TEAM_IMG =
    "https://cdn-icons-png.freepik.com/256/9055/9055398.png?semt=ais_white_label";
  return (
    <Box sx={{ mt: 2 }}>
      {/* Hero Section */}
      <Box sx={{ py: { xs: 4, md: 8 } }}>
        <Container maxWidth="lg">
          <Grid
            container
            spacing={4}
            alignItems="center"
            minHeight={{ md: "50vh" }}
          >
            <Grid item xs={12} md={6}>
              <Typography
                variant="h3"
                fontWeight={800}
                color="primary"
                gutterBottom
              >
                Về Flower Shop
              </Typography>
              <Typography variant="h6" color="text.primary" sx={{ mb: 2 }}>
                Chúng tôi là cửa hàng hoa tươi hàng đầu, mang đến những bó hoa
                tuyệt đẹp cho mọi dịp đặc biệt trong cuộc sống của bạn.
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Với hơn 10 năm kinh nghiệm trong ngành hoa tươi, chúng tôi cam
                kết cung cấp những sản phẩm chất lượng cao nhất và dịch vụ tận
                tâm cho khách hàng.
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button
                  component={RouterLink}
                  to="/products"
                  variant="contained"
                  size="large"
                >
                  Xem Sản Phẩm
                </Button>
                <Button
                  href="mailto:support@flowershop.com"
                  variant="outlined"
                  size="large"
                >
                  Liên Hệ Ngay
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <ImgWithFallback
                src="https://blog.dktcdn.net/articles/thiet-ke-shop-hoa-tuoi.jpg"
                alt="Flower Shop"
                height={400}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Values Section */}
      <Box sx={{ py: 6, bgcolor: "#f8f9fa" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Giá Trị Cốt Lõi
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Những giá trị làm nên thương hiệu Flower Shop
            </Typography>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <ValueCard
                icon={
                  <FavoriteIcon fontSize="large" sx={{ color: "error.main" }} />
                }
                title="Tình Yêu & Tận Tâm"
                desc="Chúng tôi đặt tình yêu thương và sự tận tâm vào từng bó hoa, mang đến niềm vui và hạnh phúc cho khách hàng."
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <ValueCard
                icon={<WorkspacePremiumIcon fontSize="large" color="primary" />}
                title="Chất Lượng Cao"
                desc="Hoa tươi được chọn lọc kỹ càng, đảm bảo độ tươi và chất lượng tốt nhất."
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <ValueCard
                icon={
                  <LocalShippingIcon
                    fontSize="large"
                    sx={{ color: "success.main" }}
                  />
                }
                title="Giao Hàng Nhanh"
                desc="Dịch vụ giao hàng nhanh chóng trong ngày, đảm bảo hoa tươi đến tay người nhận đúng thời điểm."
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Story Section */}
      <Box sx={{ py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <ImgWithFallback
                src="https://vantaydecor.com/wp-content/uploads/2022/10/thiet-ke-shop-hoa-tuoi.jpg"
                alt="Câu chuyện của chúng tôi"
                height={350}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" fontWeight={800} gutterBottom>
                Câu Chuyện Của Chúng Tôi
              </Typography>
              <Typography sx={{ mb: 2 }}>
                Flower Shop được thành lập vào năm 2014 bởi một nhóm những người
                yêu thích hoa và muốn mang vẻ đẹp của thiên nhiên đến gần hơn
                với cuộc sống hàng ngày.
              </Typography>
              <Typography sx={{ mb: 2 }}>
                Từ một cửa hàng nhỏ, chúng tôi đã phát triển thành một trong
                những thương hiệu hoa tươi uy tín, phục vụ hàng nghìn khách hàng
                trên toàn quốc.
              </Typography>
              <Typography sx={{ mb: 3 }}>
                Chúng tôi tự hào là đối tác tin cậy trong những dịp quan trọng
                như sinh nhật, kỷ niệm, đám cưới, và nhiều sự kiện đặc biệt
                khác.
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Stat value="10+" label="Năm kinh nghiệm" />
                </Grid>
                <Grid item xs={4}>
                  <Stat value="5000+" label="Khách hàng hài lòng" />
                </Grid>
                <Grid item xs={4}>
                  <Stat value="50+" label="Loại hoa khác nhau" />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Team Section */}
      <Box sx={{ py: 6, bgcolor: "#f8f9fa" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Đội Ngũ Chuyên Nghiệp
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gặp gỡ những người tạo nên sự khác biệt
            </Typography>
          </Box>
          <Grid container spacing={3} justifyContent="center">
            {[
              { name: "Phạm Xuân Hiếu", img: TEAM_IMG },
              { name: "Phạm Hải Hà", img: TEAM_IMG },
              { name: "Nguyễn Ngọc Diệp", img: TEAM_IMG },
              { name: "Đặng Trung Hiếu", img: TEAM_IMG },
              { name: "Khuất Thị Mai Chi", img: TEAM_IMG },
            ].map((m, idx) => (
              <Grid
                key={idx}
                item
                xs={12}
                sm={6}
                md={3}
                lg={2.4}
                sx={{ display: "flex", justifyContent: "center" }}
              >
                <Card elevation={2} sx={{ width: "100%", maxWidth: 220 }}>
                  <Box sx={{ p: 0 }}>
                    <ImgWithFallback
                      src={m.img}
                      alt={m.name}
                      height={250}
                      rounded={false}
                    />
                  </Box>
                  <CardContent sx={{ textAlign: "center" }}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {m.name}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 6, bgcolor: "primary.main", color: "common.white" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h4" fontWeight={800} gutterBottom>
              Sẵn Sàng Tạo Nên Khoảnh Khắc Đặc Biệt?
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
              Hãy để chúng tôi giúp bạn thể hiện tình cảm qua những bó hoa tuyệt
              đẹp
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Button
                component={RouterLink}
                to="/products"
                variant="contained"
                color="secondary"
                size="large"
              >
                Mua Ngay
              </Button>
              <Button
                href="tel:+84123456789"
                variant="outlined"
                color="inherit"
                size="large"
              >
                Liên Hệ Tư Vấn
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default About;
