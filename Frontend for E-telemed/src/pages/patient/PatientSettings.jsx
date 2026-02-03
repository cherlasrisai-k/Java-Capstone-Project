import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  getCurrentPatient, 
  updatePatientProfile, 
  getNotificationPreferences, 
  updateNotificationPreferences, 
  changePatientPassword 
} from "../../api/patient/patientServices";
import Sidebar from "../../components/patient/Sidebar";
import Topbar from "../../components/patient/Topbar";
import "../../styles/dashboard.css";

function PatientSettings() {
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    emergencyContact: "",
    emergencyContactNumber: "",  // ✅ Added missing field
  });
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailAppointments: true,
    emailVitals: true,
    inAppNotifications: true,
    smsAlerts: false,
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleLogout = () => {
    localStorage.clear();
    navigate("/patient/login", { replace: true });
  };

  // Fetch patient profile AND notification preferences
  useEffect(() => {
    const fetchData = async () => {
      const userId = localStorage.getItem("id");
      if (!userId) return handleLogout();

      try {
        // Fetch patient profile
        const patientRes = await getCurrentPatient();
        const patientData = patientRes.data?.data || patientRes.data || {};
        setPatient(patientData);
        
        // Populate profile form
        setProfileForm({
          firstName: patientData.firstName || "",
          lastName: patientData.lastName || "",
          email: patientData.email || localStorage.getItem("email") || "",
          phone: patientData.phoneNumber || patientData.phone || "",
          dateOfBirth: patientData.dateOfBirth || "",
          emergencyContact: patientData.emergencyContactName || "",
          emergencyContactNumber: patientData.emergencyContactPhone || "",  // ✅ Added
        });

        // Fetch notification preferences separately
        try {
          const prefsRes = await getNotificationPreferences(userId);
          const prefsData = prefsRes.data?.data || prefsRes.data || {};
          setNotificationPrefs(prefsData);
        } catch (prefsErr) {
          console.warn("Could not fetch notification preferences:", prefsErr);
          // Keep defaults
        }
      } catch (err) {
        console.error("Failed to fetch patient profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationPrefs(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const saveProfile = async () => {
    const patientId = localStorage.getItem("id");
    if (!patientId) {
      alert("User not logged in");
      navigate("/patient/login");
      return;
    }

    try {
      await updatePatientProfile(patientId, profileForm);
      alert("✅ Profile updated successfully!");
      setEditingProfile(false);
      setPatient((prev) => ({ ...prev, ...profileForm }));

      // Update localStorage
      localStorage.setItem("fullName", `${profileForm.firstName} ${profileForm.lastName}`.trim());
      localStorage.setItem("email", profileForm.email);
    } catch (err) {
      console.error("Failed to update profile", err);
      alert(err.response?.data?.message || "Failed to update profile, please try again.");
    }
  };

  const saveNotifications = async () => {
    try {
      const patientId = localStorage.getItem("id");
      await updateNotificationPreferences(patientId, notificationPrefs);
      alert("✅ Notification preferences saved!");
    } catch (err) {
      console.error("Failed to save notifications:", err);
      alert(err.response?.data?.message || "Failed to save preferences.");
    }
  };

  const changePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      alert("Password must be at least 8 characters!");
      return;
    }
    
    try {
      const patientId = localStorage.getItem("id");
      await changePatientPassword(patientId, passwordForm);
      alert("✅ Password changed successfully!");
      setChangingPassword(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error("Password change failed:", err);
      alert(err.response?.data?.message || "Failed to change password.");
    }
  };

  const getPatientName = () => {
    return `${profileForm.firstName} ${profileForm.lastName}`.trim() || 
           localStorage.getItem("fullName") || "Patient";
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar active="settings" onLogout={handleLogout} />
        <main className="dashboard-main">
          <div className="dashboard-content">
            <div style={{ padding: "2rem", textAlign: "center" }}>
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Loading settings...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar active="settings" onLogout={handleLogout} />
      <main className="dashboard-main">
        <Topbar 
          patientName={getPatientName()} 
          email={profileForm.email || localStorage.getItem("email") || ""} 
        />

        <div className="dashboard-content">
          <section className="panel">
            <h3>Account Settings</h3>
            <p style={{ fontSize: "0.9rem", color: "#6b7280", marginBottom: "2rem" }}>
              Manage your profile, security, and notification preferences.
            </p>

            {/* Profile Section */}
            <div className="settings-group">
              <div className="settings-header">
                <h4>👤 Profile Information</h4>
                <button 
                  className="btn secondary small"
                  onClick={() => setEditingProfile(!editingProfile)}
                >
                  {editingProfile ? "Cancel" : "Edit"}
                </button>
              </div>
              
              {editingProfile ? (
                <div className="form-grid">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={profileForm.firstName}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={profileForm.lastName}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={profileForm.dateOfBirth}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Emergency Contact Name</label>
                    <input
                      type="text"
                      name="emergencyContact"
                      value={profileForm.emergencyContact}
                      onChange={handleProfileChange}
                      placeholder="Emergency contact name"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Emergency Contact Phone</label>
                    <input
                      type="tel"
                      name="emergencyContactNumber"
                      value={profileForm.emergencyContactNumber}
                      onChange={handleProfileChange}
                      placeholder="Emergency phone number"
                    />
                  </div>
                  <div className="form-actions">
                    <button className="btn primary" onClick={saveProfile}>
                      Save Profile
                    </button>
                  </div>
                </div>
              ) : (
                <div className="profile-display">
                  <p><strong>Name:</strong> {profileForm.firstName} {profileForm.lastName}</p>
                  <p><strong>Email:</strong> {profileForm.email}</p>
                  <p><strong>Phone:</strong> {profileForm.phone || "Not set"}</p>
                  <p><strong>Date of Birth:</strong> {profileForm.dateOfBirth || "Not set"}</p>
                  <p><strong>Emergency Contact:</strong> {profileForm.emergencyContact || "Not set"} {profileForm.emergencyContactNumber ? `(${profileForm.emergencyContactNumber})` : ""}</p>
                </div>
              )}
            </div>

            {/* Notifications Section */}
            <div className="settings-group">
              <h4>🔔 Notification Preferences</h4>
              <div className="notification-toggles">
                <label className="toggle-item">
                  <input
                    type="checkbox"
                    name="emailAppointments"
                    checked={notificationPrefs.emailAppointments}
                    onChange={handleNotificationChange}
                  />
                  <span>Email for appointments</span>
                </label>
                <label className="toggle-item">
                  <input
                    type="checkbox"
                    name="emailVitals"
                    checked={notificationPrefs.emailVitals}
                    onChange={handleNotificationChange}
                  />
                  <span>Email for vitals alerts</span>
                </label>
                <label className="toggle-item">
                  <input
                    type="checkbox"
                    name="inAppNotifications"
                    checked={notificationPrefs.inAppNotifications}
                    onChange={handleNotificationChange}
                  />
                  <span>In-app notifications</span>
                </label>
                <label className="toggle-item">
                  <input
                    type="checkbox"
                    name="smsAlerts"
                    checked={notificationPrefs.smsAlerts}
                    onChange={handleNotificationChange}
                  />
                  <span>SMS alerts (Premium)</span>
                </label>
              </div>
              <button className="btn primary small" onClick={saveNotifications}>
                Save Preferences
              </button>
            </div>

            {/* Security Section */}
            <div className="settings-group">
              <div className="settings-header">
                <h4>🔐 Security</h4>
                {changingPassword ? (
                  <button className="btn secondary small" onClick={() => setChangingPassword(false)}>
                    Cancel
                  </button>
                ) : (
                  <button className="btn secondary small" onClick={() => setChangingPassword(true)}>
                    Change Password
                  </button>
                )}
              </div>
              
              {changingPassword && (
                <div className="form-grid">
                  <div className="form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password (8+ chars)</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  <div className="form-actions">
                    <button className="btn primary" onClick={changePassword}>
                      Update Password
                    </button>
                  </div>
                </div>
              )}
            </div>

          </section>
        </div>
      </main>
    </div>
  );
}

export default PatientSettings;