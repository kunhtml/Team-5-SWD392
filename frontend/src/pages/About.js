import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  Paper,
  Avatar,
  Chip,
  Fade,
  Grow,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { Link as RouterLink } from "react-router-dom";

const ImgWithFallback = ({ src, alt, height = 400, rounded = true }) => (
  <Box sx={{ position: "relative", overflow: "hidden" }}>
    <img
      src={src}
      alt={alt}
      className="about-image"
      style={{
        width: "100%",
        height,
        objectFit: "cover",
        borderRadius: rounded ? 16 : 0,
        boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
      }}
      onError={(e) => {
        e.currentTarget.style.display = "none";
        const placeholder = e.currentTarget.nextSibling;
        if (placeholder) placeholder.style.display = "flex";
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.02)";
        e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.15)";
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
        borderRadius: rounded ? 16 : 0,
        bgcolor: "background.paper",
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
  <Grow in timeout={1000}>
    <Card
      elevation={0}
      sx={{
        height: "100%",
        background: "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: "0 16px 40px rgba(0,0,0,0.1)",
          borderColor: "primary.main",
        },
      }}
    >
      <CardContent sx={{ textAlign: "center", p: 4 }}>
        <Box
          sx={{
            mb: 3,
            p: 2,
            borderRadius: "50%",
            bgcolor: "background.paper",
            display: "inline-flex",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          {icon}
        </Box>
        <Typography
          variant="h6"
          fontWeight={700}
          gutterBottom
          sx={{ color: "text.primary" }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.6 }}
        >
          {desc}
        </Typography>
      </CardContent>
    </Card>
  </Grow>
);

