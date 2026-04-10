import React from "react";
import Register from "../../components/Register/Register";
import "./RegisterPage.css";

const RegisterPage = () => {
  return (
     <div className="register-page">
    <div className="register-container">
      <div className="register-header">
        <h2>Register Page</h2>
      </div>
      <div className="register-content">
        <Register />
      </div>
    </div>
  </div>
  );
};

export default RegisterPage;