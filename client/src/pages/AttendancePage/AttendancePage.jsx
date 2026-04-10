import React from "react";
import Attendance from "../../components/Attendance/Attendance";
import "./AttendancePage.css";

const AttendancePage = () => {
  return (
    <div className="attendance-page">
    <div className="attendance-container">
      <div className="attendance-header">
        <h2>Attendance Page</h2>
      </div>
      <div className="attendance-content">
        <Attendance />
      </div>
    </div>
  </div>
  );
};

export default AttendancePage;