const About = () => {
  const TEAM_IMG =
    "https://cdn-icons-png.freepik.com/256/9055/9055398.png?semt=ais_white_label";
  return (
    <Box sx={{ mt: 2 }}>
      {/* Hero Section */}
      <Box
        sx={{
          py: { xs: 6, md: 10 },
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.3)",
            zIndex: 1,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
          <Fade in timeout={1500}>
            <Grid
              container
              spacing={6}
              alignItems="center"
              minHeight={{ md: "60vh" }}
            >
              <Grid item xs={12} md={6}>
                <Chip
                  label="🌸 Flower Shop Premium"
                  sx={{
                    mb: 3,
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white",
                    fontWeight: 600,
                  }}
                />
                <Typography
                  variant="h2"
                  fontWeight={900}
                  gutterBottom
                  sx={{
                    fontSize: { xs: "2.5rem", md: "3.5rem" },
                    lineHeight: 1.1,
                    mb: 3,
                  }}
                >
                  Về Flower Shop
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ mb: 3, opacity: 0.95, fontWeight: 300 }}
                >
                  Chúng tôi là cửa hàng hoa tươi hàng đầu, mang đến những bó hoa
                  tuyệt đẹp cho mọi dịp đặc biệt trong cuộc sống của bạn.
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 4,
                    opacity: 0.9,
                    fontSize: "1.1rem",
                    lineHeight: 1.7,
                  }}
                >
                  Với hơn 10 năm kinh nghiệm trong ngành hoa tươi, chúng tôi cam
                  kết cung cấp những sản phẩm chất lượng cao nhất và dịch vụ tận
                  tâm cho khách hàng.
                </Typography>
                <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                  <Button
                    component={RouterLink}
                    to="/products"
                    variant="contained"
                    size="large"
                    sx={{
                      bgcolor: "white",
                      color: "primary.main",
                      px: 4,
                      py: 1.5,
                      fontWeight: 700,
                      borderRadius: 3,
                      "&:hover": { bgcolor: "grey.100" },
                    }}
                  >
                    Xem Sản Phẩm
                  </Button>
                  <Button
                    href="mailto:support@flowershop.com"
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: "white",
                      color: "white",
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      borderRadius: 3,
                      "&:hover": {
                        borderColor: "white",
                        bgcolor: "rgba(255,255,255,0.1)",
                      },
                    }}
                  >
                    Liên Hệ Ngay
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ position: "relative" }}>
                  <ImgWithFallback
                    src="https://blog.dktcdn.net/articles/thiet-ke-shop-hoa-tuoi.jpg"
                    alt="Flower Shop"
                    height={500}
                  />
                </Box>
              </Grid>
            </Grid>
          </Fade>
        </Container>
      </Box>

      {/* Values Section */}
      <Box sx={{ py: 8, bgcolor: "grey.50" }}>
        <Container maxWidth="lg">
          <Fade in timeout={1000}>
            <Box sx={{ textAlign: "center", mb: 6 }}>
              <Typography
                variant="h3"
                fontWeight={800}
                gutterBottom
                sx={{
                  background: "linear-gradient(45deg, #667eea, #764ba2)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  mb: 2,
                }}
              >
                Giá Trị Cốt Lõi
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: 600, mx: "auto" }}
              >
                Những giá trị làm nên thương hiệu Flower Shop - nền tảng cho mọi
                hoạt động của chúng tôi
              </Typography>
            </Box>
          </Fade>
          <Grid container spacing={4}>
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
                desc="Hoa tươi được chọn lọc kỹ càng từ những vườn hoa uy tín, đảm bảo độ tươi và chất lượng tốt nhất."
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
                desc="Dịch vụ giao hàng nhanh chóng trong ngày với đội ngũ shipper chuyên nghiệp, đảm bảo hoa tươi đến tay người nhận."
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Story Section */}
      <Box sx={{ py: 8, bgcolor: "background.paper" }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ position: "relative" }}>
                <ImgWithFallback
                  src="https://vantaydecor.com/wp-content/uploads/2022/10/thiet-ke-shop-hoa-tuoi.jpg"
                  alt="Câu chuyện của chúng tôi"
                  height={450}
                />
                <Paper
                  elevation={8}
                  sx={{
                    position: "absolute",
                    bottom: -20,
                    right: -20,
                    p: 3,
                    bgcolor: "primary.main",
                    color: "white",
                    borderRadius: 3,
                    maxWidth: 200,
                  }}
                >
                  <Typography variant="h4" fontWeight={700}>
                    2014
                  </Typography>
                  <Typography variant="body2">Năm thành lập</Typography>
                </Paper>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Chip
                label="Câu chuyện của chúng tôi"
                color="primary"
                sx={{ mb: 2, fontWeight: 600 }}
              />
              <Typography
                variant="h3"
                fontWeight={800}
                gutterBottom
                sx={{ mb: 3 }}
              >
                Hành Trình Phát Triển
              </Typography>
              <Typography
                sx={{
                  mb: 3,
                  fontSize: "1.1rem",
                  lineHeight: 1.7,
                  color: "text.secondary",
                }}
              >
                Flower Shop được thành lập vào năm 2014 bởi một nhóm những người
                yêu thích hoa và muốn mang vẻ đẹp của thiên nhiên đến gần hơn
                với cuộc sống hàng ngày.
              </Typography>
              <Typography
                sx={{
                  mb: 3,
                  fontSize: "1.1rem",
                  lineHeight: 1.7,
                  color: "text.secondary",
                }}
              >
                Từ một cửa hàng nhỏ với vài nhân viên, chúng tôi đã không ngừng
                phát triển thành một trong những thương hiệu hoa tươi uy tín
                nhất, phục vụ hàng nghìn khách hàng trên toàn quốc.
              </Typography>
              <Typography
                sx={{
                  mb: 4,
                  fontSize: "1.1rem",
                  lineHeight: 1.7,
                  color: "text.secondary",
                }}
              >
                Chúng tôi tự hào là đối tác tin cậy trong những dịp quan trọng
                như sinh nhật, kỷ niệm, đám cưới, và nhiều sự kiện đặc biệt
                khác, luôn mang đến sự hài lòng tuyệt đối cho khách hàng.
              </Typography>
              <Paper
                elevation={2}
                sx={{ p: 3, borderRadius: 3, bgcolor: "grey.50" }}
              >
                <Grid container spacing={3}>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h3"
                        color="primary.main"
                        fontWeight={800}
                      >
                        10+
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={600}
                      >
                        Năm kinh nghiệm
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h3"
                        color="primary.main"
                        fontWeight={800}
                      >
                        5000+
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={600}
                      >
                        Khách hàng hài lòng
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h3"
                        color="primary.main"
                        fontWeight={800}
                      >
                        50+
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight={600}
                      >
                        Loại hoa khác nhau
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Team Section */}
      <Box sx={{ py: 8, bgcolor: "grey.50" }}>
        <Container maxWidth="lg">
          <Fade in timeout={1200}>
            <Box sx={{ textAlign: "center", mb: 6 }}>
              <Chip
                label="👥 Đội ngũ của chúng tôi"
                color="primary"
                sx={{ mb: 2, fontWeight: 600 }}
              />
              <Typography
                variant="h3"
                fontWeight={800}
                gutterBottom
                sx={{
                  background: "linear-gradient(45deg, #667eea, #764ba2)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  mb: 2,
                }}
              >
                Đội Ngũ Chuyên Nghiệp
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: 600, mx: "auto" }}
              >
                Gặp gỡ những người tạo nên sự khác biệt và thành công của Flower
                Shop
              </Typography>
            </Box>
          </Fade>

          <Grid container spacing={4} justifyContent="center">
            {[
              { name: "Phạm Xuân Hiếu", role: "Founder & CEO", img: TEAM_IMG },
              { name: "Phạm Hải Hà", role: "Creative Director", img: TEAM_IMG },
              {
                name: "Nguyễn Ngọc Diệp",
                role: "Head of Operations",
                img: TEAM_IMG,
              },
              {
                name: "Đặng Trung Hiếu",
                role: "Marketing Manager",
                img: TEAM_IMG,
              },
              {
                name: "Khuất Thị Mai Chi",
                role: "Customer Success",
                img: TEAM_IMG,
              },
            ].map((member, idx) => (
              <Grid
                key={idx}
                item
                xs={12}
                sm={6}
                md={4}
                lg={2.4}
                sx={{ display: "flex", justifyContent: "center" }}
              >
                <Grow in timeout={1000 + idx * 200}>
                  <Card
                    elevation={0}
                    sx={{
                      width: "100%",
                      maxWidth: 240,
                      borderRadius: 4,
                      overflow: "hidden",
                      background:
                        "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
                      border: "1px solid",
                      borderColor: "divider",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-12px)",
                        boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
                        borderColor: "primary.main",
                      },
                    }}
                  >
                    <Box sx={{ position: "relative", overflow: "hidden" }}>
                      <Avatar
                        src={member.img}
                        alt={member.name}
                        sx={{
                          width: "100%",
                          height: 280,
                          borderRadius: 0,
                          "& img": {
                            transition: "transform 0.3s ease",
                          },
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background:
                            "linear-gradient(transparent, rgba(0,0,0,0.7))",
                          p: 2,
                          color: "white",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ opacity: 0.9, fontSize: "0.75rem" }}
                        >
                          {member.role}
                        </Typography>
                      </Box>
                    </Box>
                    <CardContent sx={{ textAlign: "center", p: 3 }}>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{ color: "text.primary" }}
                      >
                        {member.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="primary.main"
                        fontWeight={600}
                      >
                        {member.role}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grow>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 8,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "common.white",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.2)",
            zIndex: 1,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
          <Fade in timeout={1500}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h3"
                fontWeight={900}
                gutterBottom
                sx={{ mb: 3 }}
              >
                Sẵn Sàng Tạo Nên Khoảnh Khắc Đặc Biệt?
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  opacity: 0.95,
                  mb: 5,
                  fontWeight: 300,
                  maxWidth: 700,
                  mx: "auto",
                }}
              >
                Hãy để chúng tôi giúp bạn thể hiện tình cảm qua những bó hoa
                tuyệt đẹp. Mỗi bông hoa đều chứa đựng một thông điệp yêu thương.
              </Typography>

              <Box sx={{ mb: 5 }}>
                <Grid container spacing={4} justifyContent="center">
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: "center" }}>
                      <PhoneIcon
                        fontSize="large"
                        sx={{ mb: 1, opacity: 0.9 }}
                      />
                      <Typography variant="h6" fontWeight={700}>
                        +84 123 456 789
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Hotline 24/7
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: "center" }}>
                      <EmailIcon
                        fontSize="large"
                        sx={{ mb: 1, opacity: 0.9 }}
                      />
                      <Typography variant="h6" fontWeight={700}>
                        support@flowershop.com
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Email hỗ trợ
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: "center" }}>
                      <LocationOnIcon
                        fontSize="large"
                        sx={{ mb: 1, opacity: 0.9 }}
                      />
                      <Typography variant="h6" fontWeight={700}>
                        Hà Nội, Việt Nam
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Trụ sở chính
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  gap: 3,
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  component={RouterLink}
                  to="/products"
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: "white",
                    color: "primary.main",
                    px: 5,
                    py: 2,
                    fontWeight: 700,
                    borderRadius: 3,
                    fontSize: "1.1rem",
                    "&:hover": {
                      bgcolor: "grey.100",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
                    },
                  }}
                >
                  🛒 Mua Ngay
                </Button>
                <Button
                  href="tel:+84123456789"
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: "white",
                    color: "white",
                    px: 5,
                    py: 2,
                    fontWeight: 700,
                    borderRadius: 3,
                    fontSize: "1.1rem",
                    borderWidth: 2,
                    "&:hover": {
                      borderColor: "white",
                      bgcolor: "rgba(255,255,255,0.1)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
                    },
                  }}
                >
                  📞 Liên Hệ Tư Vấn
                </Button>
              </Box>
            </Box>
          </Fade>
        </Container>
      </Box>
    </Box>
  );
};

export default About;
