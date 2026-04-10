import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import "./App.css"; 
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import AttendancePage from "./pages/AttendancePage/AttendancePage";
import HomePage from "./pages/HomePage/HomePage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <div className="header-content">
            <div className="logo-section">
              <div className="logo-icon">👤</div>
              <h1 className="app-title">FaceAttend<span>Pro</span></h1>
            </div>
            
            <nav className="navigation">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  isActive ? "nav-link active" : "nav-link"
                }
                end
              >
                <span className="nav-icon">🏠</span>
                <span>Dashboard</span>
              </NavLink>
              <NavLink 
                to="/register" 
                className={({ isActive }) => 
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <span className="nav-icon">📝</span>
                <span>Register</span>
              </NavLink>
              <NavLink 
                to="/attendance" 
                className={({ isActive }) => 
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <span className="nav-icon">✅</span>
                <span>Mark Attendance</span>
              </NavLink>
            </nav>
          </div>
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <div className="footer-content">
            <p>© 2024 FaceAttendPro | Secure Face Recognition System</p>
            <div className="footer-links">
              <span>🔒 Secure</span>
              <span>⚡ Fast</span>
              <span>🎯 Accurate</span>
            </div>
          </div>
        </footer>
      </div>
       <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default App;