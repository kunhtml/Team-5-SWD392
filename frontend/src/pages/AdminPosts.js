import React, { useEffect, useState } from "react";
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
  TextField,
  InputAdornment,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import api from "../services/api";

const statusTabs = [
  { label: "Đang chờ duyệt", value: "pending" },
  { label: "Đã duyệt", value: "approved" },
  { label: "Đã từ chối", value: "rejected" },
];

export default function AdminPosts() {
  const [tab, setTab] = useState(0);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [shopId, setShopId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);

  const moderation = statusTabs[tab].value;

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const loadCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data.categories || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRows = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products/moderation", {
        params: {
          moderation_status: moderation,
          search: search || undefined,
          shop_id: shopId || undefined,
          category_id: categoryId || undefined,
          limit: 20,
          page: 1,
        },
      });
      setRows(res.data.products || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (id, action) => {
    try {
      await api.put(`/products/${id}/moderate`, { action });
      fetchRows();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Quản lý bài đăng của shop
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        {statusTabs.map((t) => (
          <Tab key={t.value} label={t.label} />
        ))}
      </Tabs>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          placeholder="Tìm theo tên/mô tả"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton aria-label="search" onClick={fetchRows}>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ width: { xs: "100%", sm: 320 } }}
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="category-select">Danh mục</InputLabel>
          <Select
            labelId="category-select"
            label="Danh mục"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Shop ID"
          size="small"
          value={shopId}
          onChange={(e) => setShopId(e.target.value)}
          sx={{ width: 140 }}
        />
        <IconButton onClick={fetchRows} title="Làm mới">
          <RefreshIcon />
        </IconButton>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Ảnh</TableCell>
              <TableCell>Tên</TableCell>
              <TableCell>Shop</TableCell>
              <TableCell>Danh mục</TableCell>
              <TableCell>Giá</TableCell>
              <TableCell>Tồn kho</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Duyệt</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((p) => (
              <TableRow key={p.id} hover>
                <TableCell>{p.id}</TableCell>
                <TableCell>
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.name}
                      style={{
                        width: 48,
                        height: 48,
                        objectFit: "cover",
                        borderRadius: 4,
                      }}
                    />
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.shop?.name}</TableCell>
                <TableCell>{p.category?.name}</TableCell>
                <TableCell>
                  {Number(p.price).toLocaleString("vi-VN")} ₫
                </TableCell>
                <TableCell>{p.stock}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      size="small"
                      label={p.moderation_status}
                      color={
                        p.moderation_status === "approved"
                          ? "success"
                          : p.moderation_status === "pending"
                          ? "warning"
                          : "error"
                      }
                    />
                    <Chip size="small" label={p.status} />
                  </Stack>
                </TableCell>
                <TableCell>
                  {p.moderation_status === "pending" ? (
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => handleModerate(p.id, "approve")}
                      >
                        Duyệt
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleModerate(p.id, "reject")}
                      >
                        Từ chối
                      </Button>
                    </Stack>
                  ) : (
                    <Button size="small" onClick={() => setTab(0)}>
                      Chuyển đến chờ duyệt
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  {loading ? "Đang tải..." : "Không có dữ liệu"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
