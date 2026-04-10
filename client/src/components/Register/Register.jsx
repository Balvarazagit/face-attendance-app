import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import "./Register.css";
import { toast } from "react-toastify";

const Register = () => {
  const webcamRef = useRef(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    setLoading(true);
    try {
      const MODEL_URL = "/models";
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      console.log("Models Loaded");
      setModelsLoaded(true);
    } catch (error) {
      console.error("Error loading models:", error);
      toast.error("Failed to load face detection models. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const capture = async () => {
    try {
      if (!name) {
        toast.error("Please enter name");
        return;
      }

      if (!modelsLoaded) {
        toast.error("Face detection models are still loading. Please wait...");
        return;
      }

      setLoading(true);

      const imageSrc = webcamRef.current.getScreenshot();

      const img = await faceapi.fetchImage(imageSrc);

      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        toast.error("Face not detected! Please ensure your face is clearly visible.");
        setLoading(false);
        return;
      }

      const descriptor = Array.from(detection.descriptor);

      console.log("Sending Data:", { name, descriptor });
      console.log("Descriptor Length:", descriptor.length);

      // API Call with loader
      const res = await API.post("/users/register", {
        name,
        descriptor,
        avatar: imageSrc
      });

      toast.success(res.data.message || "User Registered ✅");
      navigate("/attendance");

    } catch (error) {
      console.error("REGISTER ERROR:", error);

      const msg =
        error.response?.data?.message ||
        "Something went wrong ❌";

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-component">
      {loading && (
        <div className="loader-overlay">
          <div className="loader-container">
            <div className="loader-spinner"></div>
            <div className="loader-text">Processing registration...</div>
            <div className="loader-subtext">Please don't close the page</div>
          </div>
        </div>
      )}
      
      <h2 className="component-title">Register User</h2>
      
      <div className="name-input-container">
        <input
          type="text"
          placeholder="Enter Name"
          onChange={(e) => setName(e.target.value)}
          className="name-input"
          disabled={loading}
        />
      </div>
      
      <div className="webcam-section">
        <Webcam 
          ref={webcamRef} 
          className="webcam-feed" 
          screenshotFormat="image/jpeg"
          mirrored={true}
        />
        {!modelsLoaded && !loading && (
          <div className="webcam-overlay">
            Loading face detection models...
          </div>
        )}
      </div>
      
      <button 
        className="register-btn" 
        onClick={capture}
        disabled={loading || !modelsLoaded}
      >
        {loading ? (
          <>
            <span className="btn-spinner"></span>
            Registering...
          </>
        ) : (
          "Register"
        )}
      </button>
    </div>
  );
};

export default Register;