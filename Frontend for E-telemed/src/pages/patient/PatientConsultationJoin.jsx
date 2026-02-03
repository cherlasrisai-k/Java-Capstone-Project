// src/pages/patient/PatientConsultationJoin.jsx - REDIRECT TO NEW COMPONENT
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function PatientConsultationJoin() {
  const navigate = useNavigate();
  const { consultationId } = useParams();

  useEffect(() => {
    // Redirect to new ConsultationChat component
    if (consultationId) {
      navigate(`/patient/consultations/${consultationId}`, { replace: true });
    } else {
      navigate("/patient/appointments", { replace: true });
    }
  }, [consultationId, navigate]);

  return <div>Redirecting...</div>;
}

export default PatientConsultationJoin;