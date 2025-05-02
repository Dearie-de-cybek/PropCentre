import axios from "axios";

// Base API configuration
const API_URL = "http://127.0.0.1:8000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => {
    // Return the response data if successful
    if (response.data) {
      return response.data;
    }
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with an error status
      if (error.response.status === 401) {
        // Unauthorized - token expired or invalid
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Optionally redirect to login
        // window.location.href = "/login";
      }

      // Return a standardized error format
      return Promise.reject({
        status: error.response.status,
        message: error.response.data?.message || "An error occurred",
        data: error.response.data,
      });
    } else if (error.request) {
      // No response received from server
      return Promise.reject({
        status: 0,
        message: "Network error. Please check your connection.",
        data: null,
      });
    } else {
      // Something happened in setting up the request
      return Promise.reject({
        status: 0,
        message: error.message || "An unexpected error occurred",
        data: null,
      });
    }
  }
);

export default api;
