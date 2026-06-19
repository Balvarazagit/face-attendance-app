import React, { useState, useEffect, useRef } from "react";
import { FaPlus, FaSearch, FaSpinner, FaTrash, FaEdit } from "react-icons/fa";
import { MdDelete, MdEdit } from "react-icons/md";
import AdminSidebar from "../../../components/Admin/AdminSidebar/AdminSidebar.jsx";
import AdminHeader from "../../../components/Admin/AdminHeader/AdminHeader.jsx";
import { getAllUsers, createUser, updateUser, deleteUser } from "../../../services/adminApi.js";
import { toast } from "react-toastify";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import "./UsersManagement.css";
import API from "../../../services/api";
import AdminFooter from "../../../components/Admin/AdminFooter/AdminFooter";

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: "" });
  const webcamRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
    };
    loadModels();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getContentClass = () => {
    if (isMobile) return "";
    return sidebarOpen ? "sidebar-open" : "sidebar-closed";
  };

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const registerFaceUser = async () => {
    try {
      if (!formData.name) { toast.error("Enter user name"); return; }
      setLoading(true);
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) { toast.error("Camera not ready"); return; }
      const img = await faceapi.fetchImage(imageSrc);
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();
      if (!detection) { toast.error("Face not detected"); return; }
      const descriptor = Array.from(detection.descriptor);
      await API.post("/users/register", { name: formData.name, descriptor, avatar: imageSrc });
      toast.success("Face User Registered Successfully");
      fetchUsers();
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllUsers();
      const usersData = Array.isArray(response.data) ? response.data : [];
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) { toast.error("Name is required"); return; }
    setLoading(true);
    try {
      if (editingUser) {
        await updateUser(editingUser._id, { name: formData.name });
        toast.success("User updated successfully");
      } else {
        await createUser({ name: formData.name });
        toast.success("User created successfully");
      }
      fetchUsers();
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure? This will also delete all attendance records.")) {
      try {
        await deleteUser(id);
        toast.success("User deleted successfully");
        fetchUsers();
      } catch {
        toast.error("Failed to delete user");
      }
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({ name: "" });
  };

  return (
    <div className="users-management-container">
      <AdminSidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isMobile={isMobile}
        setIsMobile={setIsMobile}
      />

      <div className={`users-main-content ${getContentClass()}`}>
        <AdminHeader
          toggleSidebar={handleToggleSidebar}
          isSidebarOpen={sidebarOpen}
          isMobile={isMobile}
        />

        <div className="users-content">
          <div className="users-header">
            <div>
              <h1>Users Management</h1>
              <p>Manage all registered users in the system</p>
            </div>
            <button
              className="add-user-btn"
              onClick={() => { resetForm(); setShowModal(true); }}
            >
              <FaPlus /> Add New User
            </button>
          </div>

          <div className="users-search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-results-count">{filteredUsers.length} users found</span>
          </div>

          <div className="users-table-wrapper">
            {loading ? (
              <div className="users-loading">
                <FaSpinner className="spinner" />
                <p>Loading users…</p>
              </div>
            ) : (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Avatar</th>
                    <th>Name</th>
                    <th>Registered On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td className="avatar-cell-user">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="user-avatar-img" />
                        ) : (
                          <div className="user-avatar-placeholder-small">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </td>
                      <td className="name-cell-user">{user.name}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="actions-cell-user">
                        <button className="edit-btn" onClick={() => {
                          setEditingUser(user);
                          setFormData({ name: user.name });
                          setShowModal(true);
                        }}>
                          <MdEdit />
                        </button>
                        <button className="delete-btn" onClick={() => handleDelete(user._id)}>
                          <MdDelete />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
           <AdminFooter />
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => { resetForm(); setShowModal(false); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingUser ? "Edit User" : "Add New User"}</h2>
              <button className="close-modal" onClick={() => { resetForm(); setShowModal(false); }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                />
                {!editingUser && (
                  <div className="face-register-section">
                    <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="register-webcam" />
                    <small>📷 Position your face in the center and click "Register Face User"</small>
                  </div>
                )}
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                {editingUser ? (
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? <FaSpinner className="spinner" /> : "Update User"}
                  </button>
                ) : (
                  <>
                    <button type="submit" className="submit-btn" disabled={loading}>
                      {loading ? <FaSpinner className="spinner" /> : "Create User Only"}
                    </button>
                    <button type="button" className="submit-btn register-face-btn" onClick={registerFaceUser} disabled={loading}>
                      {loading ? <FaSpinner className="spinner" /> : "Register Face User"}
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;