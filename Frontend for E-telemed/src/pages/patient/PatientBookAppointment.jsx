// src/pages/patient/PatientBookAppointment.jsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import patientServices from "../../api/patient/patientServices";
import Sidebar from "../../components/patient/Sidebar";
import Topbar from "../../components/patient/Topbar";
import "../../styles/patientDashboard.css";

function PatientBookAppointment() {
  const navigate = useNavigate();
  const location = useLocation();
  const doctorState = location.state?.doctor;
  const doctorId = doctorState?.id;

  const [doctor, setDoctor] = useState(doctorState || null);
  const [formData, setFormData] = useState({
    doctorId: doctorId || "",
    appointmentDate: "",
    appointmentTime: "",
    reason: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/patient/login");
  };

  // Fetch doctor details if not passed via state
  useEffect(() => {
    const fetchDoctor = async () => {
      if (!doctorId && !doctorState) return;
      try {
        const response = await patientServices.getDoctorById(doctorId);
        const doc = response.data?.data || response.data;
        setDoctor(doc);
        setFormData((prev) => ({
          ...prev,
          doctorId: doc.id,
        }));
      } catch (err) {
        console.error("Failed to fetch doctor info:", err);
      }
    };
    if (!doctor) fetchDoctor();
  }, [doctorId, doctorState]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.appointmentDate || !formData.appointmentTime || !formData.reason) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      const appointmentPayload = {
        doctorId: parseInt(formData.doctorId),
        appointmentDate: `${formData.appointmentDate}T${formData.appointmentTime}:00`,
        durationMinutes: 30,
        reason: formData.reason,
        notes: formData.notes || "",
      };

      console.log("📤 Booking payload:", appointmentPayload);

      const response = await patientServices.createAppointment(appointmentPayload);

      if (response.data?.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/patient/appointments");
        }, 2000);
      }
    } catch (err) {
      console.error("Failed to book appointment:", err);
      setError(err.response?.data?.message || "Failed to book appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!doctor) {
    return (
      <div className="patient-layout">
        <Sidebar active="book-appointment" onLogout={handleLogout} />
        <main className="patient-main">
          <Topbar patientName={localStorage.getItem("fullName") || "Patient"} />
          <div className="patient-content">
            <div className="error-card">
              <h3>⚠️ Error</h3>
              <p>No doctor selected. Please select a doctor first.</p>
              <button className="btn primary" onClick={() => navigate("/patient/find-doctor")}>
                Find a Doctor
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Build doctor full name safely
  const doctorFullName = doctor.fullName || `${doctor.firstName || ""} ${doctor.lastName || ""}`.trim();

  return (
    <div className="patient-layout">
      <Sidebar active="book-appointment" onLogout={handleLogout} />
      <main className="patient-main">
        <Topbar patientName={localStorage.getItem("fullName") || "Patient"} />

        <div className="patient-content">
          <section className="page-header">
            <h1>Book Appointment</h1>
            <p>Schedule a consultation with {doctorFullName}</p>
          </section>

          <div className="booking-container">
            {/* Doctor Info */}
            <section className="card doctor-summary">
              <h3>Doctor Information</h3>
              <div className="doctor-info-display">
                <div className="doctor-avatar-lg">{doctorFullName.charAt(0).toUpperCase()}</div>
                <div>
                  <p><strong>Name:</strong> {doctorFullName}</p>
                  <p><strong>Specialization:</strong> {doctor.specialization}</p>
                  <p><strong>Experience:</strong> {doctor.yearsOfExperience} years</p>
                </div>
              </div>
            </section>

            {/* Booking Form */}
            <section className="card">
              <h3>Appointment Details</h3>
              {error && <div className="error-banner">{error}</div>}
              {success && (
                <div className="success-banner">
                  ✓ Appointment booked successfully! Redirecting...
                </div>
              )}

              <form onSubmit={handleSubmit} className="appointment-form">
                <div className="form-group">
                  <label>Preferred Date *</label>
                  <input
                    type="date"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Preferred Time *</label>
                  <input
                    type="time"
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Reason for Visit *</label>
                  <select
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a reason</option>
                    <option value="General Checkup">General Checkup</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Additional Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Describe your symptoms or concerns..."
                    rows="4"
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={() => navigate("/patient/find-doctor")}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn primary" disabled={loading}>
                    {loading ? "Booking..." : "📅 Confirm Booking"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PatientBookAppointment;