// src/components/doctor/AppointmentsTable.jsx
import React from "react";
import StatusPill from "StatusPill";
import { useNavigate } from "react-router-dom";

function AppointmentsTable({ appointments, loading }) {
  const navigate = useNavigate();

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      month: 'short',
      day: 'numeric'
    });

  const handleJoinConsultation = (appointmentId) => {
    navigate(`/doctor/consultations/${appointmentId}/join`);
  };

  if (loading) {
    return (
      <div className="table-placeholder">
        <div className="skeleton-row"></div>
        <div className="skeleton-row"></div>
        <div className="skeleton-row"></div>
      </div>
    );
  }

  return (
    <div className="appointments-table-container">
      {appointments.length === 0 ? (
        <div className="empty-state">
          <p>No appointments found for selected date</p>
        </div>
      ) : (
        <table className="doctor-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Patient</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Duration</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt) => (
              <tr key={appt.id}>
                <td>{formatTime(appt.appointmentDate)}</td>
                <td>{appt.patientName || `ID: ${appt.patientId}`}</td>
                <td>{appt.reason || "Routine checkup"}</td>
                <td>
                  <StatusPill status={appt.status || "SCHEDULED"} />
                </td>
                <td>{appt.duration || "30 min"}</td>
                <td>
                  <button 
                    className="btn primary small"
                    onClick={() => handleJoinConsultation(appt.id)}
                  >
                    {appt.status === "IN_PROGRESS" ? "Resume" : "Join"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AppointmentsTable;
