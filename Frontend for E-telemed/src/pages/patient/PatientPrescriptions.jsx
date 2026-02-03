// src/pages/patient/PatientPrescriptions.jsx - COMPLETE REPLACE
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import patientServices from "../../api/patient/patientServices";
import Sidebar from "../../components/patient/Sidebar";
import Topbar from "../../components/patient/Topbar";
import "../../styles/patientDashboard.css";

function PatientPrescriptions() {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/patient/login");
  };

  useEffect(() => {
    const loadPrescriptions = async () => {
      try {
        setLoading(true);
        const patientId = localStorage.getItem("id");
        if (!patientId) return handleLogout();

        const res = await patientServices.getPatientPrescriptions(patientId, 0, 50);
        const data = res.data?.data?.content || [];
        setPrescriptions(data);
      } catch (err) {
        console.error("Failed to load prescriptions:", err);
      } finally {
        setLoading(false);
      }
    };
    loadPrescriptions();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar active="prescriptions" onLogout={handleLogout} />
        <main className="dashboard-main">
          <div className="loading-spinner">Loading prescriptions...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar active="prescriptions" onLogout={handleLogout} />
      <main className="dashboard-main">
        <Topbar 
          patientName={localStorage.getItem("fullName") || "Patient"} 
          email={localStorage.getItem("email") || ""} 
        />
        <div className="dashboard-content">
          <section className="panel">
            <h2>💊 My Prescriptions</h2>
            {prescriptions.length === 0 ? (
              <div className="empty-state">
                <p>You have no prescriptions yet.</p>
              </div>
            ) : (
              <div className="prescriptions-list">
                {prescriptions.map((rx) => (
                  <div key={rx.id} className="prescription-card">
                    <div className="prescription-header">
                      <h3>Prescription #{rx.id}</h3>
                      <span className={`status-pill status-${rx.status?.toLowerCase()}`}>
                        {rx.status}
                      </span>
                    </div>
                    <div className="prescription-details">
                      <p><strong>Diagnosis:</strong> {rx.diagnosis}</p>
                      <p><strong>Valid Until:</strong> {rx.validUntil}</p>
                    </div>
                    <div className="medications-list">
                      <h4>Medications ({rx.medications?.length || 0})</h4>
                      {rx.medications?.map((med, idx) => (
                        <div key={idx} className="medication-item">
                          <p><strong>{med.medicationName}</strong> - {med.dosage}</p>
                          <p>Frequency: {med.frequency} | {med.durationDays} days</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default PatientPrescriptions;