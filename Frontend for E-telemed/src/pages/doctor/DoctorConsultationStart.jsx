import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import doctorServices from "../../api/doctor/doctorServices";
import Sidebar from "../../components/doctor/Sidebar";
import Topbar from "../../components/doctor/Topbar";
import io from "socket.io-client";
import "../../styles/doctorDashboard.css";
import"../../styles/consultation.css"

const SOCKET_URL = "http://localhost:5000";

function DoctorConsultationStart() {
  const navigate = useNavigate();
  const { consultationId } = useParams();

  const [consultation, setConsultation] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [notes, setNotes] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const socketRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const loadConsultation = async () => {
      try {
        setLoading(true);
        const doctorRes = await doctorServices.getCurrentDoctor();
        setDoctor(doctorRes.data?.data || doctorRes.data);

        if (consultationId) {
          const res = await doctorServices.getConsultationById(consultationId);
          const data = res.data?.data || res.data;
          setConsultation(data);
          setNotes(data.notes || "");
          setDiagnosis(data.diagnosis || "");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load consultation");
      } finally {
        setLoading(false);
      }
    };

    loadConsultation();
  }, [consultationId]);

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Socket Chat
  useEffect(() => {
    if (!consultationId) return;
    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit("join-room", { roomId: consultationId, role: "doctor" });

    socketRef.current.on("receive-message", (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [consultationId]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const msg = { sender: "Doctor", text: newMessage, time: new Date().toLocaleTimeString() };
    socketRef.current.emit("send-message", msg);
    setMessages(prev => [...prev, msg]);
    setNewMessage("");
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/doctor/login");
  };

  const handleCompleteConsultation = async () => {
    if (!diagnosis.trim()) {
      alert("Please enter a diagnosis before completing consultation");
      return;
    }
    try {
      await doctorServices.completeConsultation(consultationId, { diagnosis, notes });
      alert("Consultation completed!");
      navigate("/doctor/consultations");
    } catch (err) {
      console.error(err);
      alert("Failed to complete consultation");
    }
  };

  if (loading) return <div className="loading-spinner">Loading consultation...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="doctor-layout">
      <Sidebar active="consultations" onLogout={handleLogout} />
      <div className="doctor-main">
        <Topbar doctorName={doctor?.fullName} specialization={doctor?.specialization} />

        <main className="doctor-content consultation-page">
          <section className="consultation-header">
            <h1>Consultation Chat</h1>
            <div className="timer">Elapsed: {Math.floor(elapsedTime / 60)} min</div>
          </section>

          <section className="chat-section">
            <div className="chat-messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`chat-message ${msg.sender === "Doctor" ? "self" : "other"}`}>
                  <span className="sender">{msg.sender}</span>
                  <span className="text">{msg.text}</span>
                  <span className="time">{msg.time}</span>
                </div>
              ))}
            </div>
            <div className="chat-input">
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </section>

          <section className="consultation-form-section">
            <h3>Consultation Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="6"
              placeholder="Enter clinical notes..."
            />
            <h3>Diagnosis *</h3>
            <textarea
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              rows="4"
              placeholder="Enter diagnosis..."
            />
            <button className="btn primary" onClick={handleCompleteConsultation}>
              Complete Consultation
            </button>
          </section>
        </main>
      </div>
    </div>
  );
}

export default DoctorConsultationStart;