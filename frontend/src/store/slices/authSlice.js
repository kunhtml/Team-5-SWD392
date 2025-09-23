import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

// Action để lấy thông tin user từ token đã lưu
export const fetchUserFromToken = createAsyncThunk(
  "auth/fetchUserFromToken",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue({ message: "No token found" });
      }

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await api.get("/auth/profile");

      return {
        user: response.data.user,
        token,
      };
    } catch (error) {
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
      return rejectWithValue(
        error.response?.data || { message: "Session expired" }
      );
    }
  }
);

// Action login
export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post("/auth/login", { email, password });

      // Lưu token ngay khi login thành công
      localStorage.setItem("token", response.data.token);
      api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.token}`;

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Action register
export const register = createAsyncThunk(
  "auth/register",
  async ({ name, email, password, phone, address }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
        phone,
        address,
      });

      // Lưu token ngay khi register thành công
      localStorage.setItem("token", response.data.token);
      api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.token}`;

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Thêm thunk để khôi phục session khi reload
export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return rejectWithValue({ message: "No token found" });
      }

      // Set token vào header trước khi gọi API
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await api.get("/auth/profile");

      return {
        token,
        user: response.data.user,
      };
    } catch (error) {
      // Nếu token không hợp lệ, xóa nó
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
      return rejectWithValue(
        error.response?.data || { message: "Session expired" }
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    isLoading: true, // Mặc định là loading để check token
    error: null,
    isInitialized: false, // Flag để kiểm tra đã check token lần đầu chưa
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
      delete api.defaults.headers.common["Authorization"];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      // Xử lý fetchUserFromToken
      .addCase(fetchUserFromToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserFromToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(fetchUserFromToken.rejected, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.user = null;
        state.token = null;
        state.error = action.payload?.message;
      })
      // Xử lý login
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload.message;
      })
      // Xử lý register
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(restoreSession.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${action.payload.token}`;
      })
      .addCase(restoreSession.rejected, (state, action) => {
        state.isLoading = false;
        state.token = null;
        state.user = null;
        localStorage.removeItem("token"); // Xóa token khỏi localStorage khi session không hợp lệ
        delete api.defaults.headers.common["Authorization"];
        state.error = action.payload?.message;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
