import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaSignInAlt, FaShieldAlt, FaSpinner } from "react-icons/fa";
import { MdAdminPanelSettings } from "react-icons/md";
import { toast } from "react-toastify";
import { login } from "../../../services/adminApi";
import "./AdminLogin.css";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await login({ email, password });
      
      if (response.data.token) {
        localStorage.setItem("adminToken", response.data.token);
        localStorage.setItem("adminInfo", JSON.stringify(response.data.admin));
        toast.success("Login successful! Redirecting...");
        
        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 1500);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-bg"></div>
      
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-logo">
            <MdAdminPanelSettings className="logo-icon" />
            <h1>FaceAttendPro</h1>
          </div>
          <div className="admin-badge">
            <FaShieldAlt /> Admin Portal
          </div>
        </div>

        <div className="admin-login-content">
          <h2>Welcome Back</h2>
          <p>Sign in to manage your attendance system</p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="off"
              />
            </div>

            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <>
                  <FaSpinner className="spinner" /> Authenticating...
                </>
              ) : (
                <>
                  <FaSignInAlt /> Login
                </>
              )}
            </button>
          </form>

          <div className="admin-footer-note">
            <p>🔐 Secure Admin Access Only</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;