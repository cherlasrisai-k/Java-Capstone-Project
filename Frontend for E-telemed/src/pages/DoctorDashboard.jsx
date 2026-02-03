import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import doctorServices from "../api/doctor/doctorServices";
import Sidebar from "../components/doctor/Sidebar";
import Topbar from "../components/doctor/Topbar";
import "../styles/doctorDashboard.css";

function DoctorDashboard() {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    activePatients: 0,
    pendingApprovals: 0,
    unreadNotifications: 0,
    totalConsultations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/doctor/login");
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        // 1. Load doctor profile (CRITICAL - always works)
        const doctorRes = await doctorServices.getCurrentDoctor();
        const doctorData = doctorRes.data?.data || doctorRes.data;
        setDoctor(doctorData);

        if (doctorData?.id) {
          const doctorId = doctorData.id;

          // 2. Load appointments FIRST (your working API)
          const appointmentsRes = await doctorServices.getDoctorAppointments(doctorId, 0, 20);
          const appointments = appointmentsRes.data?.data?.content || [];

          // 3. Add patient names (with fallback)
          const appointmentsWithPatients = await Promise.all(
            appointments.map(async (appt) => {
              if (!appt.patientName && appt.patientId) {
                try {
                  const patientRes = await doctorServices.getPatientById(appt.patientId);
                  const patientData = patientRes.data?.data || patientRes.data;
                  appt.patientName = `${patientData.firstName || ''} ${patientData.lastName || ''}`.trim() || `Patient #${appt.patientId}`;
                } catch {
                  appt.patientName = `Patient #${appt.patientId}`;
                }
              }
              return appt;
            })
          );

          // 4. Filter appointments
          const today = new Date();
          const todayStr = today.toDateString();

          setTodayAppointments(appointmentsWithPatients.filter(appt =>
            new Date(appt.appointmentDate).toDateString() === todayStr
          ));

          setUpcomingAppointments(appointmentsWithPatients.filter(appt =>
            new Date(appt.appointmentDate) > today
          ));

          // 5. Load other data with individual error handling
          try {
            const patientsRes = await doctorServices.getRecentPatients(doctorId, 0, 5);
            setRecentPatients(patientsRes.data?.data?.content || []);
          } catch (e) {
            console.warn("Recent patients unavailable:", e);
            setRecentPatients([]);
          }

          try {
            const notificationsRes = await doctorServices.getNotifications(doctorId, 0, 5);
            setNotifications(notificationsRes.data?.data?.content || []);
          } catch (e) {
            console.warn("Notifications unavailable:", e);
            setNotifications([]);
          }

          try {
            const unreadRes = await doctorServices.getUnreadNotificationCount(doctorId);
            setStats(prev => ({ ...prev, unreadNotifications: unreadRes.data?.data || 0 }));
          } catch (e) {
            console.warn("Unread count unavailable:", e);
            setStats(prev => ({ ...prev, unreadNotifications: 0 }));
          }

          try {
            const alertsRes = await doctorServices.getDoctorAlerts(doctorId, 0, 5);
            setAlerts(alertsRes.data?.data?.content || []);
          } catch (e) {
            console.warn("Alerts unavailable:", e);
            setAlerts([]);
          }

          try {
            const consultationsRes = await doctorServices.getConsultations(doctorId, 0, 10);
            setStats(prev => ({ ...prev, totalConsultations: consultationsRes.data?.data?.content?.length || 0 }));
          } catch (e) {
            console.warn("Consultations unavailable:", e);
          }

          // 6. Calculate core stats
          setStats(prev => ({
            ...prev,
            activePatients: appointmentsWithPatients.length,
            pendingApprovals: appointmentsWithPatients.filter(a => a.status === "PENDING").length
          }));
        }
      } catch (err) {
        console.error("Critical dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

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

  const handleMarkNotificationRead = async (notificationId) => {
    try {
      await doctorServices.markNotificationAsRead(notificationId);
      setNotifications(notifs =>
        notifs.map(n => n.id === notificationId ? { ...n, status: 'READ' } : n)
      );
      setStats(prev => ({ ...prev, unreadNotifications: Math.max(0, prev.unreadNotifications - 1) }));
    } catch (err) {
      console.error("Failed to mark read:", err);
    }
  };

  if (loading) {
    return (
      <div className="doctor-layout">
        <Sidebar active="dashboard" onLogout={handleLogout} />
        <div className="doctor-main">
          <div className="loading-spinner">Loading Dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-layout">
      <Sidebar active="dashboard" onLogout={handleLogout} />
      <div className="doctor-main">
        <Topbar
          doctorName={`${doctor?.firstName || ""} ${doctor?.lastName || ""}`.trim()}
          specialization={doctor?.specialization}
          appointmentCount={todayAppointments.length}
          unreadNotifications={stats.unreadNotifications}
        />

        <main className="doctor-content">
          {/* Summary Cards */}
          <section className="summary-grid">
            <div className="summary-card">
              <div className="summary-icon">📅</div>
              <div>
                <p className="summary-label">Today's Appointments</p>
                <p className="summary-value">{todayAppointments.length}</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon">👥</div>
              <div>
                <p className="summary-label">Total Patients</p>
                <p className="summary-value">{stats.activePatients}</p>
              </div>
            </div>
            <div className="summary-card warning">
              <div className="summary-icon">⏳</div>
              <div>
                <p className="summary-label">Pending Approvals</p>
                <p className="summary-value">{stats.pendingApprovals}</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="summary-icon">🔔</div>
              <div>
                <p className="summary-label">Unread Notifications</p>
                <p className="summary-value">{stats.unreadNotifications}</p>
              </div>
            </div>
          </section>

          {/* Main Content Grid */}
          <div className="main-grid">
            {/* Today's Schedule - ALWAYS WORKS */}
            <section className="card">
              <h3>📅 Today's Schedule</h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Patient</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {// Find this in your dashboard table (around line 200):
                      todayAppointments.map((appt) => (
                        <tr key={appt.id}>
                          <td>{formatTime(appt.appointmentDate)}</td>
                          <td>{appt.patientName}</td>
                          <td>{appt.reason}</td>
                          <td><span className={`status status-${appt.status?.toLowerCase()}`}>{appt.status}</span></td>

                          {/* ✅ REPLACE THIS ENTIRE <td> */}
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                className="btn primary small"
                                onClick={() => navigate(`/doctor/appointments/${appt.id}`)}
                              >
                                👁️ View
                              </button>
                              {appt.status === "PENDING" && (
                                <button
                                  className="btn success small"
                                  onClick={() => handleConfirmAppointment(appt.id)}
                                >
                                  ✓ Approve
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    {todayAppointments.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center">No appointments today</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Upcoming Appointments */}
            <section className="card">
              <h3>📋 Upcoming Appointments</h3>
              <div className="appointments-list">
                {upcomingAppointments.slice(0, 3).map((appt) => (
                  <div key={appt.id} className="appointment-item">
                    <div className="appointment-time">
                      {formatTime(appt.appointmentDate)}
                    </div>
                    <div className="appointment-patient">
                      {appt.patientName}
                    </div>
                    <div className={`status-badge status-${appt.status?.toLowerCase()}`}>
                      {appt.status}
                    </div>
                  </div>
                ))}
                {upcomingAppointments.length === 0 && (
                  <div className="no-data">No upcoming appointments</div>
                )}
              </div>
            </section>
          </div>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <section className="card notifications-dropdown">
              <h4>🔔 Notifications ({notifications.length})</h4>
              <div className="notifications-list">
                {notifications.slice(0, 5).map((notif) => (
                  <div key={notif.id} className={`notification-item ${notif.status === 'UNREAD' ? 'unread' : ''}`}>
                    <div>{notif.title}</div>
                    <div className="notification-message">{notif.message}</div>
                    {notif.status === 'UNREAD' && (
                      <button
                        className="btn small"
                        onClick={() => handleMarkNotificationRead(notif.id)}
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                ))}
                {notifications.length === 0 && (
                  <div className="no-data">No notifications</div>
                )}
              </div>
            </section>
          )}

          {/* Doctor Profile */}
          <section className="card full-width">
            <h3>👨‍⚕️ Profile: Dr. {doctor?.firstName} {doctor?.lastName}</h3>
            <div className="profile-grid">
              <div><strong>Specialization:</strong> {doctor?.specialization || 'N/A'}</div>
              <div><strong>Experience:</strong> {doctor?.yearsOfExperience || 0} years</div>
              <div><strong>Consultation Fee:</strong> ₹{doctor?.consultationFee || 0}</div>
              <div><strong>License:</strong> {doctor?.licenseNumber || 'N/A'}</div>
              <div><strong>Phone:</strong> {doctor?.phoneNumber || 'N/A'}</div>
            </div>
          </section>

          <section className="quick-actions-section">
            <h3>⚡ Quick Actions</h3>
            <div className="quick-actions-grid">
              <button
                onClick={() => navigate('/doctor/consultations')}
                className="quick-action-btn"
              >
                💬 Active Consultations
              </button>
              &nbsp;&nbsp;
              <button className="quick-action-btn"
                onClick={() => navigate('/doctor/prescriptions')}
              >
                💊 My Prescriptions
              </button>

            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default DoctorDashboard;