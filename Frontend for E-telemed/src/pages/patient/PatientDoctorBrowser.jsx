import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import patientServices from "../../api/patient/patientServices";
import Sidebar from "../../components/patient/Sidebar";
import Topbar from "../../components/patient/Topbar";
import "../../styles/patientDashboard.css";

function PatientDoctorBrowser() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const specializations = [
    "All",
    "Cardiology",
    "Dermatology",
    "Pediatrics",
    "Orthopedics",
    "General Practice",
    "Psychiatry",
    "Neurology",
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/patient/login");
  };

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoading(true);
        let response;

        if (selectedSpecialization && selectedSpecialization !== "All") {
          response = await patientServices.getDoctorsBySpecialization(
            selectedSpecialization,
            page,
            12
          );
        } else {
          response = await patientServices.getAllDoctors(page, 12);
        }

        const doctorsData = response.data?.data || response.data;
        if (doctorsData?.content) {
          setDoctors(doctorsData.content);
          setTotalPages(doctorsData.totalPages || 1);
        } else if (Array.isArray(doctorsData)) {
          setDoctors(doctorsData);
        }
      } catch (err) {
        console.error("Failed to load doctors:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, [selectedSpecialization, page]);

  const handleBookAppointment = (doctor) => {
    navigate("/patient/book-appointment", { state: { doctor } });
  };

  return (
    <div className="patient-layout">
      <Sidebar active="find-doctor" onLogout={handleLogout} />
      <main className="patient-main">
        <Topbar patientName={localStorage.getItem("fullName") || "Patient"} />

        <div className="patient-content">
          <section className="page-header">
            <h1>Find A Doctor</h1>
            <p>Browse and book appointments with qualified healthcare professionals</p>
          </section>

          {/* Specialization Filter */}
          <section className="filter-section">
            <div className="filter-group">
              <label>Specialization</label>
              <div className="specialization-buttons">
                {specializations.map((spec) => (
                  <button
                    key={spec}
                    className={`filter-btn ${
                      selectedSpecialization === spec || (spec === "All" && !selectedSpecialization)
                        ? "active"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedSpecialization(spec === "All" ? "" : spec);
                      setPage(0);
                    }}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Doctors Grid */}
          {loading ? (
            <div className="loading-spinner">Loading doctors...</div>
          ) : doctors.length === 0 ? (
            <div className="empty-state">
              <p>🏥 No doctors found for this specialization</p>
            </div>
          ) : (
            <>
              <section className="doctors-grid">
                {doctors.map((doctor) => (
                  <div key={doctor.id} className="doctor-card">
                    <div className="doctor-header">
                      <div className="doctor-avatar">
                        {doctor.firstName?.charAt(0).toUpperCase()}
                      </div>
                      <div className="doctor-info">
                        <h3>{"Dr. "+doctor.firstName+" "+doctor.lastName}</h3>
                        <p className="specialization">{doctor.specialization}</p>
                      </div>
                    </div>

                    <div className="doctor-details">
                      <p>
                        <strong>Experience:</strong> {doctor.yearsOfExperience || "—"} years
                      </p>
                      <p>
                        <strong>License:</strong> {doctor.licenseNumber || "—"}
                      </p>
                      <p>
                        <strong>Rating:</strong> ⭐ {doctor.rating || "4.5"}/5
                      </p>
                      {doctor.bio && (
                        <p>
                          <strong>About:</strong> {doctor.bio}
                        </p>
                      )}
                    </div>

                    <div className="doctor-footer">
                      <button
                        className="btn primary full-width"
                        onClick={() => handleBookAppointment(doctor)}
                      >
                        📅 Book Appointment
                      </button>
                      <button
                        className="btn secondary full-width"
                        onClick={() => navigate(`/patient/doctor/${doctor.id}`)}
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                ))}
              </section>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="btn secondary"
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                  >
                    ← Previous
                  </button>
                  <span>
                    Page {page + 1} of {totalPages}
                  </span>
                  <button
                    className="btn secondary"
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page === totalPages - 1}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default PatientDoctorBrowser;
