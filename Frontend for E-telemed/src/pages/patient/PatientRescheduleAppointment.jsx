import { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import patientServices from "../../api/patient/patientServices";
import Sidebar from "../../components/patient/Sidebar";
import Topbar from "../../components/patient/Topbar";
import "../../styles/patientDashboard.css";

function PatientRescheduleAppointment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { appointmentId } = useParams();
  const [appointment, setAppointment] = useState(location.state?.appointment);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetching, setFetching] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/patient/login");
  };

  // ✅ Fetch appointment if missing
  useEffect(() => {
    const fetchAppointment = async () => {
      if (!appointmentId || appointment || fetching) return;
      
      setFetching(true);
      try {
        const userId = localStorage.getItem("id");
        const response = await patientServices.getPatientAppointments(userId, 0, 100);
        const appts = response.data?.data?.content || [];
        const targetAppt = appts.find(a => a.id === appointmentId);
        
        if (targetAppt) {
          setAppointment(targetAppt);
        } else {
          navigate("/patient/appointments", { replace: true });
        }
      } catch (err) {
        console.error("Failed to fetch appointment:", err);
        navigate("/patient/appointments", { replace: true });
      } finally {
        setFetching(false);
      }
    };

    fetchAppointment();
  }, [appointmentId, appointment, fetching, navigate]);

  const handleReschedule = async (e) => {
    e.preventDefault();
    setError(null);

    if (!newDate || !newTime) {
      setError("Please select both date and time");
      return;
    }

    if (!appointment) {
      setError("Appointment data not available");
      return;
    }

    try {
      setLoading(true);
      const newDateTime = `${newDate}T${newTime}:00`;
      await patientServices.rescheduleAppointment(appointment.id, newDateTime);
      alert("✅ Appointment rescheduled successfully!");
      navigate("/patient/appointments");
    } catch (err) {
      console.error("Failed to reschedule:", err);
      setError(err.response?.data?.message || "Failed to reschedule appointment");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Show loading while fetching appointment
  if (fetching || (!appointment && appointmentId)) {
    return (
      <div className="patient-layout">
        <Sidebar active="appointments" onLogout={handleLogout} />
        <main className="patient-main">
          <Topbar patientName={localStorage.getItem("fullName") || "Patient"} />
          <div className="patient-content" style={{ padding: "2rem", textAlign: "center" }}>
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading appointment details...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ✅ Show error if no appointment after fetch attempt
  if (!appointment) {
    return (
      <div className="patient-layout">
        <Sidebar active="appointments" onLogout={handleLogout} />
        <main className="patient-main">
          <Topbar patientName={localStorage.getItem("fullName") || "Patient"} />
          <div className="patient-content">
            <div className="error-card">
              <h3>❌ No Appointment Selected</h3>
              <button className="btn primary" onClick={() => navigate("/patient/appointments")}>
                Back to Appointments
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const minDate = new Date().toISOString().split("T")[0];

  return (
    <div className="patient-layout">
      <Sidebar active="appointments" onLogout={handleLogout} />
      <main className="patient-main">
        <Topbar patientName={localStorage.getItem("fullName") || "Patient"} />

        <div className="patient-content">
          <button className="btn secondary" onClick={() => navigate("/patient/appointments")}>
            ← Back
          </button>

          <div className="reschedule-container">
            {/* Current Appointment Info */}
            <section className="card appointment-info">
              <h3>Current Appointment</h3>
              <p>
                <strong>Doctor:</strong> {appointment.doctorName || "Doctor"}
              </p>
              <p>
                <strong>Date:</strong> {new Date(appointment.appointmentDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Time:</strong> {new Date(appointment.appointmentDate).toLocaleTimeString()}
              </p>
            </section>

            {/* Reschedule Form */}
            <section className="card">
              <h3>Select New Date & Time</h3>

              {error && <div className="error-banner">{error}</div>}

              <form onSubmit={handleReschedule}>
                <div className="form-group">
                  <label>New Date *</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    min={minDate}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>New Time *</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    required
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={() => navigate("/patient/appointments")}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn primary" disabled={loading}>
                    {loading ? "Rescheduling..." : "✓ Confirm Reschedule"}
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

export default PatientRescheduleAppointment;