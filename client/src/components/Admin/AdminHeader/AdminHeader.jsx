// src/components/Admin/AdminHeader/AdminHeader.jsx
import React, { useState, useEffect } from "react";
import { FaBars, FaTimes, FaChevronDown, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./AdminHeader.css";

const AdminHeader = ({ toggleSidebar, isSidebarOpen, isMobile }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [adminInfo, setAdminInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const adminData = localStorage.getItem("adminInfo");
    if (adminData) {
      setAdminInfo(JSON.parse(adminData));
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".admin-profile")) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");
    toast.success("Logged out successfully");
    navigate("/admin/login");
  };

  // Determine which icon to show
  // On mobile: show X when sidebar open, hamburger when closed
  // On desktop: show hamburger (toggles sidebar)
  const showClose = isMobile && isSidebarOpen;

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <button
          className={`menu-toggle-btn ${showClose ? "close-mode" : ""}`}
          onClick={toggleSidebar}
          aria-label={showClose ? "Close menu" : "Open menu"}
        >
          {showClose ? <FaTimes /> : <FaBars />}
        </button>
        <div className="header-welcome">
          <h2>Welcome back, {adminInfo?.email?.split("@")[0] || "Admin"}!</h2>
        </div>
      </div>

      <div className="admin-header-right">
        <div className="admin-profile">
          <button
            className="profile-btn"
            onClick={() => setShowDropdown((prev) => !prev)}
          >
            <div className="profile-avatar">
              {adminInfo?.email?.charAt(0).toUpperCase() || "A"}
            </div>
            <span className="profile-name">
              {adminInfo?.email?.split("@")[0] || "Admin"}
            </span>
            <FaChevronDown
              className={`dropdown-icon ${showDropdown ? "rotated" : ""}`}
            />
          </button>

          {showDropdown && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-avatar">
                  {adminInfo?.email?.charAt(0).toUpperCase() || "A"}
                </div>
                <div className="dropdown-info">
                  <h4>{adminInfo?.email?.split("@")[0] || "Admin"}</h4>
                  <p>{adminInfo?.email || "admin@example.com"}</p>
                </div>
              </div>
              <div className="dropdown-menu">
                <button
                  className="dropdown-item logout"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;