import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Fade, Container, LinearProgress } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';

const LazyWelcome = ({ onProceed }) => {
  const [progress, setProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [showProgress, setShowProgress] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Animate progress from 0 to 100 over 3 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setShowProgress(false);
          // Show content after progress completes and bar hides
          setTimeout(() => setShowContent(true), 300);
          return 100;
        }
        return prev + 2; // Increment by 2% every 60ms for smooth 3s animation
      });
    }, 60);

    return () => clearInterval(interval);
  }, []);

  const handleProceed = () => {
    setIsVisible(false);
    setTimeout(() => {
      onProceed && onProceed();
    }, 500);
  };

  if (!isVisible) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `url('/images/109.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        // Dark overlay for text readability
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          zIndex: -1,
        },
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Heart Icon with heartbeat animation */}
        {showProgress && (
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <FavoriteIcon
              sx={{
                fontSize: '4rem',
                color: 'white',
                animation: 'heartbeat 1.5s ease-in-out infinite both',
                '@keyframes heartbeat': {
                  '0%': { transform: 'scale(1)' },
                  '14%': { transform: 'scale(1.3)' },
                  '28%': { transform: 'scale(1)' },
                  '42%': { transform: 'scale(1.3)' },
                  '70%': { transform: 'scale(1)' },
                },
              }}
            />
          </Box>
        )}

        {/* Progress Bar - hides after 100% */}
        {showProgress && (
          <Box sx={{ width: '100%', mb: 4 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(255,255,255,0.3)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: 'linear-gradient(90deg, #ffffff 0%, #f0f0f0 100%)',
                },
              }}
            />
            <Typography variant="body2" sx={{ textAlign: 'center', mt: 1, opacity: 0.8 }}>
              {Math.round(progress)}%
            </Typography>
          </Box>
        )}

        {/* Welcome Content - shows after progress */}
        <Fade in={showContent} timeout={800}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h2"
              fontWeight={900}
              gutterBottom
              sx={{
                fontSize: { xs: '2.5rem', md: '4rem' },
                lineHeight: 1.1,
                mb: 3,
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              Chào Mừng Bạn Đến Với Shop Của Chúng Tôi
            </Typography>
            <Typography
              variant="h5"
              sx={{
                mb: 4,
                opacity: 0.95,
                fontWeight: 300,
                maxWidth: 500,
                mx: 'auto',
                lineHeight: 1.4,
              }}
            >
              Khám phá thế giới hoa tươi tuyệt đẹp và dịch vụ chuyên nghiệp dành cho bạn.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleProceed}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 700,
                borderRadius: 3,
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'grey.100',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                },
              }}
            >
              Bắt Đầu Khám Phá
            </Button>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default LazyWelcome;
