// src/pages/patient/PatientConsultationChat.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import patientServices from "../../api/patient/patientServices";
import Sidebar from "../../components/patient/Sidebar";
import Topbar from "../../components/patient/Topbar";
import "../../styles/consultation.css";

function PatientConsultationChat() {
  const navigate = useNavigate();
  const { consultationId } = useParams();
  const messagesEndRef = useRef(null);

  const [consultation, setConsultation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [prescription, setPrescription] = useState(null);

  const storageKey = `chat_${consultationId}_patient`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => scrollToBottom(), [messages]);

  useEffect(() => {
    const loadConsultation = async () => {
      try {
        setLoading(true);
        setError(null);

        const id = localStorage.getItem("id");
        const fullName = localStorage.getItem("fullName") || "Patient";
        const email = localStorage.getItem("email") || "";
        setUserInfo({ id, name: fullName, email });

        const consultRes = await patientServices.getConsultationById(consultationId);
        setConsultation(consultRes.data?.data || consultRes.data);

        const saved = localStorage.getItem(storageKey);
        setMessages(saved ? JSON.parse(saved) : []);

        try {
          const prescRes = await patientServices.getConsultationPrescription(consultationId);
          if (prescRes.data) setPrescription(prescRes.data?.data || prescRes.data);
        } catch {}
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load consultation");
      } finally {
        setLoading(false);
      }
    };

    loadConsultation();
  }, [consultationId, storageKey]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messagePayload = {
      messageText: newMessage.trim(),
      senderRole: "PATIENT",
      senderId: userInfo?.id,
      senderName: userInfo?.name,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => {
      const updated = [...prev, messagePayload];
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
    setNewMessage("");

    try {
      await patientServices.sendConsultationMessage(consultationId, messagePayload);
    } catch {
      console.warn("Message not sent to backend");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/patient/login");
  };

  if (loading) return <div className="loading-spinner">⏳ Loading consultation...</div>;
  if (error || !consultation)
    return (
      <div className="error-state">
        <h2>❌ Error Loading Consultation</h2>
        <p>{error || "Consultation not found"}</p>
        <button onClick={() => navigate("/patient/appointments")}>← Go Back</button>
      </div>
    );

  return (
    <div className="dashboard-layout">
      <Sidebar active="consultations" onLogout={handleLogout} />
      <main className="dashboard-main">
        <Topbar patientName={userInfo?.name} email={userInfo?.email} />

        <main className="consultation-container">
          <section className="chat-section">
            <div className="chat-header">
              <h2>💬 Consultation Chat</h2>
              <p>
                ID: {consultationId} | Status: {consultation?.status || "Active"} | Doctor:{" "}
                {consultation?.doctorName || "Doctor"}
              </p>
            </div>

            <div className="messages-container">
              {messages.length === 0 ? (
                <p>📭 No messages yet. Wait for doctor to start the conversation!</p>
              ) : (
                messages.map((msg, idx) => {
                  const isOwnMessage = msg.senderId === userInfo?.id;
                  return (
                    <div key={idx} className={`message ${isOwnMessage ? "sent" : "received"}`}>
                      <div className="message-bubble">
                        <small>{msg.senderRole}</small>
                        <p>{msg.messageText}</p>
                        <small>
                          {msg.timestamp &&
                            new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </small>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="message-form">
              <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type your message..." />
              <button type="submit" disabled={!newMessage.trim()}>📤 Send</button>
            </form>
          </section>

          <section className="prescription-section">
            <h3>💊 Prescription</h3>
            {prescription ? (
              <div className="prescription-card">
                <p><strong>Diagnosis:</strong> {prescription.diagnosis}</p>
                <p><strong>Valid Until:</strong> {prescription.validUntil}</p>
                {prescription.generalInstructions && <p><strong>Instructions:</strong> {prescription.generalInstructions}</p>}
                {prescription.medications?.map((med, idx) => (
                  <div key={idx}>
                    <p><strong>{med.medicationName}</strong> - {med.dosage}</p>
                    <p>Frequency: {med.frequency} | Duration: {med.durationDays} days</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>📭 No prescription yet.</p>
            )}
          </section>
        </main>
      </main>
    </div>
  );
}

export default PatientConsultationChat;
