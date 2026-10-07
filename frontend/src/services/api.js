import axios from "axios";

// Central API Configuration for Frontend
// Uses VITE_API_URL environment variable in production, falling back to http://127.0.0.1:8000 in development.

const getRawApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim() !== "") {
    return envUrl.trim();
  }
  return "http://127.0.0.1:8000";
};

const rawUrl = getRawApiUrl().replace(/\/+$/, "");

// Normalize API_BASE_URL so it does not duplicate trailing /api if present in VITE_API_URL
export const API_BASE_URL = rawUrl.endsWith("/api")
  ? rawUrl.slice(0, -4)
  : rawUrl;

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request Interceptor: Automatically attach Bearer token to request headers if available
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized globally for expired/invalid tokens
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      // Exclude authentication endpoints/pages from automatic session wipe & redirect
      if (currentPath !== "/login" && currentPath !== "/register" && currentPath !== "/") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

