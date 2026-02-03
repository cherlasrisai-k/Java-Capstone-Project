// src/pages/doctor/DoctorPrescriptions.jsx - COMPLETE REPLACE
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import doctorServices from "../../api/doctor/doctorServices";
import Sidebar from "../../components/doctor/Sidebar";
import Topbar from "../../components/doctor/Topbar";
import "../../styles/doctorDashboard.css";

function DoctorPrescriptions() {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/doctor/login");
  };

  useEffect(() => {
    const loadPrescriptions = async () => {
      try {
        setLoading(true);
        const doctorRes = await doctorServices.getCurrentDoctor();
        const doctorData = doctorRes.data?.data || doctorRes.data;
        setDoctor(doctorData);

        if (doctorData?.id) {
          const res = await doctorServices.getDoctorPrescriptions(doctorData.id, 0, 50);
          const data = res.data?.data?.content || [];
          setPrescriptions(data);
        }
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
      <div className="doctor-layout">
        <Sidebar active="prescriptions" onLogout={handleLogout} />
        <div className="doctor-main">
          <div className="loading-spinner">Loading prescriptions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-layout">
      <Sidebar active="prescriptions" onLogout={handleLogout} />
      <div className="doctor-main">
        <Topbar
          doctorName={`${doctor?.firstName || ""} ${doctor?.lastName || ""}`.trim()}
          specialization={doctor?.specialization}
        />
        <main className="doctor-content">
          <section className="card full-width">
            <h1>💊 My Prescriptions</h1>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient ID</th>
                    <th>Diagnosis</th>
                    <th>Date</th>
                    <th>Valid Until</th>
                    <th>Medications</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map((rx) => (
                    <tr key={rx.id}>
                      <td>{rx.patientId}</td>
                      <td>{rx.diagnosis?.substring(0, 50)}...</td>
                      <td>{new Date(rx.prescriptionDate).toLocaleDateString()}</td>
                      <td>{rx.validUntil}</td>
                      <td>{rx.medications?.length || 0}</td>
                      <td>
                        <span className={`status status-${rx.status?.toLowerCase()}`}>
                          {rx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {prescriptions.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center">
                        No prescriptions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default DoctorPrescriptions;