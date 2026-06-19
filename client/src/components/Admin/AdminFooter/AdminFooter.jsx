// AdminFooter.jsx
import React from "react";
import { FaHeart, FaExternalLinkAlt, FaCode } from "react-icons/fa";
import "./AdminFooter.css";

const AdminFooter = () => {
  return (
    <footer className="admin-footer">
      <div className="footer-content">

        <div className="footer-brand">
          <div className="footer-logo">
            <FaCode />
          </div>

          <div className="footer-text">
            <h4>Face Attendance System</h4>

            <p>
              Designed & Developed with
              <FaHeart className="heart-icon" />
              by
              <a
                href="https://portfolio-mxf7.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Balva.dev
                <FaExternalLinkAlt />
              </a>
            </p>
          </div>
        </div>

        <div className="footer-copyright">
          © {new Date().getFullYear()} All Rights Reserved
        </div>

      </div>
    </footer>
  );
};

export default AdminFooter;