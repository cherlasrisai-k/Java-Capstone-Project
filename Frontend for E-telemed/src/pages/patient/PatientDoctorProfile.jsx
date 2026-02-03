import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import patientServices from "../../api/patient/patientServices";
import Sidebar from "../../components/patient/Sidebar";
import Topbar from "../../components/patient/Topbar";
import "../../styles/patientDashboard.css";

function PatientDoctorProfile() {
  const navigate = useNavigate();
  const { doctorId } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/patient/login");
  };

  useEffect(() => {
    const loadDoctor = async () => {
      try {
        setLoading(true);
        const response = await patientServices.getDoctorById(doctorId);
        setDoctor(response.data?.data || response.data);
      } catch (err) {
        console.error("Failed to load doctor:", err);
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      loadDoctor();
    }
  }, [doctorId]);

  if (loading) {
    return (
      <div className="patient-layout">
        <Sidebar active="find-doctor" onLogout={handleLogout} />
        <main className="patient-main">
          <Topbar />
          <div className="patient-content">
            <div className="loading-spinner">Loading doctor profile...</div>
          </div>
        </main>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="patient-layout">
        <Sidebar active="find-doctor" onLogout={handleLogout} />
        <main className="patient-main">
          <Topbar />
          <div className="patient-content">
            <div className="error-card">
              <h3>❌ Doctor Not Found</h3>
              <button className="btn primary" onClick={() => navigate("/patient/find-doctor")}>
                Browse Doctors
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="patient-layout">
      <Sidebar active="find-doctor" onLogout={handleLogout} />
      <main className="patient-main">
        <Topbar patientName={localStorage.getItem("fullName") || "Patient"} />

        <div className="patient-content">
          <button className="btn secondary" onClick={() => navigate("/patient/find-doctor")}>
            ← Back to Doctors
          </button>

          <div className="doctor-profile-container">
            {/* Header */}
            <section className="doctor-header">
              <div className="doctor-avatar-lg">
                {doctor.firstName?.charAt(0).toUpperCase()}
              </div>
              <div className="doctor-header-info">
                <h1>{"Dr. "+doctor.firstName+" "+doctor.lastName}</h1>
                <p className="specialization">{doctor.specialization}</p>
                <div className="doctor-meta">
                  <span>⭐ {doctor.rating || "4.5"}/5</span>
                  <span>📅 {doctor.yearsOfExperience || "0"} years experience</span>
                </div>
              </div>
            </section>

            {/* Details Grid */}
            <div className="details-grid">
              {/* About Section */}
              <section className="card">
                <h3>About</h3>
                <p>{doctor.bio || "Hi, My Name is "+doctor.firstName+" "+doctor.lastName+",I have "+doctor.yearsOfExperience+" years of experience in "+doctor.specialization+",I have done "+doctor.qualifications}</p>
              </section>

              {/* Credentials */}
              <section className="card">
                <h3>Credentials</h3>
                <p>
                  <strong>License Number:</strong> {doctor.licenseNumber || "—"}
                </p>
                <p>
                  <strong>Registration Number:</strong> {doctor.id || "—"}
                </p>
                <p>
                  <strong>Qualifications:</strong> {doctor.qualifications || "—"}
                </p>
              </section>

              {/* Contact */}
              <section className="card">
                <h3>Contact</h3>
                <p>
                  <strong>Email:</strong> {doctor.email || "—"}
                </p>
                <p>
                  <strong>Phone:</strong> {doctor.phoneNumber || "—"}
                </p>
              </section>

              {/* Availability */}
              <section className="card">
                <h3>Availability</h3>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className={`status status-${doctor.isAvailable ? "available" : "unavailable"}`}>
                    {doctor.isAvailable ? "Available" : "Unavailable"}
                  </span>
                </p>
              </section>
            </div>

            {/* Action Buttons */}
            <section className="doctor-actions">
              <button
                className="btn primary large"
                onClick={() =>
                  navigate("/patient/book-appointment", { state: { doctor } })
                }
              >
                📅 Book Appointment
              </button>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PatientDoctorProfile;