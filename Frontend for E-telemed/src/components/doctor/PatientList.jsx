import React from "react";
import "../../styles/patientsList.css";

function PatientsList({ patients }) {
  if (patients.length === 0) {
    return <p className="muted-text">No recent consultations</p>;
  }
  return (
    <ul className="patients-list">
      {patients.map((patient) => (
        <li key={patient.id} className="patient-item">
          <div>
            <p className="patient-name">{patient.fullName}</p>
            <p className="patient-meta">Last visit: {patient.lastConsultation}</p>
          </div>
          <button className="btn secondary small">View Record</button>
        </li>
      ))}
    </ul>
  );
}

export default PatientsList;