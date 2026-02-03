// src/pages/patient/PatientAppointmentDetails.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import patientServices from "../../api/patient/patientServices";
import { consultationMethods } from "../../api/consultationServices"; // ✅ import consultationMethods
import Sidebar from "../../components/patient/Sidebar";
import Topbar from "../../components/patient/Topbar";
import "../../styles/dashboard.css";

function PatientAppointmentDetails() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState(null);

  // Fetch appointment & doctor info
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await patientServices.getAppointmentById(appointmentId);
        const apptData = response.data?.data || response.data;
        setAppointment(apptData);

        if (apptData?.doctorId) {
          try {
            const doctorRes = await patientServices.getDoctorById(apptData.doctorId);
            setDoctor(doctorRes.data?.data);
          } catch {
            console.log("Doctor info not available");
          }
        }
      } catch (error) {
        console.error("Error fetching appointment:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [appointmentId]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/patient/login", { replace: true });
  };

  // ✅ Corrected: Join consultation by fetching consultation via appointmentId
  const handleJoinConsultation = async () => {
    try {
      const res = await consultationMethods.getConsultationByAppointmentId(appointmentId);
      const consultation = res.data?.data || res.data;

      if (!consultation?.id) {
        alert("Consultation not available yet.");
        return;
      }

      navigate(`/patient/consultations/${consultation.id}`);
    } catch (err) {
      console.error("Failed to fetch consultation:", err);
      alert("Consultation not available yet.");
    }
  };

  const handleReschedule = () => {
    navigate(`/patient/appointments/${appointmentId}/reschedule`);
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      await patientServices.cancelAppointment(appointmentId, "Patient requested cancellation");
      alert("Appointment cancelled successfully");
      navigate("/patient/appointments");
    } catch (error) {
      console.error(error);
      alert("Failed to cancel appointment: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar active="appointments" onLogout={handleLogout} />
        <main className="dashboard-main">
          <Topbar patientName={localStorage.getItem("fullName") || "Patient"} />
          <div className="loading-spinner">⏳ Loading appointment details...</div>
        </main>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="dashboard-layout">
        <Sidebar active="appointments" onLogout={handleLogout} />
        <main className="dashboard-main">
          <div className="error-state">Appointment not found</div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar active="appointments" onLogout={handleLogout} />
      <main className="dashboard-main">
        <Topbar 
          patientName={localStorage.getItem("fullName") || "Patient"} 
          email={localStorage.getItem("email") || ""} 
        />
        <div className="dashboard-content">
          <section className="panel">
            <h2>📅 Appointment Details</h2>
            <div className="appointment-details-card">
              <div className="detail-row">
                <label>Date & Time</label>
                <p>{new Date(appointment.appointmentDate).toLocaleString()}</p>
              </div>

              <div className="detail-row">
                <label>Doctor</label>
                <p>
                  Dr. {doctor?.firstName} {doctor?.lastName}
                </p>
                {doctor?.specialization && <small>{doctor.specialization}</small>}
              </div>

              <div className="detail-row">
                <label>Reason</label>
                <p>{appointment.reason || "General Checkup"}</p>
              </div>

              <div className="detail-row">
                <label>Status</label>
                <p>
                  <span className={`status status-${appointment.status?.toLowerCase()}`}>
                    {appointment.status || "Pending"}
                  </span>
                </p>
              </div>

              {appointment.notes && (
                <div className="detail-row">
                  <label>Notes</label>
                  <p>{appointment.notes}</p>
                </div>
              )}

              {/* ✅ ACTION BUTTONS */}
              <div className="action-buttons" style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
                {appointment.status?.toUpperCase() === "CONFIRMED" && (
                  <button className="btn btn-primary" onClick={handleJoinConsultation}>
                    💬 Join Consultation
                  </button>
                )}

                {["SCHEDULED", "CONFIRMED"].includes(appointment.status?.toUpperCase()) && (
                  <>
                    <button className="btn btn-secondary" onClick={handleReschedule}>
                      📅 Reschedule
                    </button>
                    <button className="btn btn-danger" onClick={handleCancel}>
                      ❌ Cancel
                    </button>
                  </>
                )}

                <button className="btn btn-outline" onClick={() => navigate("/patient/appointments")}>
                  ← Back to Appointments
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default PatientAppointmentDetails;