import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import doctorServices from "../../api/doctor/doctorServices";
import Sidebar from "../../components/doctor/Sidebar";
import Topbar from "../../components/doctor/Topbar";
import "../../styles/doctorDashboard.css";
import axiosClient, { BASE_URLS } from "../../api/axiosClient";

function DoctorPatients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/doctor/login");
  };

  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoading(true);
        
        // Load doctor profile
        const doctorRes = await doctorServices.getCurrentDoctor();
        const doctorData = doctorRes.data?.data || doctorRes.data;
        setDoctor(doctorData);

        // ✅ FIXED: Load ALL patients from AUTH service (port 8081)
        const patientsRes = await axiosClient.get(`${BASE_URLS.AUTH}/patients`, {
          params: { page: 0, size: 20 }
        });
        
        // ✅ Parse paginated response correctly
        const patientsData = patientsRes.data?.data?.content || [];
        setPatients(patientsData.map(patient => ({
          id: patient.id,
          fullName: `${patient.firstName} ${patient.lastName}`,
          firstName: patient.firstName,
          lastName: patient.lastName,
          age: calculateAge(patient.dateOfBirth),
          phone: patient.phoneNumber,
          email: patient.email,
          bloodGroup: patient.bloodGroup,
          gender: patient.gender,
          emergencyContact: `${patient.emergencyContactName} (${patient.emergencyContactPhone})`
        })));
        
      } catch (err) {
        console.error("Failed to load patients:", err);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, []);

  // ✅ Calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return "—";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const filteredPatients = patients.filter((patient) =>
    patient.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="doctor-layout">
      <Sidebar active="patients" onLogout={handleLogout} />
      <main className="doctor-main">
        <Topbar
          doctorName={doctor?.firstName ? `${doctor.firstName} ${doctor.lastName}` : "Doctor"}
          specialization={doctor?.specialization}
        />

        <div className="doctor-content">
          <div className="card">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1>👥 My Patients ({patients.length})</h1>
                <p>View and manage patient records</p>
              </div>
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search patients by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ 
                    padding: '10px 16px', 
                    border: '1px solid #ddd', 
                    borderRadius: '8px', 
                    width: '300px' 
                  }}
                />
              </div>
            </div>

            {loading ? (
              <div className="loading-spinner" style={{ textAlign: 'center', padding: '60px' }}>
                <div className="spinner"></div>
                <p>Loading patients...</p>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="empty-state" style={{ textAlign: 'center', padding: '60px' }}>
                <p style={{ fontSize: '48px', marginBottom: '16px' }}>👥</p>
                <h3>No patients found</h3>
                <p>{searchTerm ? "Try a different search term" : "No patient records available"}</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Patient Name</th>
                      <th>Age</th>
                      <th>Phone</th>
                      <th>Blood Group</th>
                      <th>Email</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map((patient) => (
                      <tr key={patient.id}>
                        <td>
                          <div>
                            <strong>{patient.fullName}</strong>
                            <br />
                            <small style={{ color: '#666' }}>
                              {patient.gender} • {patient.bloodGroup}
                            </small>
                          </div>
                        </td>
                        <td>{patient.age}</td>
                        <td>{patient.phone}</td>
                        <td>{patient.bloodGroup}</td>
                        <td>
                          <small style={{ color: '#007bff', fontWeight: '500' }}>
                            {patient.email}
                          </small>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="btn primary small"
                              onClick={() => navigate(`/doctor/patients/${patient.id}`)}
                              style={{ padding: '6px 12px' }}
                            >
                              View Profile
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default DoctorPatients;