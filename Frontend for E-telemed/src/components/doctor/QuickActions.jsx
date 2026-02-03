import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/quickActions.css";

function QuickActions() {
  const navigate = useNavigate();
  return (
    <div className="quick-actions-grid">
      <button className="quick-action-btn" onClick={() => navigate("/doctor/consultations/start")}>
        Start Consultation
      </button>
      <button className="quick-action-btn" onClick={() => navigate("/doctor/appointments")}>
        Full Schedule
      </button>
      <button className="quick-action-btn" onClick={() => navigate("/doctor/prescriptions")}>
        New Prescription
      </button>
      <button className="quick-action-btn" onClick={() => navigate("/doctor/patients")}>
        Patient Records
      </button>
    </div>
  );
}

export default QuickActions;