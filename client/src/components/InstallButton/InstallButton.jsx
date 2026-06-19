import { useEffect, useState } from "react";
import './InstallButton.css'

function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPopup(true); // website open hote hi popup dikhao
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () =>
      window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      alert("Install event received");

      e.preventDefault();
      setDeferredPrompt(e);
      setShowPopup(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () =>
      window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    await deferredPrompt.userChoice;

    setShowPopup(false);
    setDeferredPrompt(null);
  };

  const handleCancel = () => {
    setShowPopup(false);
  };

  if (!showPopup) return null;

  return (
  <div className="install-overlay">
    <div className="install-modal">
      <div className="install-icon">🚀</div>

      <h2>Install FaceAttendPro</h2>

      <p>
        Install the app for lightning-fast access,
        offline support and a smooth mobile experience.
      </p>

      <div className="install-actions">
        <button className="cancel-btn" onClick={handleCancel}>
          Later
        </button>

        <button className="install-btn" onClick={handleInstall}>
          Install App
        </button>
      </div>
    </div>
  </div>
);
}

export default InstallButton;