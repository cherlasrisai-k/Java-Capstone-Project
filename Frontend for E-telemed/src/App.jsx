// src/App.jsx - COMPLETE PRODUCTION READY
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";

// ==================== PATIENT IMPORTS ====================
import PatientLogin from "./pages/PatientLogin";
import PatientRegister from "./pages/PatientRegister";
import PatientDashboard from "./pages/PatientDashboard";
import PatientAppointments from "./pages/patient/PatientAppointments";
import PatientHealthRecords from "./pages/patient/PatientHealthRecords";
import PatientPrescriptions from "./pages/patient/PatientPrescriptions";
import PatientSettings from "./pages/patient/PatientSettings";
import PatientBookAppointment from "./pages/patient/PatientBookAppointment";
import PatientAddHealthRecord from "./pages/patient/PatientAddHealthRecord";
import PatientDoctorBrowser from "./pages/patient/PatientDoctorBrowser";
import PatientDoctorProfile from "./pages/patient/PatientDoctorProfile";
import PatientRescheduleAppointment from "./pages/patient/PatientRescheduleAppointment";
import PatientAppointmentDetails from "./pages/patient/PatientAppointmentDetails";
import PatientConsultationChat from "./pages/patient/PatientConsultationChat";

// ==================== DOCTOR IMPORTS ====================
import DoctorLogin from "./pages/DoctorLogin";
import DoctorRegister from "./pages/DoctorRegister";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorAppointmentsList from "./pages/doctor/DoctorAppointmentsList";
import DoctorAppointmentDetail from "./pages/doctor/DoctorAppointmentDetail";
import DoctorConsultations from "./pages/doctor/DoctorConsultations";
import DoctorPatients from "./pages/doctor/DoctorPatients";
import PatientRecord from "./pages/doctor/PatientRecord";
import DoctorPrescriptions from "./pages/doctor/DoctorPrescriptions";
import DoctorConsultationChat from "./pages/doctor/DoctorConsultationChat";

// ==================== ADMIN IMPORTS ====================
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLogin from "./components/admin/AdminLogin";
import AdminDashboard from "./components/admin/AdminDashboard";

function App() {
  return (
    <Router>
      <Routes>
        {/* ==================== HOME ==================== */}
        <Route path="/" element={<HomePage />} />

        {/* ==================== ADMIN ROUTES ==================== */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ==================== DOCTOR ROUTES ==================== */}
        <Route path="/doctor/login" element={<DoctorLogin />} />
        <Route path="/doctor/register" element={<DoctorRegister />} />

        {/* Doctor Dashboard & Core Features */}
        <Route
          path="/doctor/dashboard"
          element={
            <ProtectedRoute requiredRole="DOCTOR">
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/appointments"
          element={
            <ProtectedRoute requiredRole="DOCTOR">
              <DoctorAppointmentsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/appointments/:appointmentId"
          element={
            <ProtectedRoute requiredRole="DOCTOR">
              <DoctorAppointmentDetail />
            </ProtectedRoute>
          }
        />

        {/* ✅ Doctor Consultations - Uses Unified ConsultationChat */}
        <Route
          path="/doctor/consultations"
          element={
            <ProtectedRoute requiredRole="DOCTOR">
              <DoctorConsultations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/consultations/:consultationId"
          element={
            <ProtectedRoute requiredRole="DOCTOR">
              <DoctorConsultationChat />
            </ProtectedRoute>
          }
        />

        {/* Doctor Patients & Prescriptions */}
        <Route
          path="/doctor/patients"
          element={
            <ProtectedRoute requiredRole="DOCTOR">
              <DoctorPatients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/patients/:id"
          element={
            <ProtectedRoute requiredRole="DOCTOR">
              <PatientRecord />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/prescriptions"
          element={
            <ProtectedRoute requiredRole="DOCTOR">
              <DoctorPrescriptions />
            </ProtectedRoute>
          }
        />
        <Route
        path= "/doctor/consultations/:consultationId" 
        element={
         <ProtectedRoute requiredRole="DOCTOR">
         <DoctorConsultationChat /> 
         </ProtectedRoute>
        }
        />
        <Route
        path= "/patient/consultations/:consultationId" 
        element={
         <ProtectedRoute requiredRole="PATIENT">
         <PatientConsultationChat /> 
         </ProtectedRoute>
        }
        />
        {/* ==================== PATIENT ROUTES ==================== */}
        <Route path="/patient/login" element={<PatientLogin />} />
        <Route path="/patient/register" element={<PatientRegister />} />

        {/* Patient Dashboard & Core Features */}
        <Route
          path="/patient/dashboard"
          element={
            <ProtectedRoute requiredRole="PATIENT">
              <PatientDashboard />
            </ProtectedRoute>
          }
        />

        {/* Patient Doctor Discovery */}
        <Route
          path="/patient/find-doctor"
          element={
            <ProtectedRoute requiredRole="PATIENT">
              <PatientDoctorBrowser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/doctor/:doctorId"
          element={
            <ProtectedRoute requiredRole="PATIENT">
              <PatientDoctorProfile />
            </ProtectedRoute>
          }
        />

        {/* ✅ Patient Appointments - Full Flow */}
        <Route
          path="/patient/appointments"
          element={
            <ProtectedRoute requiredRole="PATIENT">
              <PatientAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/appointments/:appointmentId"
          element={
            <ProtectedRoute requiredRole="PATIENT">
              <PatientAppointmentDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/appointments/:appointmentId/reschedule"
          element={
            <ProtectedRoute requiredRole="PATIENT">
              <PatientRescheduleAppointment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/book-appointment"
          element={
            <ProtectedRoute requiredRole="PATIENT">
              <PatientBookAppointment />
            </ProtectedRoute>
          }
        />

        
        {/* Patient Health & Prescriptions */}
        <Route
          path="/patient/health-records"
          element={
            <ProtectedRoute requiredRole="PATIENT">
              <PatientHealthRecords />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/health-records/new"
          element={
            <ProtectedRoute requiredRole="PATIENT">
              <PatientAddHealthRecord />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/prescriptions"
          element={
            <ProtectedRoute requiredRole="PATIENT">
              <PatientPrescriptions />
            </ProtectedRoute>
          }
        />

        {/* Patient Settings */}
        <Route
          path="/patient/settings"
          element={
            <ProtectedRoute requiredRole="PATIENT">
              <PatientSettings />
            </ProtectedRoute>
          }
        />

        {/* ==================== 404 CATCH-ALL ==================== */}
        <Route
          path="*"
          element={
            <div style={{ 
              textAlign: "center", 
              padding: "60px 20px", 
              minHeight: "100vh",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center"
            }}>
              <h1 style={{ color: "#666" }}>404 - Page Not Found</h1>
              <p style={{ color: "#999" }}>The page you're looking for doesn't exist.</p>
              <a 
                href="/" 
                style={{ 
                  color: "#667eea", 
                  textDecoration: "none",
                  padding: "10px 20px",
                  border: "1px solid #667eea",
                  borderRadius: "5px",
                  marginTop: "20px"
                }}
              >
                ← Go back to home
              </a>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;