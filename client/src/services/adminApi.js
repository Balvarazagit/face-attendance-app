import axios from "axios";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;
const adminAPI = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
adminAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
adminAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminInfo");
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH APIS ====================
export const login = (credentials) => adminAPI.post("/admin/login", credentials);
export const register = (data) => adminAPI.post("/admin/register", data);

// ==================== DASHBOARD APIS ====================
export const getDashboardStats = () => adminAPI.get("/admin/dashboard");

// ==================== USER MANAGEMENT APIS ====================
export const getAllUsers = () => adminAPI.get("/admin/users");
export const getUserById = (id) => adminAPI.get(`/admin/users/${id}`);
export const createUser = (userData) => adminAPI.post("/admin/users", userData);
export const updateUser = (id, userData) => adminAPI.put(`/admin/users/${id}`, userData);
export const deleteUser = (id) => adminAPI.delete(`/admin/users/${id}`);

// ==================== ATTENDANCE MANAGEMENT APIS ====================
export const getAllAttendance = () => adminAPI.get("/admin/attendance");
export const deleteAttendance = (id) => adminAPI.delete(`/admin/attendance/${id}`);
export const getAttendanceStats = () => adminAPI.get("/admin/attendance/stats");

export default adminAPI;