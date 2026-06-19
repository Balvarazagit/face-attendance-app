import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from "react-router-dom";
import "./App.css"; 
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import AttendancePage from "./pages/AttendancePage/AttendancePage";
import HomePage from "./pages/HomePage/HomePage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import InstallButton from "./components/InstallButton/InstallButton";

// Admin Imports
import AdminLogin from "./pages/Admin/AdminLogin/AdminLogin.jsx";
import AdminDashboard from "./pages/Admin/AdminDashboard/AdminDashboard.jsx";
import UsersManagement from "./pages/Admin/UsersManagement/UsersManagement.jsx";
import AttendanceManagement from "./pages/Admin/AttendanceManagement/AttendanceManagement.jsx";
import AdminProtectedRoute from "./components/Admin/AdminProtectedRoute";
import logo from "./assests/logo.png";
// Component to conditionally show header and footer
const Layout = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  return (
    <div className="app-container">
      {!isAdminRoute && (
        <header className="app-header">
          <div className="header-content">
            <div className="logo-section">
              <img
                src={logo}
                alt="FaceAttendPro Logo"
                className="logo-image"
              />

              <h1 className="app-title">
                FaceAttend<span>Pro</span>
              </h1>
            </div>
            
            <nav className="navigation">
              <NavLink 
                to="/admin/login" 
                className={({ isActive }) => 
                  isActive ? "nav-link active" : "nav-link"
                }
                end
              >
                <span className="nav-icon">🏠</span>
                <span>Admin</span>
              </NavLink>
            </nav>
          </div>
        </header>
      )}
      
      <main className={!isAdminRoute ? "main-content" : "admin-main-content"}>
        {children}
      </main>
      
      {!isAdminRoute && (
        <footer className="app-footer">
          <div className="footer-content">
            <p>© 2026 FaceAttendPro | Secure Face Recognition System |&nbsp;
              <a
                href="https://portfolio-mxf7.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                style={{textDecoration:"none", color:"white"}}
              >
                Balva.dev
              </a>
            </p>
            <div className="footer-links">
              <span>🔒 Secure</span>
              <span>⚡ Fast</span>
              <span>🎯 Accurate</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

function App() {
  return (
    <Router>
      <InstallButton />
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <AdminProtectedRoute>
              <UsersManagement />
            </AdminProtectedRoute>
          } />
          <Route path="/admin/attendance" element={
            <AdminProtectedRoute>
              <AttendanceManagement />
            </AdminProtectedRoute>
          } />
        </Routes>
      </Layout>
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default App;