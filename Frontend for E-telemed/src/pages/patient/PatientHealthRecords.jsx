import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLatestMetrics } from "../../api/patient/patientServices";
import Sidebar from "../../components/patient/Sidebar";
import Topbar from "../../components/patient/Topbar";
import "../../styles/dashboard.css";

function PatientHealthRecords() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/patient/login", { replace: true });
  };

  useEffect(() => {
    const fetchMetrics = async () => {
      const userId = localStorage.getItem("id");
      if (!userId) return handleLogout();

      try {
        const res = await getLatestMetrics(userId);
        // Expecting detailed metrics array
        setMetrics(
          Array.isArray(res.data?.data)
            ? res.data.data
            : Array.isArray(res.data)
            ? res.data
            : []
        );
      } catch (err) {
        console.error("Metrics fetch error:", err);
        if (err.response?.status === 401) handleLogout();
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) return <div style={{ padding: "2rem" }}>Loading health records...</div>;

  const name = localStorage.getItem("fullName") || "Patient";

  return (
    <div className="dashboard-layout">
      <Sidebar active="health" onLogout={handleLogout} />
      <main className="dashboard-main">
        <Topbar patientName={name} email={localStorage.getItem("email") || ""} />

        <div className="dashboard-content">
          <section className="panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3>Health Records</h3>
              <button
                className="btn primary small"
                onClick={() => navigate("/patient/health-records/new")}
              >
                Add New Reading
              </button>
            </div>

            {metrics.length === 0 ? (
              <p>No health records found.</p>
            ) : (
              <ul className="metrics-list">
                {metrics.map((record) => (
                  <li key={record.id}>
                    <div className="metric-item-main">
                      <span>
                        <strong>Date:</strong>{" "}
                        {new Date(record.recordedAt || record.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="metric-item-main" style={{ marginTop: "0.25rem" }}>
                      {record.systolic && record.diastolic && (
                        <p>Blood Pressure: {record.systolic}/{record.diastolic} mmHg</p>
                      )}
                      {record.heartRate && <p>Heart Rate: {record.heartRate} bpm</p>}
                      {record.temperature && <p>Temperature: {record.temperature} °C</p>}
                      {record.oxygenSaturation && <p>O₂ Saturation: {record.oxygenSaturation} %</p>}
                      {record.weight && <p>Weight: {record.weight} kg</p>}
                      {record.height && <p>Height: {record.height} cm</p>}
                      {record.notes && <p>Notes: {record.notes}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default PatientHealthRecords;