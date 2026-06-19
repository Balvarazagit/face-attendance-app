// src/components/Admin/AdminSidebar/AdminSidebar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUsers,
  FaCalendarCheck,
  FaSignOutAlt,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { toast } from "react-toastify";
import "./AdminSidebar.css";

const AdminSidebar = ({ isOpen, setIsOpen, isMobile, setIsMobile }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    toast.success("Logged out successfully");
    navigate("/admin/login");
  };

  const menuItems = [
    { path: "/admin/dashboard", icon: <FaTachometerAlt />, label: "Dashboard" },
    { path: "/admin/users",     icon: <FaUsers />,         label: "Users" },
    { path: "/admin/attendance",icon: <FaCalendarCheck />, label: "Attendance" },
  ];

  // Close sidebar when a nav link is clicked on mobile
  const handleNavClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  // Determine sidebar class
  const getSidebarClass = () => {
    if (isMobile) {
      return isOpen ? "admin-sidebar mobile-open" : "admin-sidebar";
    }
    // Desktop
    return isOpen ? "admin-sidebar" : "admin-sidebar hidden";
  };

  return (
    <>
      {/* Dim overlay — mobile only, shown when sidebar is open */}
      {isMobile && isOpen && (
        <div
          className="sidebar-overlay active"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={getSidebarClass()} aria-label="Admin navigation">
        {/* Logo row */}
        <div className="sidebar-header">
          <div className="logo">
            <MdDashboard className="logo-icon" aria-hidden="true" />
            <span>FaceAttendPro</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
              onClick={handleNavClick}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

      </aside>
    </>
  );
};

export default AdminSidebar;