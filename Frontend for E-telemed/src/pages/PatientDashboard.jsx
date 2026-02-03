import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/patient/Sidebar";
import Topbar from "../components/patient/Topbar";
import MetricCard from "../components/patient/MetricCard";
import patientServices from "../api/patient/patientServices";
import "../styles/dashboard.css";
import axiosClient, { BASE_URLS } from "../api/axiosClient";

function PatientDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [metrics, setMetrics] = useState({});
  const [nextAppointment, setNextAppointment] = useState(null);
  const [doctorName, setDoctorName] = useState("Doctor");
  const [consultations, setConsultations] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // NEW: Auto-refresh trigger

  const handleLogout = () => {
    localStorage.clear();
    navigate("/patient/login", { replace: true });
  };


  useEffect(() => {
    const loadDashboard = async () => {
      const userId = localStorage.getItem("id");
      if (!userId) {
        console.warn("No user ID found, redirecting to login");
        return handleLogout();
      }

      try {
        setLoading(true);
        setError(null);

        console.log("Loading dashboard for patient:", userId);

        // Load all data in parallel
        const [
          metricsRes,
          appointmentRes,
          consultationsRes,
          prescriptionsRes,
          notificationsRes,
        ] = await Promise.all([
          patientServices.getLatestMetrics(userId).catch((err) => {
            console.warn("Failed to load metrics:", err.message);
            return { data: { data: {} } };
          }),
          patientServices.getPatientAppointments(userId, 0, 5).catch((err) => {
            console.warn("Failed to load upcoming appointment:", err.message);
            return { data: { data: { content: [] } } };
          }),
          patientServices.getPatientConsultations(userId, 0, 5).catch((err) => {
            console.warn("Failed to load consultations:", err.message);
            return { data: { data: [] } };
          }),
          patientServices.getActivePrescriptions(userId).catch((err) => {
            console.warn("Failed to load prescriptions:", err.message);
            return { data: { data: [] } };
          }),
          patientServices.getLatestNotifications(userId, 5).catch((err) => {
            console.warn("Failed to load notifications:", err.message);
            return { data: { data: [] } };
          }),
        ]);

        // Extract metrics (unchanged)
        const metricsData = metricsRes.data?.data;
        let latestMetrics = {};
        if (Array.isArray(metricsData) && metricsData.length > 0) {
          latestMetrics = metricsData[0];
        } else if (typeof metricsData === "object" && metricsData !== null) {
          latestMetrics = metricsData;
        }
        setMetrics(latestMetrics);

        // FIXED: Filter TRULY upcoming appointments only
        const appointmentsData = appointmentRes.data?.data;
        const allAppointments = Array.isArray(appointmentsData?.content) ? appointmentsData.content : [];
        const upcomingAppointment = allAppointments.find(apt =>
          ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'].includes(apt.status?.toUpperCase()) &&
          new Date(apt.appointmentDate) > new Date()
        );
        setNextAppointment(upcomingAppointment || null);
        console.log("Upcoming appointment:", upcomingAppointment);

        // Load doctor name for upcoming appointment (unchanged)
        if (upcomingAppointment?.doctorId) {
          try {
            const doctorRes = await patientServices.getDoctorById(upcomingAppointment.doctorId);
            const doctorData = doctorRes.data?.data;
            setDoctorName(`${doctorData?.firstName || ''} ${doctorData?.lastName || ''}`.trim() || "Doctor");
            console.log("Doctor loaded:", doctorData);
          } catch (err) {
            console.warn("Doctor name unavailable:", err);
            setDoctorName("Doctor");
          }
        }

        // FIXED: Split consultations - COMPLETED vs UPCOMING
        const consultationsData = consultationsRes.data?.data;
        const allConsultations = Array.isArray(consultationsData)
          ? consultationsData
          : consultationsData?.content || [];

        // Filter COMPLETED consultations for "Recent Consultations"
        const completedConsultations = allConsultations.filter(c =>
          ['COMPLETED', 'CLOSED'].includes((c.status || '').toUpperCase())
        ).slice(0, 3);

        // Filter UPCOMING consultations (for reference only)
        const upcomingConsultations = allConsultations.filter(c =>
          ['SCHEDULED', 'IN_PROGRESS'].includes((c.status || '').toUpperCase())
        );

        console.log("Completed consultations:", completedConsultations.length);
        console.log("Upcoming consultations:", upcomingConsultations.length);

        setConsultations(completedConsultations); // Only completed ones shown

        // Extract prescriptions (unchanged)
        const prescriptionsData = prescriptionsRes.data?.data;
        const prescriptionsList = Array.isArray(prescriptionsData)
          ? prescriptionsData
          : prescriptionsData?.content || [];
        setPrescriptions(prescriptionsList);

        // Extract notifications (unchanged)
        const notificationsData = notificationsRes.data?.data;
        const notificationsList = Array.isArray(notificationsData)
          ? notificationsData
          : notificationsData?.content || [];
        setNotifications(notificationsList);

      } catch (err) {
        console.error("Dashboard load error:", err);
        setError("Failed to load dashboard. Please refresh.");
        if (err.response?.status === 401) {
          console.warn("Unauthorized, redirecting to login");
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [refreshTrigger]);


  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (axiosClient.get(BASE_URLS.AUTH + '/patients/' + localStorage.getItem('id')))
        setRefreshTrigger(prev => prev + 1);
    }, 3000); // 30 seconds

    return () => clearInterval(interval);
  }, []);
  const isJoinable = (appointment) => {
    if (!appointment?.appointmentDate) return false;

    const now = new Date();
    const startTime = new Date(appointment.appointmentDate);
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // 30 min meeting

    // Button appears 15 minutes before the appointment until it ends
    const joinWindowStart = new Date(startTime.getTime() - 15 * 60 * 1000);
    return now >= joinWindowStart && now <= endTime;
  };


  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMetricValue = (field) => metrics[field] ?? "—";

  const handleJoinCall = () => {
    if (nextAppointment) {
      navigate("/patient/consultations/join", {
        state: { appointmentId: nextAppointment.id, refreshDashboard: true },
      });
    }
  };

  // Navigate to consultation notes
  const handleViewConsultationNotes = (consultationId) => {
    navigate(`/patient/consultations/${consultationId}`);
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar active="dashboard" onLogout={handleLogout} />
        <main className="dashboard-main">
          <Topbar
            patientName={localStorage.getItem("fullName") || "Patient"}
            email={localStorage.getItem("email") || ""}
          />
          <div className="dashboard-content">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading dashboard...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-layout">
        <Sidebar active="dashboard" onLogout={handleLogout} />
        <main className="dashboard-main">
          <Topbar
            patientName={localStorage.getItem("fullName") || "Patient"}
            email={localStorage.getItem("email") || ""}
          />
          <div className="dashboard-content">
            <div className="error-card">
              <h3>Dashboard Error</h3>
              <p>{error}</p>
              <div className="error-actions">
                <button className="btn primary" onClick={() => setRefreshTrigger(prev => prev + 1)}>
                  Retry
                </button>
                <button className="btn secondary" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const name = localStorage.getItem("fullName") || "Patient";
  const email = localStorage.getItem("email") || "";

  return (
    <div className="dashboard-layout">
      <Sidebar active="dashboard" onLogout={handleLogout} />
      <main className="dashboard-main">
        <Topbar patientName={name} email={email} />

        <div className="dashboard-content">
          {/* Refresh Button */}
          <button
            className="refresh-btn"
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            style={{
              position: 'sticky',
              top: '10px',
              zIndex: 10,
              marginBottom: '20px',
              background: '#f8f9fa',
              border: '1px solid #e9ecef',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          >
            Refresh Dashboard
          </button>

          {/* Welcome Banner */}
          <section className="welcome-card">
            <div>
              <p className="welcome-chip">Remote Monitoring · Secure · Smart</p>
              <h2>Hello {name.split(" ")[0]}</h2>
              <p>Track your health and manage appointments easily.</p>
            </div>
          </section>

          {/* Health Metrics */}
          <section className="metrics-row">
            <MetricCard
              label="Heart Rate"
              value={getMetricValue("heartRate")}
              unit="bpm"
              icon=""
              status={metrics.heartRate ? "Normal" : "No data"}
            />
            <MetricCard
              label="Blood Pressure"
              value={
                metrics.systolic && metrics.diastolic
                  ? `${metrics.systolic}/${metrics.diastolic}`
                  : "—"
              }
              unit="mmHg"
              icon=""
              status={metrics.systolic ? "Stable" : "No data"}
            />
            <MetricCard
              label="SpO₂"
              value={getMetricValue("oxygenSaturation")}
              unit="%"
              icon=""
              status={metrics.oxygenSaturation ? "Good" : "No data"}
            />
            <MetricCard
              label="Temperature"
              value={getMetricValue("temperature")}
              unit="°C"
              icon=""
              status={metrics.temperature ? "Normal" : "No data"}
            />
          </section>

          {/* Appointments & Consultations */}
          <section className="dashboard-grid-2">
            <div className="panel">
              <h3>Next Appointment</h3>
              {nextAppointment && (
                <div className="appointment-card">
                  <p><strong>Dr. {doctorName}</strong></p>
                  <p className="appointment-date">Date: {formatDate(nextAppointment.appointmentDate)}</p>
                  <p className="appointment-time">Time: {formatTime(nextAppointment.appointmentDate)}</p>
                  <p className="appointment-reason">{nextAppointment.reason || "General Checkup"}</p>
                  <span className={`status-badge status-${nextAppointment.status?.toLowerCase()}`}>
                    {nextAppointment.status}
                  </span>

                  {isJoinable(nextAppointment) && (
                    <button className="btn primary small" onClick={handleJoinCall}>
                      Join Call
                    </button>
                  )}

                  <button
                    className="btn secondary small"
                    onClick={() => setRefreshTrigger(prev => prev + 1)}
                    style={{ marginTop: '5px', fontSize: '12px', padding: '4px 8px' }}
                  >
                    Check Status
                  </button>
                </div>
              )}
            </div>

            {/* FIXED: Clickable consultation notes */}
            <div className="panel">
              <h3>Recent Consultations</h3>
              {consultations.length === 0 ? (
                <div className="empty-panel">
                  <p>No completed consultations yet.</p>
                  <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
                    Completed consultations will appear here
                  </p>
                  <button className="btn primary small" onClick={() => navigate("/patient/appointments")}>
                    View Appointments →
                  </button>
                </div>
              ) : (
                <ul className="consultation-list">
                  {consultations.slice(0, 3).map((c) => (
                    <li key={c.id} className="consultation-item">
                      <div className="consultation-date">
                        {formatDate(c.createdAt || c.updatedAt || c.date)}
                      </div>
                      <div className="consultation-doctor">
                        {c.doctorName || "Doctor"}
                      </div>
                      <div className="consultation-status" style={{ fontSize: '12px', color: '#28a745' }}>
                        Completed
                      </div>
                      <button
                        className="link-button"
                        onClick={() => handleViewConsultationNotes(c.id)}
                        style={{ fontSize: '14px' }}
                      >
                        View Notes →
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Prescriptions & Notifications */}
          <section className="dashboard-grid-2">
            <div className="panel">
              <h3>Active Prescriptions</h3>
              {prescriptions.length === 0 ? (
                <p>No active prescriptions.</p>
              ) : (
                <ul className="pill-list">
                  {prescriptions.slice(0, 3).map((p) => (
                    <li key={p.id} className="pill-card">
                      <p className="pill-title">
                        {p.medicineName || p.medicine || "Medicine"}
                      </p>
                      <p className="pill-dosage">
                        {p.dosage || "—"} • {p.frequency || "—"}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="panel">
              <h3>Notifications</h3>
              {notifications.length === 0 ? (
                <p>No new notifications.</p>
              ) : (
                <ul className="notification-list">
                  {notifications.slice(0, 3).map((n) => (
                    <li key={n.id} className="notification-item">
                      <strong>{n.title || n.subject || "Notification"}</strong>
                      <p>{n.message || n.content || "No message"}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="quick-actions-section">
            <h3>Quick Actions</h3>
            <div className="quick-actions-grid">
              <button
                className="quick-action-btn"
                onClick={() => navigate("/patient/find-doctor")}
              >
                Find Doctor
              </button>
              <button
                className="quick-action-btn"
                onClick={() => navigate("/patient/appointments")}
              >
                Appointments
              </button>
              <button
                className="quick-action-btn"
                onClick={() => navigate("/patient/health-records/new")}
              >
                Add Health Data
              </button>
              <button
                onClick={() => navigate('/patient/prescriptions')}
                className="quick-link"
              >
                My Prescriptions
              </button>
              <button
                onClick={() => navigate('/patient/consultations')}
                className="quick-link"
              >
                My Consultations
              </button>
              <button
                className="quick-action-btn"
                onClick={() => navigate("/patient/settings")}
              >
                Settings
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default PatientDashboard;