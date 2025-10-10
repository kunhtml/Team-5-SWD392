import React, { useEffect, useState } from "react";
import api from "../services/api";
import { uploadImageToFreeImage } from "../utils/uploadImage";
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
  TextField,
  Pagination,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from "@mui/material";

const FloristProducts = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
    category_id: "",
  });
  const [editForm, setEditForm] = useState({
    id: null,
    name: "",
    price: "",
    stock: "",
    description: "",
    category_id: "",
    image_url: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products/mine", {
        params: {
          page,
          limit: 10,
          search: search || undefined,
          status: status || undefined,
        },
      });
      setProducts(res.data.products || []);
      setPages(res.data.pages || 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data.categories || []);
    } catch (e) {
      console.error("Failed to load categories", e);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  useEffect(() => {
    if (openCreate) fetchCategories();
  }, [openCreate]);

  const resetCreate = () => {
    setForm({
      name: "",
      price: "",
      stock: "",
      description: "",
      category_id: "",
    });
    setImageFile(null);
    setError("");
  };

  const openEditDialog = (p) => {
    setEditForm({
      id: p.id,
      name: p.name || "",
      price: p.price != null ? String(p.price).replace(/\D/g, "") : "",
      stock: p.stock || "",
      description: p.description || "",
      category_id: p.category?.id || p.category_id || "",
      image_url: p.image_url || "",
    });
    setEditImageFile(null);
    setOpenEdit(true);
    fetchCategories();
  };

  const handleCreate = async () => {
    setSaving(true);
    setError("");
    try {
      const priceNum = parseInt(form.price, 10);
      if (!Number.isFinite(priceNum) || priceNum <= 0) {
        throw new Error("Giá phải là số nguyên dương");
      }
      let uploadedUrl = null;
      if (imageFile) {
        uploadedUrl = await uploadImageToFreeImage(imageFile);
      }

      const payload = {
        name: form.name,
        price: priceNum,
        stock: parseInt(form.stock, 10),
        description: form.description,
        category_id: parseInt(form.category_id, 10),
      };
      if (uploadedUrl) payload.image_url = uploadedUrl;

      await api.post("/products", payload);
      setOpenCreate(false);
      resetCreate();
      setPage(1);
      fetchData();
    } catch (e) {
      setError(
        e.response?.data?.message || e.message || "Không thể tạo sản phẩm"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEditSave = async () => {
    setSavingEdit(true);
    setError("");
    try {
      const priceNum = parseInt(editForm.price, 10);
      if (!Number.isFinite(priceNum) || priceNum <= 0) {
        throw new Error("Giá phải là số nguyên dương");
      }
      let uploadedUrl = null;
      if (editImageFile) {
        uploadedUrl = await uploadImageToFreeImage(editImageFile);
      }

      const payload = {
        name: editForm.name,
        price: priceNum,
        stock: parseInt(editForm.stock, 10),
        description: editForm.description,
        category_id: parseInt(editForm.category_id, 10),
      };
      if (uploadedUrl) payload.image_url = uploadedUrl;
      else if (editForm.image_url) payload.image_url = editForm.image_url;

      await api.put(`/products/${editForm.id}`, payload);
      setOpenEdit(false);
      setPage(1);
      fetchData();
    } catch (e) {
      setError(
        e.response?.data?.message || e.message || "Không thể cập nhật sản phẩm"
      );
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Sản phẩm của cửa hàng
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          size="small"
          label="Tìm kiếm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setPage(1);
              fetchData();
            }
          }}
        />
        <TextField
          size="small"
          label="Trạng thái"
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          placeholder="active/pending/hidden"
        />
        <Button
          variant="outlined"
          onClick={() => {
            setPage(1);
            fetchData();
          }}
        >
          Lọc
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" onClick={() => setOpenCreate(true)}>
          Tạo sản phẩm
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Tên</TableCell>
              <TableCell>Giá</TableCell>
              <TableCell>Tồn kho</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Duyệt</TableCell>
              <TableCell>Cập nhật</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.id}</TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>
                  {parseFloat(p.price).toLocaleString("vi-VN")} VNĐ
                </TableCell>
                <TableCell>{p.stock}</TableCell>
                <TableCell>
                  {p.status} / {p.moderation_status || "-"}
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => openEditDialog(p)}
                  >
                    Sửa
                  </Button>
                </TableCell>
                <TableCell>
                  {p.updatedAt
                    ? new Date(p.updatedAt).toLocaleString("vi-VN")
                    : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Stack alignItems="center" sx={{ mt: 2 }}>
        <Pagination count={pages} page={page} onChange={(_, p) => setPage(p)} />
      </Stack>

      <Dialog
        open={openCreate}
        onClose={() => {
          setOpenCreate(false);
          resetCreate();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Tạo sản phẩm</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && <Typography color="error">{error}</Typography>}
            <TextField
              label="Tên sản phẩm"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <TextField
              label="Danh mục"
              select
              value={form.category_id}
              onChange={(e) =>
                setForm({ ...form, category_id: e.target.value })
              }
              required
            >
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Giá"
              type="text"
              inputMode="numeric"
              value={form.price}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "");
                setForm({ ...form, price: v });
              }}
              required
              helperText="Chỉ nhập số, > 0"
            />
            <TextField
              label="Tồn kho"
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              required
            />
            <TextField
              label="Mô tả"
              multiline
              minRows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
            <Button variant="outlined" component="label">
              Chọn ảnh
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setImageFile(f);
                }}
              />
            </Button>
            {imageFile && (
              <Typography variant="body2" color="text.secondary">
                Ảnh đã chọn: {imageFile.name}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenCreate(false);
              resetCreate();
            }}
          >
            Hủy
          </Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving}>
            {saving ? "Đang lưu..." : "Tạo"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Sửa sản phẩm (sau khi lưu sẽ chờ duyệt)</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && <Typography color="error">{error}</Typography>}
            <TextField
              label="Tên sản phẩm"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
              required
            />
            <TextField
              label="Danh mục"
              select
              value={editForm.category_id}
              onChange={(e) =>
                setEditForm({ ...editForm, category_id: e.target.value })
              }
              required
            >
              {categories.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Giá"
              type="text"
              inputMode="numeric"
              value={editForm.price}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "");
                setEditForm({ ...editForm, price: v });
              }}
              required
              helperText="Chỉ nhập số, > 0"
            />
            <TextField
              label="Tồn kho"
              type="number"
              value={editForm.stock}
              onChange={(e) =>
                setEditForm({ ...editForm, stock: e.target.value })
              }
              required
            />
            <TextField
              label="Mô tả"
              multiline
              minRows={3}
              value={editForm.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
            />
            <Button variant="outlined" component="label">
              Chọn ảnh mới (tuỳ chọn)
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setEditImageFile(f);
                }}
              />
            </Button>
            <TextField
              label="Hoặc dán URL ảnh"
              placeholder="https://..."
              value={editForm.image_url || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, image_url: e.target.value })
              }
              fullWidth
            />
            {editImageFile && (
              <Typography variant="body2" color="text.secondary">
                Ảnh đã chọn: {editImageFile.name}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleEditSave}
            disabled={savingEdit}
          >
            {savingEdit ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FloristProducts;
