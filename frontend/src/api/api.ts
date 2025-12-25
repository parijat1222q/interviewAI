import axios, { AxiosError } from "axios";

// Determine base URL:
// - Prefer Vite-style VITE_API_URL
// - Fallback to CRA-style REACT_APP_API_URL
// - Finally default to local backend
const envBaseUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.REACT_APP_API_URL ||
  "http://localhost:5000";

export const API_BASE_URL = envBaseUrl.replace(/\/+$/, "");

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
});

// Attach JWT from localStorage if present
api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem("token") || window.sessionStorage.getItem("token");
  if (token && !config.headers?.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Basic error handling and 401 handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; message?: string }>) => {
    if (error.response?.status === 401) {
      // Clear token on unauthorized so user can be forced to re-login
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

export default api;


