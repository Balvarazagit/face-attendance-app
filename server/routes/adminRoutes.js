// adminRoutes.js
import express from "express";
import {
  registerAdmin,
  loginAdmin,
  getDashboardStats,
  getAllUsersAdmin,
  getUserByIdAdmin,
  createUserAdmin,
  updateUserAdmin,
  deleteUserAdmin,
  getAllAttendanceAdmin,
  deleteAttendanceAdmin,
  getAttendanceStatsAdmin
} from "../controllers/adminController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

// Protected routes
router.get("/dashboard", authMiddleware, getDashboardStats);

// User management routes (simplified for your model)
router.get("/users", authMiddleware, getAllUsersAdmin);
router.get("/users/:id", authMiddleware, getUserByIdAdmin);
router.post("/users", authMiddleware, createUserAdmin);
router.put("/users/:id", authMiddleware, updateUserAdmin);
router.delete("/users/:id", authMiddleware, deleteUserAdmin);

// Attendance management routes
router.get("/attendance", authMiddleware, getAllAttendanceAdmin);
router.delete("/attendance/:id", authMiddleware, deleteAttendanceAdmin);
router.get("/attendance/stats", authMiddleware, getAttendanceStatsAdmin);

export default router;