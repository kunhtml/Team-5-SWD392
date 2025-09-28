import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    console.log("📤 [API] Making request to:", config.baseURL + config.url);
    console.log("📤 [API] Request params:", config.params);
    console.log("📤 [API] Request method:", config.method?.toUpperCase());

    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔐 [API] Added authorization token");
    } else {
      console.log("⚠️ [API] No authorization token found");
    }
    return config;
  },
  (error) => {
    console.error("❌ [API] Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and logout on 401
api.interceptors.response.use(
  (response) => {
    console.log("📥 [API] Response received:", {
      url: response.config.url,
      status: response.status,
      statusText: response.statusText,
      dataKeys: Object.keys(response.data || {}),
      dataSize: JSON.stringify(response.data || {}).length,
    });
    return response;
  },
  (error) => {
    const skipErrorLogging = error.config?.skipErrorLogging;
    if (!skipErrorLogging) {
      console.error("❌ [API] Response error:", {
        url: error.config?.url,
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
        data: error.response?.data,
      });
    }

    if (error.response?.status === 401) {
      console.log(
        "🚪 [API] Unauthorized - removing token and redirecting to login"
      );
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
