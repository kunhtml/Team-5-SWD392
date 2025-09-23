import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Stack,
} from "@mui/material";

const roles = [
  { value: "customer", label: "Customer" },
  { value: "florist", label: "Florist" },
  { value: "admin", label: "Admin" },
];

const statuses = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "banned", label: "Banned" },
];

export default function AdminUserEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "customer",
    status: "active",
    avatar_url: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/users/${id}`);
        setUser(res.data.user);
      } catch (e) {
        setError(e.response?.data?.message || "Failed to load user");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      const payload = {
        name: user.name,
        phone: user.phone,
        address: user.address,
        avatar_url: user.avatar_url,
        role: user.role,
        status: user.status,
      };
      await api.put(`/users/${id}`, payload);
      navigate("/admin");
    } catch (e) {
      setError(e.response?.data?.message || "Failed to save user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h5">Edit User #{id}</Typography>
          <Button variant="text" onClick={() => navigate(-1)}>
            Back
          </Button>
        </Stack>

        {loading ? (
          <Typography>Loading...</Typography>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Stack spacing={2}>
            <TextField
              label="ID"
              value={user.id}
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="Email"
              value={user.email}
              InputProps={{ readOnly: true }}
            />
            <TextField
              name="name"
              label="Name"
              value={user.name || ""}
              onChange={handleChange}
            />
            <TextField
              name="phone"
              label="Phone"
              value={user.phone || ""}
              onChange={handleChange}
            />
            <TextField
              name="address"
              label="Address"
              value={user.address || ""}
              onChange={handleChange}
            />
            <TextField
              name="avatar_url"
              label="Avatar URL"
              value={user.avatar_url || ""}
              onChange={handleChange}
            />
            <TextField
              select
              name="role"
              label="Role"
              value={user.role}
              onChange={handleChange}
            >
              {roles.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              name="status"
              label="Status"
              value={user.status}
              onChange={handleChange}
            >
              {statuses.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>

            <Stack direction="row" spacing={2} mt={2}>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button variant="outlined" onClick={() => navigate("/admin")}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        )}
      </Paper>
    </Box>
  );
}
