// src/components/doctor/ConsultationCard.jsx
import React from "react";
import StatusPill from "StatusPill";
import { useNavigate } from "react-router-dom";

function ConsultationCard({ consultation }) {
  const navigate = useNavigate();
  
  const formatDate = (dateStr) => 
    new Date(dateStr).toLocaleDateString();

  return (
    <div className="consultation-card">
      <div className="consultation-header">
        <div>
          <h4>{consultation.patientName}</h4>
          <p className="consultation-meta">
            {formatDate(consultation.createdAt)} • {consultation.duration} min
          </p>
        </div>
        <StatusPill status={consultation.status} />
      </div>
      
      <div className="consultation-body">
        <p className="consultation-reason">{consultation.reason}</p>
        {consultation.notes && (
          <p className="consultation-notes">{consultation.notes}</p>
        )}
      </div>
      
      <div className="consultation-actions">
        <button 
          className="btn secondary small"
          onClick={() => navigate(`/doctor/patients/${consultation.patientId}`)}
        >
          View Record
        </button>
        <button 
          className="btn primary small"
          onClick={() => navigate(`/doctor/consultations/${consultation.id}/notes`)}
        >
          Consultation Notes
        </button>
      </div>
    </div>
  );
}

export default ConsultationCard;