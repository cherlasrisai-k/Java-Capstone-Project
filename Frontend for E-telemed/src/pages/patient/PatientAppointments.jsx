// src/pages/patient/PatientAppointments.jsx - COMPLETE CORRECTED WITH consultationMethods
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import patientServices from "../../api/patient/patientServices";
import Sidebar from "../../components/patient/Sidebar";
import Topbar from "../../components/patient/Topbar";
import "../../styles/dashboard.css";

function PatientAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [doctorNames, setDoctorNames] = useState({});
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/patient/login", { replace: true });
  };

  // Load appointments using NEW consultationMethods
  useEffect(() => {
    const fetchAppointments = async () => {
      const userId = localStorage.getItem("id");
      if (!userId) return handleLogout();

      try {
        // ✅ Using consultationMethods via patientServices
        const apptRes = await patientServices.getPatientAppointments(userId, 0, 10);
        const appts = apptRes.data?.data?.content || apptRes.data?.data || [];
        console.log("✅ Appointments loaded:", appts);
        setAppointments(appts);
      } catch (err) {
        console.error("❌ Appointments fetch error:", err);
        if (err.response?.status === 401) handleLogout();
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  // Load doctor names
  useEffect(() => {
    const loadDoctorNames = async () => {
      const names = { ...doctorNames };
      for (const appt of appointments) {
        if (appt.doctorId && !names[appt.doctorId]) {
          try {
            const doctorRes = await patientServices.getDoctorById(appt.doctorId);
            const doctorData = doctorRes.data?.data;
            names[appt.doctorId] = 
              `${doctorData?.firstName || ""} ${doctorData?.lastName || ""}`.trim() || "Doctor";
          } catch {
            names[appt.doctorId] = "Doctor";
          }
        }
      }
      setDoctorNames(names);
    };
    if (appointments.length > 0) loadDoctorNames();
  }, [appointments]);

  // ✅ HELPER FUNCTIONS
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ✅ ACTION BUTTONS FOR EACH APPOINTMENT
  const getAppointmentActions = (appt) => {
    return (
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {/* Join button for CONFIRMED appointments */}
        {appt.status?.toUpperCase() === "CONFIRMED" && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              console.log("🔗 Joining consultation:", appt.id);
              navigate(`/patient/consultations/${appt.id}`);
            }}
            title="Join consultation chat"
          >
            💬 Join
          </button>
        )}

        {/* Details button for all appointments */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => {
            console.log("📋 Viewing appointment details:", appt.id);
            navigate(`/patient/appointments/${appt.id}`);
          }}
          title="View appointment details"
        >
          📋 Details
        </button>

        {/* Reschedule button for SCHEDULED/CONFIRMED appointments */}
        {["SCHEDULED", "CONFIRMED"].includes(appt.status?.toUpperCase()) && (
          <button
            className="btn btn-info btn-sm"
            onClick={() => {
              console.log("📅 Rescheduling appointment:", appt.id);
              navigate(`/patient/appointments/${appt.id}/reschedule`);
            }}
            title="Reschedule this appointment"
          >
            📅 Reschedule
          </button>
        )}

        {/* Cancel button for cancellable appointments */}
        {["SCHEDULED", "CONFIRMED"].includes(appt.status?.toUpperCase()) && (
          <button
            className="btn btn-danger btn-sm"
            onClick={() => handleCancelAppointment(appt.id)}
            title="Cancel this appointment"
          >
            ❌ Cancel
          </button>
        )}
      </div>
    );
  };

  // ✅ CANCEL APPOINTMENT HANDLER
  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    try {
      console.log("🚨 Cancelling appointment:", appointmentId);
      // ✅ Using consultationMethods.cancelAppointment via patientServices
      await patientServices.cancelAppointment(
        appointmentId,
        "Patient requested cancellation"
      );
      console.log("✅ Appointment cancelled successfully");
      alert("✅ Appointment cancelled successfully");
      
      // Refresh appointments list
      const userId = localStorage.getItem("id");
      const apptRes = await patientServices.getPatientAppointments(userId, 0, 10);
      const appts = apptRes.data?.data?.content || apptRes.data?.data || [];
      setAppointments(appts);
    } catch (err) {
      console.error("❌ Cancel failed:", err);
      alert("❌ Failed to cancel: " + (err.response?.data?.message || err.message));
    }
  };

  // ✅ LOADING STATE
  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar active="appointments" onLogout={handleLogout} />
        <main className="dashboard-main">
          <Topbar 
            patientName={localStorage.getItem("fullName") || "Patient"} 
            email={localStorage.getItem("email") || ""}
          />
          <div className="loading-spinner">⏳ Loading appointments...</div>
        </main>
      </div>
    );
  }

  // ✅ RENDER
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
            <div className="panel-header">
              <h2>📅 My Appointments</h2>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/patient/book-appointment")}
              >
                ➕ Book New Appointment
              </button>
            </div>

            {appointments.length === 0 ? (
              <div className="empty-state">
                <p>📭 You have no appointments yet.</p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/patient/book-appointment")}
                >
                  Book your first appointment
                </button>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Doctor</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appt) => (
                      <tr key={appt.id}>
                        <td>{formatDate(appt.appointmentDate)}</td>
                        <td>{formatTime(appt.appointmentDate)}</td>
                        <td>Dr. {doctorNames[appt.doctorId] || "Doctor"}</td>
                        <td>{appt.reason || "General Checkup"}</td>
                        <td>
                          <span className={`status status-${appt.status?.toLowerCase()}`}>
                            {appt.status || "Pending"}
                          </span>
                        </td>
                        <td>{getAppointmentActions(appt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default PatientAppointments;