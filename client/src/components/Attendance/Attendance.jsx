import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import API from "../../services/api";
import "./Attendance.css";
import { toast } from "react-toastify";

const Attendance = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [recognizedFaces, setRecognizedFaces] = useState([]);

  useEffect(() => {
    loadModels();
    fetchUsers();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (modelsLoaded && users.length > 0) {
        detectFaces();
      }
    }, 700);

    return () => clearInterval(interval);
  }, [users, modelsLoaded]);

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

  const fetchUsers = async () => {
    try {
      const res = await API.get("/users");
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const detectFaces = async () => {
    if (
      webcamRef.current &&
      webcamRef.current.video.readyState === 4 &&
      !loading
    ) {
      const video = webcamRef.current.video;
      const canvas = canvasRef.current;

      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      const resizedDetections = faceapi.resizeResults(detections, {
        width: video.videoWidth,
        height: video.videoHeight,
      });

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const validUsers = users.filter(
        (user) => user.descriptor && user.descriptor.length === 128
      );

      if (!validUsers.length) return;

      const labeledDescriptors = validUsers.map(
        (user) =>
          new faceapi.LabeledFaceDescriptors(user.name, [
            new Float32Array(user.descriptor),
          ])
      );

      const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
      const recognized = [];

      resizedDetections.forEach((detection) => {
        const result = faceMatcher.findBestMatch(detection.descriptor);
        const box = detection.detection.box;
        const label = result.label === "unknown" ? "Unknown" : result.label;

        let drawBox;
        if (result.label === "unknown") {
          drawBox = new faceapi.draw.DrawBox(box, {
            label: "❓ Unknown",
            boxColor: "#ff4444",
            lineWidth: 2
          });
        } else {
          drawBox = new faceapi.draw.DrawBox(box, {
            label: `✅ ${result.label}`,
            boxColor: "#10b981",
            lineWidth: 2
          });
          recognized.push(result.label);
        }

        drawBox.draw(canvas);
      });
      
      setRecognizedFaces([...new Set(recognized)]);
    }
  };

  const markAttendance = async () => {
    if (!modelsLoaded) {
      toast.error("Face detection models are still loading. Please wait...");
      return;
    }

    setLoading(true);

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      const img = await faceapi.fetchImage(imageSrc);

      const detections = await faceapi
        .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (!detections.length) {
        toast.error("No faces detected ❌");
        setLoading(false);
        return;
      }

      const validUsers = users.filter(
        (user) => user.descriptor && user.descriptor.length === 128
      );

      if (!validUsers.length) {
        toast.error("No valid users found in database ❌");
        setLoading(false);
        return;
      }

      const labeledDescriptors = validUsers.map(
        (user) =>
          new faceapi.LabeledFaceDescriptors(user.name, [
            new Float32Array(user.descriptor),
          ])
      );

      const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);

      let messages = [];
      let successCount = 0;
      let failCount = 0;

      for (let detection of detections) {
        const result = faceMatcher.findBestMatch(detection.descriptor);

        if (result.label !== "unknown") {
          try {
            const res = await API.post("/attendance", {
              name: result.label,
            });
            messages.push(`✅ ${result.label}: ${res.data.message}`);
            successCount++;
          } catch (error) {
            const msg = error.response?.data?.message || "Error ❌";
            messages.push(`⚠️ ${result.label}: ${msg}`);
            failCount++;
          }
        } else {
          messages.push("❌ Unknown face detected - Not registered");
          failCount++;
        }
      }

      const summary = `📊 Summary:\n✅ Success: ${successCount}\n❌ Failed: ${failCount}\n\n${messages.join("\n")}`;
      toast.success(summary);
      
      // Refresh detection after marking attendance
      setTimeout(() => detectFaces(), 1000);
      
    } catch (error) {
      console.error("Attendance Error:", error);
      toast.error("Failed to mark attendance. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="attendance-component">
      {loading && (
        <div className="loader-overlay">
          <div className="loader-container">
            <div className="loader-spinner"></div>
            <div className="loader-text">Processing Attendance...</div>
            <div className="loader-subtext">Verifying faces and marking attendance</div>
          </div>
        </div>
      )}
      
      <h2 className="component-title">📸 Face Recognition Attendance</h2>
      
      <div className="webcam-wrapper">
        <div className="webcam-container" style={{ position: "relative", width: "100%", maxWidth: "640px", margin: "0 auto" }}>
          <Webcam
            ref={webcamRef}
            className="webcam-preview"
            screenshotFormat="image/jpeg"
            width={640}
            height={480}
            mirrored={true}
            videoConstraints={{
              width: 640,
              height: 480,
              facingMode: "user"
            }}
          />
          <canvas
            ref={canvasRef}
            className="detection-canvas"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%"
            }}
          />
          {!modelsLoaded && !loading && (
            <div className="webcam-loading-overlay">
              Loading face detection models...
            </div>
          )}
        </div>
      </div>
      
      {recognizedFaces.length > 0 && (
        <div className="recognized-faces">
          <strong>👤 Detected:</strong> {recognizedFaces.join(", ")}
        </div>
      )}
      
      <button 
        className="mark-attendance-btn" 
        onClick={markAttendance}
        disabled={loading || !modelsLoaded}
      >
        {loading ? (
          <>
            <span className="btn-spinner"></span>
            Processing...
          </>
        ) : (
          "✅ Mark Attendance"
        )}
      </button>
      
      {!modelsLoaded && !loading && (
        <div className="info-text">
          ⚡ Initializing face recognition system...
        </div>
      )}
    </div>
  );
};

export default Attendance;