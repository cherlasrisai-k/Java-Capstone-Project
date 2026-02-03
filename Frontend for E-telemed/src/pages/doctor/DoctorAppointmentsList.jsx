import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import doctorServices from "../../api/doctor/doctorServices";
import Sidebar from "../../components/doctor/Sidebar";
import Topbar from "../../components/doctor/Topbar";
import "../../styles/doctorDashboard.css";
import { buildAppointmentHtmlEmail } from "../../utils/email";

function DoctorAppointmentsList() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState("ALL");

  const [showStartModal, setShowStartModal] = useState(false);
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);

  // ========== LOGOUT ==========
  const handleLogout = () => {
    localStorage.clear();
    navigate("/doctor/login");
  };

  // ========== CONFIRM APPOINTMENT ==========
 const handleConfirmAppointment = async (appointmentId) => {
  try {
    setActionLoading(true);

    // 1️⃣ Confirm appointment
    const response = await doctorServices.confirmAppointment(appointmentId);
    const appointment = response.data?.data;

    alert("✅ Appointment confirmed successfully!");

    if (!appointment?.patientId) {
      console.warn("Appointment has no patientId, skipping email.");
      return;
    }

    // 2️⃣ Fetch patient info
    let patient;
    try {
      const patientResponse = await doctorServices.getPatientById(appointment.patientId);
      patient = patientResponse.data?.data || patientResponse.data;
    } catch (err) {
      console.error("Failed to fetch patient:", err);
      alert("Appointment confirmed but failed to fetch patient info for email.");
      return;
    }

    // 3️⃣ Validate recipient email
    const recipientEmail = patient?.email;
    if (!recipientEmail) {
      console.warn("Patient email missing, skipping email notification.");
      alert("Appointment confirmed but patient has no email on file.");
      return;
    }

    // 4️⃣ Send email notification
    try {
      await doctorServices.sendEmailNotification({
        to: recipientEmail,
        subject: `Appointment Confirmed with Dr. ${doctor?.firstName} ${doctor?.lastName}`,
        message: buildAppointmentHtmlEmail(patient, doctor, appointment),
        html: true
      });
      alert("✅ Confirmation email sent successfully!");
    } catch (err) {
      console.error("Failed to send email:", err);
      alert("Appointment confirmed but failed to send email notification.");
    }

    navigate("/doctor/appointments");
  } catch (err) {
    console.error("❌ Confirm failed:", err);
    alert("❌ Failed to confirm: " + (err.response?.data?.message || "Please try again"));
  } finally {
    setActionLoading(false);
  }
};


  // ========== START CONSULTATION ==========
  const handleStartConsultation = async (appointmentId) => {
    if (!chiefComplaint.trim()) {
      alert("❌ Please enter chief complaint");
      return;
    }

    try {
      const res = await doctorServices.startConsultation(appointmentId, chiefComplaint);
      const consultationId = res.data?.data?.id;

      if (consultationId) {
        navigate(`/doctor/consultations/${consultationId}`);
      } else {
        alert("❌ Failed to get consultation ID");
      }
    } catch (err) {
      console.error("❌ Error:", err);
      alert("❌ Failed: " + err.message);
    } finally {
      setShowStartModal(false);
      setChiefComplaint("");
      setSelectedAppointmentId(null);
    }
  };

  // ========== LOAD APPOINTMENTS ==========
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setLoading(true);
        const doctorRes = await doctorServices.getCurrentDoctor();
        const doctorData = doctorRes.data?.data || doctorRes.data;
        setDoctor(doctorData);

        if (doctorData?.id) {
          const res = await doctorServices.getDoctorAppointments(doctorData.id, 0, 50);
          const appts = res.data?.data?.content || [];

          // Add patient names
          const apptsWithPatients = await Promise.all(
            appts.map(async (appt) => {
              if (!appt.patientName && appt.patientId) {
                try {
                  const patientRes = await doctorServices.getPatientById(appt.patientId);
                  const patientData = patientRes.data?.data || patientRes.data;
                  appt.patientName = `${patientData.firstName || ""} ${patientData.lastName || ""}`.trim();
                } catch {
                  appt.patientName = `Patient #${appt.patientId}`;
                }
              }
              return appt;
            })
          );

          setAppointments(apptsWithPatients);
        }
      } catch (err) {
        console.error("❌ Failed to load appointments:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  // ========== FORMAT DATE TIME ==========
  const formatDateTime = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // ========== FILTER APPOINTMENTS ==========
  const filteredAppointments =
    filterStatus === "ALL"
      ? appointments
      : filterStatus === "PENDING"
      ? appointments.filter(a => a.status === "PENDING" || a.status === "RESCHEDULED")
      : appointments.filter(a => a.status === filterStatus);

  // ========== LOADING ==========
  if (loading) {
    return (
      <div className="doctor-layout">
        <Sidebar active="appointments" onLogout={handleLogout} />
        <div className="doctor-main">
          <div className="loading-spinner">⏳ Loading appointments...</div>
        </div>
      </div>
    );
  }

  // ========== MAIN RENDER ==========
  return (
    <div className="doctor-layout">
      <Sidebar active="appointments" onLogout={handleLogout} />

      <div className="doctor-main">
        <Topbar
          doctorName={`${doctor?.firstName || ""} ${doctor?.lastName || ""}`.trim()}
          specialization={doctor?.specialization}
        />

        <main className="doctor-content">
          <section className="card full-width">
            <div className="page-header">
              <h1>📅 Appointments</h1>

              <div className="filter-tabs">
                <button
                  className={`filter-tab ${filterStatus === "ALL" ? "active" : ""}`}
                  onClick={() => setFilterStatus("ALL")}
                >
                  All ({appointments.length})
                </button>

                <button
                  className={`filter-tab ${filterStatus === "PENDING" ? "active" : ""}`}
                  onClick={() => setFilterStatus("PENDING")}
                >
                  Pending (
                  {appointments.filter(a => a.status === "PENDING" || a.status === "RESCHEDULED").length})
                </button>

                <button
                  className={`filter-tab ${filterStatus === "CONFIRMED" ? "active" : ""}`}
                  onClick={() => setFilterStatus("CONFIRMED")}
                >
                  Confirmed ({appointments.filter(a => a.status === "CONFIRMED").length})
                </button>
              </div>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Patient</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAppointments.map(appt => (
                    <tr key={appt.id}>
                      <td>{formatDateTime(appt.appointmentDate)}</td>
                      <td>{appt.patientName}</td>
                      <td>{appt.reason}</td>

                      <td>
                        <span className={`status status-${appt.status?.toLowerCase()}`}>
                          {appt.status}
                        </span>
                      </td>

                      <td>
                        {appt.status === "CONFIRMED" && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              setSelectedAppointmentId(appt.id);
                              setShowStartModal(true);
                            }}
                          >
                            🏥 Start Consultation
                          </button>
                        )}

                        {appt.status === "PENDING" && (
                          <button
                            className="btn btn-secondary btn-sm"
                            disabled={actionLoading}
                            onClick={() => handleConfirmAppointment(appt.id)}
                          >
                            {actionLoading ? "⏳..." : "✅ Confirm"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}

                  {filteredAppointments.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center">
                        No appointments found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* START CONSULTATION MODAL */}
              {showStartModal && (
                <div className="modal-overlay">
                  <div className="modal-dialog">
                    <div className="modal-content">
                      <h3>🏥 Start Consultation</h3>

                      <label className="modal-label">Chief Complaint:</label>
                      <textarea
                        value={chiefComplaint}
                        onChange={(e) => setChiefComplaint(e.target.value)}
                        placeholder="e.g., Patient reports persistent headache for 3 days"
                        rows="4"
                        className="modal-textarea"
                      />

                      <div className="modal-actions">
                        <button
                          className="btn btn-secondary"
                          onClick={() => {
                            setShowStartModal(false);
                            setChiefComplaint("");
                            setSelectedAppointmentId(null);
                          }}
                        >
                          ❌ Cancel
                        </button>

                        <button
                          className="btn btn-primary"
                          onClick={() => handleStartConsultation(selectedAppointmentId)}
                        >
                          ✅ Start Consultation
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default DoctorAppointmentsList;