import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Divider,
} from "@mui/material";

export default function ShopDetail() {
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchShop = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/shops/${id}`);
        setShop(res.data.shop);
      } catch (e) {
        setError(e.response?.data?.message || "Failed to load shop");
      } finally {
        setLoading(false);
      }
    };
    fetchShop();
  }, [id]);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!shop) return <Typography>Shop not found</Typography>;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        {shop.name}
      </Typography>
      <Chip label={`Florist: ${shop.florist?.name || "N/A"}`} sx={{ mr: 1 }} />
      <Chip label={`Rating: ${shop.rating ?? 0}`} color="primary" />
      <Typography variant="body1" sx={{ mt: 2 }}>
        {shop.description}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {shop.address}
      </Typography>

      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" gutterBottom>
        Sản phẩm
      </Typography>

      <Grid container spacing={2}>
        {(shop.products || []).map((p) => (
          <Grid item xs={12} sm={6} md={4} key={p.id}>
            <Card>
              <CardMedia
                component="img"
                height="180"
                image={p.image_url || "/placeholder-flower.jpg"}
                alt={p.name}
              />
              <CardContent>
                <Typography
                  variant="subtitle1"
                  component={Link}
                  to={`/products/${p.id}`}
                  sx={{
                    textDecoration: "none",
                    color: "inherit",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  {p.name}
                </Typography>
                <Typography color="primary">
                  {parseFloat(p.price).toLocaleString("vi-VN")} VNĐ
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
