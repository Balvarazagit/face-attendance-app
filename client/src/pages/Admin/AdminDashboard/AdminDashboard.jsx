import React, { useState, useEffect } from "react";
import { FaUsers, FaCalendarCheck, FaChartLine, FaUserPlus, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import AdminSidebar from "../../../components/Admin/AdminSidebar/AdminSidebar.jsx";
import AdminHeader from "../../../components/Admin/AdminHeader/AdminHeader.jsx";
import { getDashboardStats, getAllUsers, getAttendanceStats } from "../../../services/adminApi.js";
import "./AdminDashboard.css";
import { NavLink, useNavigate } from "react-router-dom";
import AdminFooter from "../../../components/Admin/AdminFooter/AdminFooter";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAttendance: 0,
    todayAttendance: 0,
    weeklyGrowth: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [attendanceData, setAttendanceData] = useState([]);

  // Responsive: detect mobile and adjust sidebar default
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;

      setIsMobile(mobile);

      if (!mobile) {
        setSidebarOpen(true);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () =>
      window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchRecentUsers();
    fetchAttendanceChart();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentUsers = async () => {
    try {
      const response = await getAllUsers();
      setRecentUsers(response.data.slice(0, 5));
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchAttendanceChart = async () => {
    try {
      const response = await getAttendanceStats();
      setAttendanceData(response.data);
    } catch (error) {
      console.error("Chart Error:", error);
    }
  };

  const statCards = [
    { title: "Total Users", value: stats.totalUsers, icon: <FaUsers />, trend: "+12%", bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
    { title: "Total Attendance", value: stats.totalAttendance, icon: <FaCalendarCheck />, trend: "+8%", bg: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)" },
    { title: "Today's Attendance", value: stats.todayAttendance, icon: <FaChartLine />, trend: stats.weeklyGrowth >= 0 ? `+${stats.weeklyGrowth}%` : `${stats.weeklyGrowth}%`, bg: "linear-gradient(135deg, #10b981 0%, #059669 100%)" },
    { title: "Active Users", value: Math.floor(stats.totalUsers * 0.85), icon: <FaUserPlus />, trend: "+5%", bg: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)" },
  ];

  const pieData = [
    { name: "Present", value: attendanceData.reduce((sum, item) => sum + (item.present || 0), 0), color: "#10b981" },
    { name: "Absent",  value: attendanceData.reduce((sum, item) => sum + (item.absent  || 0), 0), color: "#ef4444" },
  ];

  // Content margin class
  const getContentClass = () => {
    if (isMobile) return "";
    return sidebarOpen ? "sidebar-open" : "sidebar-closed";
  };

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner" />
        <p>Loading Dashboard…</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <AdminSidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isMobile={isMobile}
        setIsMobile={setIsMobile}
      />

      <div className={`admin-main-content ${getContentClass()}`}>
        <AdminHeader
          toggleSidebar={handleToggleSidebar}
          isSidebarOpen={sidebarOpen}
          isMobile={isMobile}
        />

        <div className="dashboard-content">
          <div className="dashboard-header">
            <h1>Dashboard Overview</h1>
            <p>Welcome back! Here's what's happening with your attendance system today.</p>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            {statCards.map((stat, index) => (
              <div className="stat-card" key={index} style={{ background: stat.bg }}>
                <div className="stat-card-icon">{stat.icon}</div>
                <div className="stat-card-info">
                  <h3>{stat.title}</h3>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-trend">
                    {stat.trend.startsWith("+") ? <FaArrowUp /> : <FaArrowDown />}
                    <span style={{ color: stat.trend.startsWith("+") ? "#10b981" : "#ef4444" }}>
                      {stat.trend}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="charts-grid">
            <div className="chart-card">
              <h3>Weekly Attendance Overview</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="day" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip contentStyle={{ background: "#1e293b", border: "none", borderRadius: "8px", color: "white" }} />
                  <Bar dataKey="present" fill="#10b981" name="Present" />
                  <Bar dataKey="absent"  fill="#ef4444" name="Absent" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Attendance Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Users */}
          <div className="recent-users-card">
            <div className="card-header">
              <h3>Recently Registered Users</h3>
              <NavLink to="/admin/users">
                <button className="view-all-btn">View All</button>
              </NavLink>
            </div>
            <div className="users-list">
              {recentUsers.map((user, index) => (
                <div className="user-item" key={index}>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="user-avatar" />
                  ) : (
                    <div className="user-avatar-placeholder">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="user-info">
                    <h4>{user.name}</h4>
                    <p>Registered: {new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="user-status active">Active</span>
                </div>
              ))}
            </div>
          </div>

           <AdminFooter />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;