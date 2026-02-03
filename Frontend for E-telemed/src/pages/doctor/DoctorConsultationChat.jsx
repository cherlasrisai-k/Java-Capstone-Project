import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import doctorServices from "../../api/doctor/doctorServices";
import Sidebar from "../../components/doctor/Sidebar";
import Topbar from "../../components/doctor/Topbar";
import "../../styles/consultation.css";

function DoctorConsultationChat() {
  const navigate = useNavigate();
  const { consultationId } = useParams();
  const messagesEndRef = useRef(null);

  const [consultation, setConsultation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [prescription, setPrescription] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState({
    diagnosis: "",
    generalInstructions: "",
    validUntil: "",
    medications: [
      {
        medicationName: "",
        dosage: "",
        frequency: "",
        durationDays: 1,
        instructions: "",
        sideEffects: "",
      },
    ],
  });
  const [prescriptionLoading, setPrescriptionLoading] = useState(false);

  // NEW: Chat disabled when consultation completed
  const isCompleted = consultation?.status === "COMPLETED";

  const storageKey = `chat_${consultationId}_doctor`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const loadConsultationData = async () => {
      try {
        setLoading(true);
        setError(null);

        const id = localStorage.getItem("id");
        const fullName = localStorage.getItem("fullName") || "User";
        const email = localStorage.getItem("email") || "";

        setUserId(parseInt(id));
        setUserInfo({ name: fullName, email });

        if (!consultationId) {
          throw new Error("Consultation ID missing");
        }

        const consultRes = await doctorServices.getConsultationById(
          consultationId
        );
        const consultData = consultRes.data?.data || consultRes.data;
        setConsultation(consultData);

        const saved = localStorage.getItem(storageKey);
        setMessages(saved ? JSON.parse(saved) : []);

        try {
          const prescRes =
            await doctorServices.getConsultationPrescription(consultationId);
          const prescData = prescRes.data?.data || prescRes.data;
          if (prescData) setPrescription(prescData);
        } catch {}
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load consultation"
        );
      } finally {
        setLoading(false);
      }
    };

    loadConsultationData();
  }, [consultationId, storageKey]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isCompleted) return;

    const messagePayload = {
      messageText: newMessage.trim(),
      senderRole: "DOCTOR",
      senderId: userId,
      senderName: userInfo?.name,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => {
      const updated = [...prev, messagePayload];
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });

    setNewMessage("");
  };

  // ==========================
  // NEW: End Consultation Handler
  // ==========================
  const handleEndConsultation = async () => {
    if (!window.confirm("Are you sure you want to end this consultation?")) {
      return;
    }

    try {
      await doctorServices.completeConsultation(consultationId, {
        diagnosis: "",
        treatment: "",
        notes: "",
        followUpInstructions: "",
      });

      setConsultation((prev) => ({
        ...prev,
        status: "COMPLETED",
        endTime: new Date().toISOString(),
      }));

      alert("✔ Consultation completed successfully.");
    } catch (err) {
      alert(
        "❌ Failed to complete consultation: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const handleAddMedication = () => {
    setPrescriptionData((prev) => ({
      ...prev,
      medications: [
        ...prev.medications,
        {
          medicationName: "",
          dosage: "",
          frequency: "",
          durationDays: 1,
          instructions: "",
          sideEffects: "",
        },
      ],
    }));
  };

  const handleRemoveMedication = (index) => {
    setPrescriptionData((prev) => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index),
    }));
  };

  const handleMedicationChange = (index, field, value) => {
    const updated = [...prescriptionData.medications];
    updated[index][field] = value;
    setPrescriptionData({ ...prescriptionData, medications: updated });
  };

  const handlePrescriptionFieldChange = (field, value) => {
    setPrescriptionData({ ...prescriptionData, [field]: value });
  };

  const handleSubmitPrescription = async (e) => {
    e.preventDefault();

    if (!prescriptionData.diagnosis.trim()) {
      alert("❌ Diagnosis is required");
      return;
    }
    if (!prescriptionData.validUntil) {
      alert("❌ Valid until date is required");
      return;
    }
    if (prescriptionData.medications.length === 0) {
      alert("❌ At least one medication is required");
      return;
    }

    for (let med of prescriptionData.medications) {
      if (!med.medicationName.trim()) {
        alert("❌ All medications must have a name");
        return;
      }
      if (!med.dosage.trim()) {
        alert("❌ All medications must have a dosage");
        return;
      }
      if (!med.frequency.trim()) {
        alert("❌ All medications must have a frequency");
        return;
      }
      if (med.durationDays < 1 || med.durationDays > 365) {
        alert("❌ Duration must be between 1–365 days");
        return;
      }
    }

    try {
      setPrescriptionLoading(true);

      const payload = {
        consultationId: parseInt(consultationId),
        patientId: consultation?.patientId,
        diagnosis: prescriptionData.diagnosis,
        generalInstructions: prescriptionData.generalInstructions || "",
        validUntil: prescriptionData.validUntil,
        medications: prescriptionData.medications,
      };

      const response = await doctorServices.createPrescription(payload);
      const created = response.data?.data || response.data;

      setPrescription(created);
      setShowPrescriptionForm(false);

      setPrescriptionData({
        diagnosis: "",
        generalInstructions: "",
        validUntil: "",
        medications: [
          {
            medicationName: "",
            dosage: "",
            frequency: "",
            durationDays: 1,
            instructions: "",
            sideEffects: "",
          },
        ],
      });

      alert("✅ Prescription created successfully!");
    } catch (err) {
      alert(
        "❌ Failed: " +
          (err.response?.data?.message || err.message || "Unknown error")
      );
    } finally {
      setPrescriptionLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/doctor/login");
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar active="consultations" onLogout={handleLogout} />
        <main className="dashboard-main">
          <Topbar
            doctorName={userInfo?.name || "Doctor"}
            email={userInfo?.email || ""}
          />
          <div className="loading-spinner">⏳ Loading consultation...</div>
        </main>
      </div>
    );
  }

  if (error || !consultation) {
    return (
      <div className="dashboard-layout">
        <Sidebar active="consultations" onLogout={handleLogout} />
        <main className="dashboard-main">
          <Topbar
            doctorName={userInfo?.name || "Doctor"}
            email={userInfo?.email || ""}
          />
          <div className="error-state">
            <h2>❌ Error Loading Consultation</h2>
            <p>{error || "Consultation not found"}</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/doctor/appointments")}
            >
              ← Go Back
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar active="consultations" onLogout={handleLogout} />

      <main className="dashboard-main">
        <Topbar
          doctorName={userInfo?.name || "Doctor"}
          email={userInfo?.email || ""}
        />

        <div className="consultation-container">
          {/* ---------------- Chat Section ---------------- */}
          <section className="chat-section">
            <div className="chat-header">
              <h2>💬 Consultation Chat</h2>

              {/* NEW: Status + End Button */}
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <p>
                  ID: {consultationId} | Status:{" "}
                  <strong
                    style={{
                      color: isCompleted ? "red" : "green",
                      marginLeft: "4px",
                    }}
                  >
                    {consultation.status}
                  </strong>{" "}
                  | Patient: {consultation?.patientName}
                </p>

                {!isCompleted && (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={handleEndConsultation}
                  >
                    🔴 End Consultation
                  </button>
                )}
              </div>
            </div>

            {isCompleted && (
              <div className="completed-banner">
                ✔ This consultation has been completed. Messaging is disabled.
              </div>
            )}

            <div className="messages-container">
              {messages.length === 0 ? (
                <div className="empty-messages">
                  <p>📭 No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isOwn = msg.senderId === userId;
                  return (
                    <div
                      key={idx}
                      className={`message ${isOwn ? "sent" : "received"}`}
                    >
                      <div className="message-bubble">
                        <small className="sender-name">
                          {msg.senderRole || "User"}
                        </small>
                        <p>{msg.messageText}</p>
                        <small className="timestamp">
                          {msg.timestamp
                            ? new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </small>
                      </div>
                    </div>
                  );
                })
              )}

              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="message-form">
              <input
                type="text"
                value={newMessage}
                disabled={isCompleted}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={
                  isCompleted
                    ? "Consultation completed. Chat disabled."
                    : "Type your message..."
                }
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || isCompleted}
                className="btn btn-primary"
              >
                📤 Send
              </button>
            </form>
          </section>

          {/* ---------------- Prescription Section ---------------- */}
          <section className="prescription-section">
            <div className="prescription-header">
              <h3>💊 Prescription</h3>

              {!prescription && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() =>
                    setShowPrescriptionForm(!showPrescriptionForm)
                  }
                >
                  {showPrescriptionForm ? "❌ Cancel" : "➕ Add Prescription"}
                </button>
              )}
            </div>

            {/* ---- Prescription Form ---- */}
            {showPrescriptionForm && (
              <form
                onSubmit={handleSubmitPrescription}
                className="prescription-form"
              >
                {/* Diagnosis */}
                <div className="form-group">
                  <label>
                    Diagnosis <span className="required">*</span>
                  </label>
                  <textarea
                    value={prescriptionData.diagnosis}
                    onChange={(e) =>
                      handlePrescriptionFieldChange(
                        "diagnosis",
                        e.target.value
                      )
                    }
                    placeholder="e.g., Hypertension"
                    rows="2"
                    required
                  />
                </div>

                {/* Valid Until */}
                <div className="form-group">
                  <label>
                    Valid Until <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    value={prescriptionData.validUntil}
                    onChange={(e) =>
                      handlePrescriptionFieldChange("validUntil", e.target.value)
                    }
                    required
                  />
                </div>

                {/* General Instructions */}
                <div className="form-group">
                  <label>General Instructions</label>
                  <textarea
                    value={prescriptionData.generalInstructions}
                    onChange={(e) =>
                      handlePrescriptionFieldChange(
                        "generalInstructions",
                        e.target.value
                      )
                    }
                    placeholder="e.g., Avoid alcohol"
                    rows="2"
                  />
                </div>

                {/* Medications */}
                <div className="medications-section">
                  <h4>
                    Medications <span className="required">*</span>
                  </h4>

                  {prescriptionData.medications.map((med, idx) => (
                    <div key={idx} className="medication-form">
                      <div className="medication-header">
                        <h5>Medication {idx + 1}</h5>

                        {prescriptionData.medications.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => handleRemoveMedication(idx)}
                          >
                            ❌ Remove
                          </button>
                        )}
                      </div>

                      {/* Medication Name */}
                      <div className="form-group">
                        <label>Medication Name *</label>
                        <input
                          type="text"
                          value={med.medicationName}
                          onChange={(e) =>
                            handleMedicationChange(
                              idx,
                              "medicationName",
                              e.target.value
                            )
                          }
                          required
                        />
                      </div>

                      {/* Dosage + Frequency + Duration */}
                      <div className="form-row">
                        <div className="form-group">
                          <label>Dosage *</label>
                          <input
                            type="text"
                            value={med.dosage}
                            onChange={(e) =>
                              handleMedicationChange(
                                idx,
                                "dosage",
                                e.target.value
                              )
                            }
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>Frequency *</label>
                          <input
                            type="text"
                            value={med.frequency}
                            onChange={(e) =>
                              handleMedicationChange(
                                idx,
                                "frequency",
                                e.target.value
                              )
                            }
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>Duration (days) *</label>
                          <input
                            type="number"
                            value={med.durationDays}
                            min="1"
                            max="365"
                            onChange={(e) =>
                              handleMedicationChange(
                                idx,
                                "durationDays",
                                parseInt(e.target.value)
                              )
                            }
                            required
                          />
                        </div>
                      </div>

                      {/* Instructions */}
                      <div className="form-group">
                        <label>Instructions</label>
                        <textarea
                          value={med.instructions}
                          onChange={(e) =>
                            handleMedicationChange(
                              idx,
                              "instructions",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      {/* Side Effects */}
                      <div className="form-group">
                        <label>Side Effects</label>
                        <textarea
                          value={med.sideEffects}
                          onChange={(e) =>
                            handleMedicationChange(
                              idx,
                              "sideEffects",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleAddMedication}
                  >
                    ➕ Add Another Medication
                  </button>
                </div>

                {/* Actions */}
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowPrescriptionForm(false)}
                  >
                    ❌ Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={prescriptionLoading}
                  >
                    {prescriptionLoading
                      ? "⏳ Creating..."
                      : "✅ Create Prescription"}
                  </button>
                </div>
              </form>
            )}

            {/* ---- Existing Prescription ---- */}
            {prescription && (
              <div className="prescription-card">
                <h4>✅ Active Prescription</h4>

                <div className="prescription-details">
                  <p>
                    <strong>Diagnosis:</strong> {prescription.diagnosis}
                  </p>
                  <p>
                    <strong>Valid Until:</strong> {prescription.validUntil}
                  </p>
                  {prescription.generalInstructions && (
                    <p>
                      <strong>Instructions:</strong>{" "}
                      {prescription.generalInstructions}
                    </p>
                  )}
                </div>

                <div className="medications-list">
                  <h5>Medications ({prescription.medications?.length || 0}):</h5>

                  {prescription.medications?.map((med, idx) => (
                    <div key={idx} className="medication-item">
                      <p>
                        <strong>{med.medicationName}</strong> - {med.dosage}
                      </p>
                      <p className="medication-details">
                        Frequency: {med.frequency} | Duration:{" "}
                        {med.durationDays} days
                      </p>

                      {med.instructions && (
                        <p className="medication-instructions">
                          📝 {med.instructions}
                        </p>
                      )}

                      {med.sideEffects && (
                        <p className="medication-side-effects">
                          ⚠️ Side Effects: {med.sideEffects}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!prescription && (
              <div className="prescription-card empty">
                <p>📭 No prescription created yet.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default DoctorConsultationChat;