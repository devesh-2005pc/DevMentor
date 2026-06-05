import axios from 'axios';

// Get and normalize API base URL
let apiBaseUrl = import.meta.env.VITE_API_URL || '/api';

// If it's a full URL and doesn't end with /api, append /api for routing backend calls correctly
if (apiBaseUrl && apiBaseUrl.startsWith('http') && !apiBaseUrl.endsWith('/api')) {
  apiBaseUrl = `${apiBaseUrl.replace(/\/$/, '')}/api`;
}

const API = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 60000, // 60 seconds timeout for slow AI generation requests
  headers: { 
    'Content-Type': 'application/json' 
  },
});

// Attach JWT token from localStorage to every request
API.interceptors.request.use(
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

// Global response error handler
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if response is 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login page if we aren't already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
