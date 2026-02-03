import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import doctorServices from "../../api/doctor/doctorServices";
import Sidebar from "../../components/doctor/Sidebar";
import Topbar from "../../components/doctor/Topbar";
import "../../styles/doctorDashboard.css";

function DoctorConsultations() {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [patientNames, setPatientNames] = useState({});

  // ========== LOGOUT ==========
  const handleLogout = () => {
    localStorage.clear();
    navigate("/doctor/login");
  };

  // ========== LOAD CONSULTATIONS ==========
  useEffect(() => {
    const loadConsultations = async () => {
      try {
        setLoading(true);
        const doctorRes = await doctorServices.getCurrentDoctor();
        const doctorData = doctorRes.data?.data || doctorRes.data;
        setDoctor(doctorData);

        if (doctorData?.id) {
          const res = await doctorServices.getDoctorConsultations(doctorData.id, page, 10);
          const consultationsData = res.data?.data || res.data;

          if (consultationsData?.content) {
            setConsultations(consultationsData.content);
            setTotalPages(consultationsData.totalPages || 1);
          } else if (Array.isArray(consultationsData)) {
            setConsultations(consultationsData);
          }
        }
      } catch (err) {
        console.error("❌ Consultations load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadConsultations();
  }, [page, doctor?.id]);

  // ========== LOAD PATIENT NAMES ==========
  // ✅ FIXED: Fetch patient names asynchronously
  useEffect(() => {
    const loadPatientNames = async () => {
      const names = {};

      for (const consultation of consultations) {
        if (consultation.patientId && !names[consultation.patientId]) {
          try {
            const patientRes = await doctorServices.getPatientById(consultation.patientId);
            const patientData = patientRes.data?.data || patientRes.data;
            names[consultation.patientId] = 
              `${patientData.firstName || ''} ${patientData.lastName || ''}`.trim() || `Patient #${consultation.patientId}`;
          } catch (err) {
            console.log(`Could not load patient ${consultation.patientId}`);
            names[consultation.patientId] = `Patient #${consultation.patientId}`;
          }
        }
      }

      setPatientNames(names);
    };

    if (consultations.length > 0) {
      loadPatientNames();
    }
  }, [consultations]);

  // ========== FORMAT DATE ==========
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ========== GET STATUS BADGE COLOR ==========
  const getStatusBadgeColor = (status) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
        return "status-completed";
      case "IN_PROGRESS":
        return "status-in_progress";
      case "PENDING":
        return "status-pending";
      default:
        return "status-scheduled";
    }
  };

  // ========== LOADING STATE ==========
  if (loading) {
    return (
      <div className="doctor-layout">
        <Sidebar active="consultations" onLogout={handleLogout} />
        <div className="doctor-main">
          <div className="loading-spinner">⏳ Loading consultations...</div>
        </div>
      </div>
    );
  }

  // ========== MAIN RENDER ==========
  return (
    <div className="doctor-layout">
      <Sidebar active="consultations" onLogout={handleLogout} />
      <div className="doctor-main">
        <Topbar 
          doctorName={`${doctor?.firstName || ""} ${doctor?.lastName || ""}`.trim()}
          specialization={doctor?.specialization} 
        />

        <main className="doctor-content">
          <div className="card">
            <div className="page-header">
              <h1>📋 Consultation History</h1>
              <p>View and manage past consultations</p>
            </div>

            {consultations.length === 0 ? (
              <div className="empty-state">
                <p>📭 No consultations found</p>
                <button 
                  className="btn btn-primary" 
                  onClick={() => navigate("/doctor/appointments")}
                >
                  Go to Appointments
                </button>
              </div>
            ) : (
              <>
                <div className="consultations-grid">
                  {consultations.map((consultation) => (
                    <div
                      key={consultation.id}
                      className="consultation-card"
                      onClick={() => navigate(`/doctor/consultations/${consultation.id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="card-header">
                        {/* ✅ FIXED: Use patientNames state instead of sync API call */}
                        <h3>
                          {patientNames[consultation.patientId] || `Patient #${consultation.patientId}`}
                        </h3>
                        <span className={`status ${getStatusBadgeColor(consultation.status)}`}>
                          {consultation.status || "Completed"}
                        </span>
                      </div>

                      <div className="card-body">
                        <p>
                          <strong>Date:</strong> {" "}
                          {formatDate(consultation.createdAt || consultation.date)}
                        </p>
                        <p>
                          <strong>Chief Complaint:</strong> {" "}
                          {consultation.chiefComplaint || "—"}
                        </p>
                        <p>
                          <strong>Diagnosis:</strong> {" "}
                          {consultation.diagnosis || "Pending"}
                        </p>
                      </div>

                      <div className="card-footer" style={{ display: "flex", gap: "8px", justifyContent: "space-between" }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/doctor/consultations/${consultation.id}/view`);
                          }}
                        >
                          📝 View Notes
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/doctor/consultations/${consultation.id}/prescription`);
                          }}
                        >
                          💊 Prescription
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ========== PAGINATION ========== */}
                {totalPages > 1 && (
                  <div 
                    className="pagination" 
                    style={{ 
                      display: "flex", 
                      gap: "12px", 
                      justifyContent: "center", 
                      alignItems: "center", 
                      marginTop: "24px" 
                    }}
                  >
                    <button
                      className="btn btn-secondary"
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                    >
                      ← Previous
                    </button>
                    <span style={{ fontWeight: "500" }}>
                      Page {page + 1} of {totalPages}
                    </span>
                    <button
                      className="btn btn-secondary"
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
    </div>
  );
}

export default DoctorConsultations;