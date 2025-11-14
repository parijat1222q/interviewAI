import axios from 'axios';

// Create axios instance with base config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000, // 30 second timeout for AI calls
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    const message = error.response?.data?.error || error.message || 'An error occurred';
    console.error('API Error:', message);
    
    return Promise.reject(error);
  }
);

export default api;