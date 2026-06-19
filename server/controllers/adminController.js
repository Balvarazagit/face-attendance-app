import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Attendance from "../models/Attendance.js";

// Existing functions...
export const registerAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const exists = await Admin.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Admin already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await Admin.create({ email, password: hashedPassword });
    res.status(201).json({ message: "Admin registered successfully", admin });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Invalid email" });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ message: "Login successful", token, admin: { id: admin._id, email: admin.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAttendance = await Attendance.countDocuments();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todayAttendance = await Attendance.countDocuments({
      date: { $gte: today, $lt: tomorrow }
    });
    
    // Calculate weekly growth
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const lastWeekAttendance = await Attendance.countDocuments({
      date: { $gte: twoWeeksAgo, $lt: lastWeek }
    });
    const thisWeekAttendance = await Attendance.countDocuments({
      date: { $gte: lastWeek, $lt: new Date() }
    });
    
    const weeklyGrowth = lastWeekAttendance > 0 
      ? ((thisWeekAttendance - lastWeekAttendance) / lastWeekAttendance * 100).toFixed(1)
      : 0;
    
    res.json({
      totalUsers,
      totalAttendance,
      todayAttendance,
      weeklyGrowth: parseFloat(weeklyGrowth)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== USER MANAGEMENT (Based on your model) ====================

// Get all users
export const getAllUsersAdmin = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    const users = await User.find(query)
      .select('-descriptor') // Exclude face descriptor for security
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single user
export const getUserByIdAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-descriptor');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create user (admin)
export const createUserAdmin = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    
    const existingUser = await User.findOne({ name });
    if (existingUser) {
      return res.status(400).json({ message: "User with this name already exists" });
    }
    
    // Create user without face descriptor (will be updated later)
    const user = await User.create({
      name,
      descriptor: [], // Empty array, will be updated when user registers with face
      avatar: null
    });
    
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user
export const updateUserAdmin = async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true, runValidators: true }
    ).select('-descriptor');
    
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete user
export const deleteUserAdmin = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Also delete all attendance records for this user
    await Attendance.deleteMany({ name: user.name });
    
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== ATTENDANCE MANAGEMENT ====================

// Get all attendance records
export const getAllAttendanceAdmin = async (req, res) => {
  try {

    const attendance = await Attendance.find()
      .sort({ date: -1 });

    res.json(attendance);

  } catch (error) {

    res.status(500).json({
      error: error.message,
    });

  }
};

// Delete attendance record
export const deleteAttendanceAdmin = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) return res.status(404).json({ message: "Attendance record not found" });
    res.json({ message: "Attendance record deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get attendance statistics
export const getAttendanceStatsAdmin = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const chartData = [];

    for (let i = 6; i >= 0; i--) {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - i);

      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      const presentCount = await Attendance.countDocuments({
        date: {
          $gte: start,
          $lt: end,
        },
      });

      chartData.push({
        day: start.toLocaleDateString("en-US", {
          weekday: "short",
        }),
        present: presentCount,
        absent: Math.max(totalUsers - presentCount, 0),
      });
    }

    res.json(chartData);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};