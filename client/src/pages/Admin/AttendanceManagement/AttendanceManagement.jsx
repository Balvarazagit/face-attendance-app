import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaFilter, FaDownload, FaCalendarAlt, FaSpinner, FaEye, FaTrash, FaCheckCircle, FaTimesCircle, FaChartLine, FaUsers, FaUserCheck, FaUserTimes, FaCamera, FaArrowLeft, FaArrowRight, FaPrint } from "react-icons/fa";
import { MdDateRange } from "react-icons/md";
import AdminSidebar from "../../../components/Admin/AdminSidebar/AdminSidebar.jsx";
import AdminHeader from "../../../components/Admin/AdminHeader/AdminHeader.jsx";
import { getAllAttendance, deleteAttendance } from "../../../services/adminApi.js";
import { toast } from "react-toastify";
import "./AttendanceManagement.css";
import Attendance from "../../../components/Attendance/Attendance";
import API from "../../../services/api";
import AdminFooter from "../../../components/Admin/AdminFooter/AdminFooter";

const AttendanceManagement = () => {
  const [attendance, setAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFaceAttendance, setShowFaceAttendance] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const printRef = useRef();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    fetchAttendance();
    fetchUsers();
  }, []);

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

  const getContentClass = () => {
    if (isMobile) return '';
    return sidebarOpen ? 'sidebar-open' : 'sidebar-closed';
  };

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const response = await getAllAttendance();
      const attendanceData = response.data.attendance || response.data;
      setAttendance(attendanceData);
      setFilteredAttendance(attendanceData);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      toast.error("Failed to fetch attendance records");
    } finally {
      setLoading(false);
    }
  };

  const filterAttendance = () => {
    let filtered = [...attendance];
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredAttendance(filtered);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to mark this attendance as absent?")) return;

    try {
      await deleteAttendance(id);
      setAttendance((prev) => prev.filter((item) => item._id !== id));
      toast.success("Attendance marked as absent");
    } catch (error) {
      toast.error("Failed to delete record");
    }
  };

  const exportToCSV = () => {
    const headers = ["Student Name", "Date", "Time", "Status"];
    const csvData = allUsersAttendance.map(user => [
      user.name,
      user.attendanceRecord ? new Date(user.attendanceRecord.date).toLocaleDateString() : "-",
      user.attendanceRecord ? new Date(user.attendanceRecord.date).toLocaleTimeString() : "-",
      user.status,
    ]);

    const csvContent = [headers, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export completed successfully");
  };

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Attendance Report - ${new Date(selectedDate).toLocaleDateString()}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 40px;
              background: white;
              color: #333;
            }
            
            .print-header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 3px solid #4caf50;
            }
            
            .print-header h1 {
              color: #2c3e50;
              font-size: 28px;
              margin-bottom: 10px;
            }
            
            .print-header p {
              color: #7f8c8d;
              font-size: 14px;
              margin: 5px 0;
            }
            
            .print-header .date-info {
              color: #3498db;
              font-size: 16px;
              font-weight: bold;
              margin-top: 10px;
            }
            
            .stats-summary {
              display: flex;
              justify-content: space-around;
              margin-bottom: 30px;
              padding: 20px;
              background: #f8f9fa;
              border-radius: 10px;
            }
            
            .stat-item {
              text-align: center;
            }
            
            .stat-item .stat-label {
              font-size: 12px;
              color: #7f8c8d;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            
            .stat-item .stat-value {
              font-size: 24px;
              font-weight: bold;
              color: #2c3e50;
              margin-top: 5px;
            }
            
            .print-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            
            .print-table th {
              background: #34495e;
              color: white;
              padding: 12px;
              text-align: left;
              font-size: 14px;
            }
            
            .print-table td {
              padding: 10px 12px;
              border-bottom: 1px solid #e0e0e0;
              font-size: 13px;
            }
            
            .print-table tr:hover {
              background: #f8f9fa;
            }
            
            .status-present {
              color: #27ae60;
              font-weight: bold;
            }
            
            .status-absent {
              color: #e74c3c;
              font-weight: bold;
            }
            
            .print-footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e0e0e0;
              font-size: 12px;
              color: #7f8c8d;
            }
            
            @media print {
              body {
                padding: 20px;
              }
              
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  const fetchUsers = async () => {
    const res = await API.get("/users");
    setUsers(res.data);
  };

  const allUsersAttendance = users.map((user) => {
    const attendanceRecord = attendance.find((record) => {
      const recordDate = new Date(record.date).toLocaleDateString("en-CA");
      return record.name === user.name && recordDate === selectedDate;
    });

    return {
      ...user,
      attendanceRecord,
      status: attendanceRecord ? "Present" : "Absent",
    };
  });

  const getAttendanceStats = () => {
    const total = users.length;
    const present = allUsersAttendance.filter((user) => user.status === "Present").length;
    const absent = total - present;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

    return { total, present, absent, percentage };
  };

  const stats = getAttendanceStats();

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setCurrentPage(1);
  };

  const filteredUsers = allUsersAttendance.filter((user) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="attendance-management-container">
      <AdminSidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isMobile={isMobile}
        setIsMobile={setIsMobile}
      />

      <div className={`attendance-main-content ${getContentClass()}`}>
        <AdminHeader
          toggleSidebar={handleToggleSidebar}
          isSidebarOpen={sidebarOpen}
          isMobile={isMobile}
        />
        
        <div className="attendance-content">
          {/* Header Section */}
          <div className="attendance-header-section no-print">
            <div className="header-left">
              <div className="page-title">
                <h1>Attendance Management</h1>
                <p>Track and manage student attendance records</p>
              </div>
            </div>
            <div className="header-actions">
              <button className="action-btn primary" onClick={() => setShowFaceAttendance(true)}>
                <FaCamera /> Mark Attendance
              </button>
              <button className="action-btn secondary" onClick={exportToCSV}>
                <FaDownload /> Export
              </button>
              <button className="action-btn secondary" onClick={handlePrint}>
                <FaPrint /> Print
              </button>
            </div>
          </div>

          {/* Hidden Print Section */}
          <div ref={printRef} style={{ display: 'none' }}>
            <div className="print-header">
              <h1>Attendance Report</h1>
              <p>Student Attendance Management System</p>
              <p className="date-info">
                Date: {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            <div className="stats-summary">
              <div className="stat-item">
                <div className="stat-label">Total Students</div>
                <div className="stat-value">{stats.total}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Present</div>
                <div className="stat-value" style={{ color: '#27ae60' }}>{stats.present}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Absent</div>
                <div className="stat-value" style={{ color: '#e74c3c' }}>{stats.absent}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Attendance Rate</div>
                <div className="stat-value" style={{ color: '#3498db' }}>{stats.percentage}%</div>
              </div>
            </div>
            
            <table className="print-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student Name</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {allUsersAttendance.map((user, index) => (
                  <tr key={user._id}>
                    <td>{index + 1}</td>
                    <td>{user.name}</td>
                    <td>
                      {user.attendanceRecord
                        ? new Date(user.attendanceRecord.date).toLocaleDateString()
                        : "-"}
                    </td>
                    <td>
                      {user.attendanceRecord
                        ? new Date(user.attendanceRecord.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : "-"}
                    </td>
                    <td className={user.status === "Present" ? "status-present" : "status-absent"}>
                      {user.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="print-footer">
              <p>Generated on: {new Date().toLocaleString()}</p>
              <p>This is a system-generated report. Please contact administrator for any discrepancies.</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card total">
              <div className="stat-icon-wrapper">
                <FaUsers />
              </div>
              <div className="stat-details">
                <h3>Total Students</h3>
                <div className="stat-number">{stats.total}</div>
              </div>
            </div>

            <div className="stat-card present">
              <div className="stat-icon-wrapper">
                <FaUserCheck />
              </div>
              <div className="stat-details">
                <h3>Present</h3>
                <div className="stat-number">{stats.present}</div>
              </div>
            </div>

            <div className="stat-card absent">
              <div className="stat-icon-wrapper">
                <FaUserTimes />
              </div>
              <div className="stat-details">
                <h3>Absent</h3>
                <div className="stat-number">{stats.absent}</div>
              </div>
            </div>

            <div className="stat-card rate">
              <div className="stat-icon-wrapper">
                <FaChartLine />
              </div>
              <div className="stat-details">
                <h3>Attendance Rate</h3>
                <div className="stat-number">{stats.percentage}%</div>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="filters-bar">
            <div className="search-box">
              <FaSearch />
              <input
                type="text"
                placeholder="Search by student name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            
            <div className="date-picker-wrapper">
              <FaCalendarAlt />
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
              />
            </div>

            <div className="date-info">
              <MdDateRange />
              <span>Showing attendance for: <strong>{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong></span>
            </div>
          </div>
          
          {/* Table Section */}
          <div className="table-container">
            {loading ? (
              <div className="loading-state">
                <FaSpinner className="spinner" />
                <p>Loading attendance records...</p>
              </div>
            ) : (
              <>
                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.length > 0 ? (
                      currentUsers.map((user) => (
                        <tr key={user._id}>
                          <td className="student-cell">
                            <div className="student-info">
                              {user.avatar ? (
                                <img
                                  src={user.avatar}
                                  alt={user.name}
                                  className="student-avatar"
                                />
                              ) : (
                                <div className="student-avatar-placeholder">
                                  {user.name?.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span className="student-name">{user.name}</span>
                            </div>
                          </td>
                          <td>
                            {user.attendanceRecord
                              ? new Date(user.attendanceRecord.date).toLocaleDateString()
                              : "-"}
                          </td>
                          <td>
                            {user.attendanceRecord
                              ? new Date(user.attendanceRecord.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : "-"}
                          </td>
                          <td>
                            {user.status === "Present" ? (
                              <span className="status-badge present">
                                <FaCheckCircle /> Present
                              </span>
                            ) : (
                              <span className="status-badge absent">
                                <FaTimesCircle /> Absent
                              </span>
                            )}
                          </td>
                          <td className="actions-cell">
                            <button
                              className="icon-btn view"
                              onClick={() => {
                                setSelectedRecord({
                                  ...user.attendanceRecord,
                                  name: user.name,
                                  status: user.status,
                                  avatar: user.avatar,
                                  email: user.email,
                                });
                                setShowModal(true);
                              }}
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                            {user.attendanceRecord && (
                              <button
                                className="icon-btn delete"
                                onClick={() => handleDelete(user.attendanceRecord._id)}
                                title="Mark Absent"
                              >
                                <FaTrash />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="empty-state">
                          <div className="empty-state-content">
                            <FaTimesCircle />
                            <p>No attendance records found</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Pagination */}
                {filteredUsers.length > itemsPerPage && (
                  <div className="pagination">
                    <button 
                      onClick={() => paginate(currentPage - 1)} 
                      disabled={currentPage === 1}
                      className="page-btn"
                    >
                      <FaArrowLeft /> Previous
                    </button>
                    <div className="page-numbers">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`page-number ${currentPage === number ? 'active' : ''}`}
                        >
                          {number}
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={() => paginate(currentPage + 1)} 
                      disabled={currentPage === totalPages}
                      className="page-btn"
                    >
                      Next <FaArrowRight />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

           <AdminFooter />
        </div>
      </div>

      {/* View Modal */}
      {showModal && selectedRecord && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Attendance Details</h2>
              <button className="close-modal" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="student-profile-section">
                {selectedRecord?.avatar ? (
                  <img
                    src={selectedRecord.avatar}
                    alt={selectedRecord.name}
                    className="student-profile-image"
                  />
                ) : (
                  <div className="student-profile-placeholder">
                    {selectedRecord?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <h3>{selectedRecord?.name}</h3>
                {selectedRecord?.email && <p className="student-email">{selectedRecord.email}</p>}
              </div>
              <div className="details-grid">
                <div className="detail-item">
                  <label>Status</label>
                  <span className={`status-text ${selectedRecord?.status === "Present" ? "present" : "absent"}`}>
                    {selectedRecord?.status}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Date</label>
                  <span>
                    {selectedRecord?.date
                      ? new Date(selectedRecord.date).toLocaleDateString()
                      : "No Record"}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Time</label>
                  <span>
                    {selectedRecord?.date
                      ? new Date(selectedRecord.date).toLocaleTimeString()
                      : "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Face Attendance Modal */}
      {showFaceAttendance && (
        <div className="modal-overlay" onClick={() => setShowFaceAttendance(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Face Recognition Attendance</h2>
              <button className="close-modal" onClick={() => setShowFaceAttendance(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="date-selector">
                <label>Attendance Select Date</label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
              <Attendance attendanceDate={attendanceDate}/>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default AttendanceManagement;