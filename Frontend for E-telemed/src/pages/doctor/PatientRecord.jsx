import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import doctorServices from "../../api/doctor/doctorServices";
import Sidebar from "../../components/doctor/Sidebar";
import Topbar from "../../components/doctor/Topbar";
import "../../styles/doctorDashboard.css";

function PatientRecord() {
  const navigate = useNavigate();
  const { id: patientId } = useParams();
  const [patient, setPatient] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/doctor/login");
  };

  useEffect(() => {
    const loadPatientRecord = async () => {
      try {
        setLoading(true);
        // Fetch patient details
        // You may need to add this endpoint to doctorServices
        setPatient({
          id: patientId,
          fullName: "Patient Name",
          age: 35,
          phone: "555-0123",
          email: "patient@example.com",
          medicalHistory: "No significant medical history",
        });

        // Fetch consultations
        const consultationsRes = await doctorServices
          .getPatientConsultations(patientId)
          .catch(() => ({ data: { data: [] } }));

        const consultationsData = consultationsRes.data?.data || [];
        setConsultations(Array.isArray(consultationsData) ? consultationsData : []);
      } catch (err) {
        console.error("Failed to load patient record:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPatientRecord();
  }, [patientId]);

  if (loading) {
    return (
      <div className="doctor-layout">
        <Sidebar active="patients" onLogout={handleLogout} />
        <div className="doctor-main">
          <div className="loading-spinner">Loading patient record...</div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="doctor-layout">
        <Sidebar active="patients" onLogout={handleLogout} />
        <main className="doctor-main">
          <Topbar />
          <div className="doctor-content">
            <div className="error-card">
              <h3>⚠️ Patient Not Found</h3>
              <button className="btn primary" onClick={() => navigate("/doctor/patients")}>
                Back to Patients
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="doctor-layout">
      <Sidebar active="patients" onLogout={handleLogout} />
      <main className="doctor-main">
        <Topbar />

        <div className="doctor-content">
          <button className="btn secondary" onClick={() => navigate("/doctor/patients")}>
            ← Back to Patients
          </button>

          {/* Patient Information */}
          <section className="card">
            <h3>👤 Patient Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Full Name</label>
                <p>{patient.fullName}</p>
              </div>
              <div className="info-item">
                <label>Age</label>
                <p>{patient.age}</p>
              </div>
              <div className="info-item">
                <label>Phone</label>
                <p>{patient.phone}</p>
              </div>
              <div className="info-item">
                <label>Email</label>
                <p>{patient.email}</p>
              </div>
            </div>
          </section>

          {/* Medical History */}
          <section className="card">
            <h3>📋 Medical History</h3>
            <p>{patient.medicalHistory || "No medical history recorded"}</p>
          </section>

          {/* Consultations */}
          <section className="card">
            <h3>📝 Consultation History</h3>
            {consultations.length === 0 ? (
              <p>No consultations found</p>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Diagnosis</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consultations.map((c) => (
                      <tr key={c.id}>
                        <td>
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>
                        <td>{c.diagnosis || "—"}</td>
                        <td>
                          <span className={`status status-${c.status?.toLowerCase()}`}>
                            {c.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn secondary small"
                            onClick={() =>
                              navigate(`/doctor/consultations/${c.id}/view`)
                            }
                          >
                            View
                          </button>
                        </td>
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

export default PatientRecord;