import React, { useEffect, useState } from "react";
import { FaUsers, FaCheckCircle, FaTimesCircle, FaChartLine, FaTrash, FaClock, FaUserCircle, FaCalendarAlt, FaInfoCircle } from "react-icons/fa";
import { MdDelete, MdAccessTime } from "react-icons/md";
import { GiCheckMark } from "react-icons/gi";
import API from "../../services/api";
import "./HomePage.css";
import { toast } from "react-toastify";

const HomePage = () => {
  const [users, setUsers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
    fetchData(today);
  }, []);

  const fetchData = async (date) => {
    await Promise.all([fetchUsers(), fetchAttendance(date)]);
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await API.get("/users");
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users data");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchAttendance = async (date) => {
    setLoadingAttendance(true);
    try {
      const res = await API.get(`/attendance?date=${date}`);
      setAttendance(res.data);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      toast.error("Failed to fetch attendance data");
    } finally {
      setLoadingAttendance(false);
    }
  };

  const handleDateChange = async (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setLoading(true);
    await fetchAttendance(date);
    setLoading(false);
  };

  const checkAttendance = (name) => {
    return attendance.some((a) => {
      const dbDate = new Date(a.date).toISOString().split("T")[0];
      return a.name === name && dbDate === selectedDate;
    });
  };

  const getAttendanceStats = () => {
    const total = users.length;
    const present = users.filter(user => checkAttendance(user.name)).length;
    const absent = total - present;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
    return { total, present, absent, percentage };
  };

  const stats = getAttendanceStats();

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this attendance?")) return;

    try {
      await API.delete(`/attendance/${id}`);
      fetchAttendance(selectedDate);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete attendance");
    }
  };

  return (
    <div className="attendance-dashboard">
      {loading && (
        <div className="loader-overlay">
          <div className="loader-container">
            <div className="loader-spinner"></div>
            <div className="loader-text">Loading Attendance Data...</div>
            <div className="loader-subtext">Fetching records for {selectedDate}</div>
          </div>
        </div>
      )}

      <h2 className="dashboard-title">
        <FaChartLine /> Attendance Dashboard
      </h2>

      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon"><FaUsers /></div>
          <div className="stat-info">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Students</div>
          </div>
        </div>
        <div className="stat-card present">
          <div className="stat-icon"><FaCheckCircle /></div>
          <div className="stat-info">
            <div className="stat-value">{stats.present}</div>
            <div className="stat-label">Present</div>
          </div>
        </div>
        <div className="stat-card absent">
          <div className="stat-icon"><FaTimesCircle /></div>
          <div className="stat-info">
            <div className="stat-value">{stats.absent}</div>
            <div className="stat-label">Absent</div>
          </div>
        </div>
        <div className="stat-card percentage">
          <div className="stat-icon"><FaChartLine /></div>
          <div className="stat-info">
            <div className="stat-value">{stats.percentage}%</div>
            <div className="stat-label">Attendance Rate</div>
          </div>
        </div>
      </div>

      {/* Date Picker */}
      <div className="date-picker-container">
        <label className="date-label"><FaCalendarAlt /> Select Date</label>
        <input
          className="date-input"
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          disabled={loadingAttendance}
        />
      </div>

      {/* Users Table */}
      <div className="table-wrapper">
        {(loadingUsers || loadingAttendance) && !loading ? (
          <div className="table-loading">
            <div className="table-spinner"></div>
            <p>Loading data...</p>
          </div>
        ) : (
          <table className="attendance-table">
            <thead>
              <tr>
                <th><FaUserCircle /> Avatar</th>
                <th>Name</th>
                <th><FaCheckCircle /> Status</th>
                <th><MdAccessTime /> Time</th>
                <th><FaTrash /> Action</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">
                    <div className="empty-icon"><FaUsers /></div>
                    <p>No users registered yet</p>
                    <small>Please register users first</small>
                  </td>
                </tr>
              ) : (
                users.map((user, index) => {
                  const isPresent = checkAttendance(user.name);
                  const attendanceRecord = attendance.find(a => a.name === user.name);
                  const attendanceTime = attendanceRecord ? new Date(attendanceRecord.updatedAt).toLocaleTimeString() : null;

                  return (
                    <tr key={index} className={isPresent ? "present-row" : "absent-row"}>
                      <td className="avatar-cell">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="avatar-img"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/50?text=User";
                            }}
                          />
                        ) : (
                          <div className="avatar-placeholder">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </td>
                      <td className="name-cell">{user.name}</td>
                      <td className="status-cell">
                        {isPresent ? (
                          <span className="status-badge present-badge">
                            <FaCheckCircle className="status-icon" /> Present
                          </span>
                        ) : (
                          <span className="status-badge absent-badge">
                            <FaTimesCircle className="status-icon" /> Absent
                          </span>
                        )}
                      </td>
                      <td className="time-cell">
                        {attendanceTime ? (
                          <span className="time-badge">
                            <FaClock /> {attendanceTime}
                          </span>
                        ) : (
                          <span className="time-placeholder">—</span>
                        )}
                      </td>
                      <td>
                        {attendanceRecord && (
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(attendanceRecord._id)}
                          >
                            <MdDelete /> Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Progress Bar */}
      {users.length > 0 && !loadingUsers && (
        <div className="progress-section">
          <div className="progress-label">
            <span>Today's Attendance Progress</span>
            <span>{stats.percentage}%</span>
          </div>
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${stats.percentage}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="dashboard-footer">
        <div className="info-message">
          <FaInfoCircle />
          <p>Showing attendance records for {new Date(selectedDate + "T00:00:00").toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;