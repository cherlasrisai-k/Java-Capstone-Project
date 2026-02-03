import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import doctorServices from "../../api/doctor/doctorServices";
import Sidebar from "../../components/doctor/Sidebar";
import Topbar from "../../components/doctor/Topbar";
import "../../styles/doctorDashboard.css";
import { buildAppointmentHtmlEmail } from "../../utils/email";

function DoctorAppointmentDetail() {
  const navigate = useNavigate();
  const { appointmentId } = useParams();

  const [appointment, setAppointment] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);

  const calculateAge = (dobString) => {
  if (!dobString) return "—";

  const dob = new Date(dobString);
  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age;
  };
  const formatDOB = (dobString) => {
  if (!dobString) return "—";
  return new Date(dobString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};
  const handleLogout = () => {
    localStorage.clear();
    navigate("/doctor/login");
  };

  useEffect(() => {
    console.log("🔍 LOADING APPOINTMENT - URL ID:", appointmentId);
    
    const loadAppointmentDetail = async () => {
      try {
        setLoading(true);
        
        // 1. Load doctor
        const doctorRes = await doctorServices.getCurrentDoctor();
        const doctorData = doctorRes.data?.data || doctorRes.data;
        setDoctor(doctorData);
        console.log("✅ Doctor loaded:", doctorData);

        // 2. ONLY load if we have valid ID
        if (!appointmentId) {
          console.error("❌ NO APPOINTMENT ID IN URL!");
          throw new Error("No appointment ID");
        }

        // 3. Load SINGLE appointment
        console.log("📞 Calling getAppointmentById(", appointmentId, ")");
        const appointmentRes = await doctorServices.getAppointmentById(appointmentId);
        const appointmentData = appointmentRes.data?.data || appointmentRes.data;
        console.log("✅ Appointment loaded:", appointmentData);
        setAppointment(appointmentData);

        // 4. Load patient details
        if (appointmentData?.patientId) {
          try {
            const patientRes = await doctorServices.getPatientById(appointmentData.patientId);
            const patientData = patientRes.data?.data || patientRes.data;
            setPatient(patientData);
            console.log("✅ Patient loaded:", patientData);
          } catch (err) {
            console.warn("⚠️ Patient details unavailable:", err);
          }
        }

      } catch (err) {
        console.error("❌ Load appointment FAILED:", err);
        alert(`⚠️ Appointment ${appointmentId || 'not found'} not available`);
        navigate("/doctor/appointments");
      } finally {
        setLoading(false);
      }
    };

    // ONLY run if we have appointmentId
    if (appointmentId) {
      loadAppointmentDetail();
    } else {
      console.error("🚫 NO APPOINTMENT ID - redirecting to list");
      setLoading(false);
      navigate("/doctor/appointments", { replace: true });
    }
  }, [appointmentId, navigate]);

 const handleConfirmAppointment = async () => {
  try {
    setActionLoading(true);

    //  FIX 1 — capture backend response properly
    const response = await doctorServices.confirmAppointment(appointmentId);
    const appointment = response.data.data;

    alert("✅ Appointment confirmed successfully!");

    // Fetch patient info
    const patientResponse = await doctorServices.getPatientById(appointment.patientId);
    const patient = patientResponse.data;

    // FIX 2 — Ensure message matches backend DTO
    await doctorServices.sendEmailNotification({
      to: patient.email,
      subject: "Appointment Confirmed",
      message: buildAppointmentHtmlEmail(patient, doctor, appointment),
      html: true
    });

    navigate("/doctor/appointments");

  } catch (err) {
    console.error("❌ Confirm failed:", err);
    alert("❌ Failed to confirm: " + (err.response?.data?.message || "Please try again"));
  } finally {
    setActionLoading(false);
  }
};

  const handleRejectAppointment = async () => {
    if (!cancelReason.trim()) {
      alert("Please enter a reason for rejection");
      return;
    }
    try {
      setActionLoading(true);
      await doctorServices.cancelAppointment(appointmentId, cancelReason);
      alert("✅ Appointment rejected successfully!");
      navigate("/doctor/appointments");
    } catch (err) {
      console.error("❌ Reject failed:", err);
      alert("❌ Failed to reject: " + (err.response?.data?.message || "Please try again"));
    } finally {
      setActionLoading(false);
      setShowCancelModal(false);
      setCancelReason("");
    }
  };

const handleStartConsultation = async () => {
  try {
    setActionLoading(true);
    
    // ✅ STEP 1: Check if consultation already exists
    try {
      const existingConsultation = await doctorServices.getConsultationByAppointmentId(appointmentId);
      const consultationData = existingConsultation.data?.data || existingConsultation.data;
      
      if (consultationData?.id) {
        alert("✅ Consultation already started! Opening existing consultation...");
        navigate(`/doctor/consultations/${consultationData.id}`);
        return;
      }
    } catch (checkErr) {
      // ✅ No existing consultation - safe to create new one
      console.log("✅ No existing consultation found - creating new one");
    }
    
    // ✅ STEP 2: Create new consultation
    const response = await doctorServices.startConsultation(
      appointmentId,
      appointment?.reason || "General Consultation"
    );
    
    const newConsultationId = response.data?.data?.id;
    console.log("✅ New consultation created:", newConsultationId);
    navigate(`/doctor/consultations/${newConsultationId}`);
    
  } catch (err) {
    console.error("❌ Start consultation failed:", err);
    
    // ✅ Handle specific backend errors
    const errorMsg = err.response?.data?.message || err.message;
    if (errorMsg.includes("Consultation already exists")) {
      alert("✅ Consultation already exists. Redirecting to it...");
      // Fallback: try to get by appointment ID
      try {
        const consultation = await doctorServices.getConsultationByAppointmentId(appointmentId);
        navigate(`/doctor/consultations/${consultation.data?.data?.id}`);
      } catch (fallbackErr) {
        alert("⚠️ Consultation exists but cannot access. Please check appointments list.");
        navigate("/doctor/consultations");
      }
    } else {
      alert(`❌ Failed to start consultation: ${errorMsg}`);
    }
  } finally {
    setActionLoading(false);
  }
};

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className="doctor-layout">
        <Sidebar active="appointments" onLogout={handleLogout} />
        <div className="doctor-main">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading appointment details... (ID: {appointmentId || 'none'})</p>
          </div>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="doctor-layout">
        <Sidebar active="appointments" onLogout={handleLogout} />
        <div className="doctor-main">
          <Topbar
            doctorName={`${doctor?.firstName || ""} ${doctor?.lastName || ""}`.trim()}
            specialization={doctor?.specialization}
          />
          <main className="doctor-content">
            <div className="error-card">
              <h3>⚠️ Appointment Not Found</h3>
              <p>ID: {appointmentId || 'Missing'}</p>
              <button className="btn primary" onClick={() => navigate("/doctor/appointments")}>
                ← Back to Appointments
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-layout">
      <Sidebar active="appointments" onLogout={handleLogout} />
      <div className="doctor-main">
        <Topbar
          doctorName={`${doctor?.firstName || ""} ${doctor?.lastName || ""}`.trim()}
          specialization={doctor?.specialization}
        />

        <main className="doctor-content">
          <div className="appointment-detail-container">
            {/* Header */}
            <section className="detail-header">
              <div>
                <h1>Appointment Details</h1>
                <p>Review and manage appointment #{appointment.id}</p>
              </div>
              <button className="btn secondary" onClick={() => navigate("/doctor/appointments")}>
                ← Back to Appointments
              </button>
            </section>

            {/* Status Banner */}
            <section className="status-banner">
              <span className={`status-badge status-${appointment.status?.toLowerCase()}`}>
                {appointment.status || "PENDING"}
              </span>
              <p>Appointment ID: {appointment.id}</p>
            </section>

            {/* Patient Information */}
            <section className="card">
              <h3>👤 Patient Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Patient Name</label>
                  <p>{patient?.firstName ? `${patient.firstName} ${patient.lastName}` : appointment.patientName || "—"}</p>
                </div>
                <div className="info-item">
                  <label>Patient ID</label>
                  <p>{appointment.patientId || "—"}</p>
                </div>
                <div className="info-item">
  <label>Age</label>
  <p>{patient?.dateOfBirth ? calculateAge(patient.dateOfBirth) : "—"}</p>
</div>
<div className="info-item">
  <label>Date of Birth</label>
  <p>{formatDOB(patient?.dateOfBirth)}</p>
</div>
                <div className="info-item">
                  <label>Phone</label>
                  <p>{patient?.phoneNumber || appointment.patientPhone || "—"}</p>
                </div>
                {patient?.email && (
                  <div className="info-item full-width">
                    <label>Email</label>
                    <p>{patient.email}</p>
                  </div>
                )}
              </div>
            </section>

            {/* Appointment Details */}
            <section className="card">
              <h3>📅 Appointment Details</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Date</label>
                  <p>{formatDate(appointment.appointmentDate)}</p>
                </div>
                <div className="info-item">
                  <label>Time</label>
                  <p>{formatTime(appointment.appointmentDate)}</p>
                </div>
                <div className="info-item">
                  <label>Duration</label>
                  <p>{appointment.durationMinutes || 30} minutes</p>
                </div>
                <div className="info-item">
                  <label>Reason for Visit</label>
                  <p>{appointment.reason || "General Checkup"}</p>
                </div>
              </div>
              {appointment.notes && (
                <div className="info-item full-width">
                  <label>Patient Notes</label>
                  <p className="notes-text">{appointment.notes}</p>
                </div>
              )}
              {appointment.cancellationReason && (
                <div className="info-item full-width">
                  <label>Cancellation Reason</label>
                  <p className="notes-text danger">{appointment.cancellationReason}</p>
                </div>
              )}
            </section>

            {/* Action Buttons */}
            {["PENDING", "SCHEDULED"].includes(appointment.status?.toUpperCase()) && (
              <section className="action-buttons">
                <button
                  className="btn primary large"
                  onClick={handleConfirmAppointment}
                  disabled={actionLoading}
                >
                  ✓ {actionLoading ? "Confirming..." : "Approve Appointment"}
                </button>
                <button
                  className="btn danger large"
                  onClick={() => setShowCancelModal(true)}
                  disabled={actionLoading}
                >
                  ✕ Reject Appointment
                </button>
              </section>
            )}

            {appointment.status?.toUpperCase() === "CONFIRMED" && (
              <section className="action-buttons">
                <button
                  className="btn primary large"
                  onClick={handleStartConsultation}
                  disabled={actionLoading}
                >
                  🩺 {actionLoading ? "Starting..." : "Start Consultation"}
                </button>
              </section>
            )}
          </div>
        </main>
      </div>

      {/* Rejection Modal */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Reject Appointment</h3>
            <p>Please provide a reason for rejecting this appointment:</p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter reason for rejection (e.g., scheduling conflict, not available, etc.)"
              rows="5"
              className="rejection-textarea"
            />
            <div className="modal-actions">
              <button
                className="btn secondary"
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                }}
              >
                Cancel
              </button>
              <button
                className="btn danger"
                onClick={handleRejectAppointment}
                disabled={actionLoading || !cancelReason.trim()}
              >
                {actionLoading ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorAppointmentDetail;
