// src/pages/doctor/ConsultationJoin.jsx
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/doctor/Sidebar";
import Topbar from "../../components/doctor/Topbar";
import "../../styles/doctorDashboard.css";

function ConsultationJoin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const doctorName = localStorage.getItem("doctorName") || "Dr. Smith";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/doctor/login");
  };

  const handleStartConsultation = () => {
    // Start video call logic here
    alert(`Starting consultation ${id}`);
  };

  return (
    <div className="doctor-layout">
      <Sidebar active="consultations" onLogout={handleLogout} />
      <div className="doctor-main">
        <Topbar doctorName={doctorName} specialization="General Physician" />
        <main className="doctor-content">
          <div className="card">
            <h1>Join Consultation #{id}</h1>
            <div className="consultation-join">
              <div className="video-container">
                <div className="video-placeholder">
                  Video call will appear here
                </div>
              </div>
              <div className="consultation-info">
                <h3>Patient Information</h3>
                <p><strong>Status:</strong> Ready to join</p>
                <button className="btn primary large" onClick={handleStartConsultation}>
                  🎥 Start Video Call
                </button>
                <button className="btn secondary" onClick={() => navigate("/doctor/dashboard")}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ConsultationJoin;
