// src/pages/PatientAddHealthRecord.jsx - FULLY REWRITTEN
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addHealthRecord } from "../../api/patient/patientServices";
import Sidebar from "../../components/patient/Sidebar";
import Topbar from "../../components/patient/Topbar";
import "../../styles/dashboard.css";

function PatientAddHealthRecord() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    systolic: "",
    diastolic: "",
    heartRate: "",
    temperature: "",
    oxygenSaturation: "",
    weight: "",
    height: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const name = localStorage.getItem("fullName") || "Patient";

  // Set today's date as default
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    // Note: Backend handles recordedAt timestamp automatically
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (message && !loading) setMessage(""); // Clear error on input
  };

  const validateForm = () => {
    const requiredFields = ["systolic", "diastolic", "heartRate"];
    for (let field of requiredFields) {
      if (!formData[field]) {
        setMessage(`Please fill ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // ✅ PERFECT HealthDataDTO payload - NO patientId (uses X-User-Id header)
    const payload = {
      systolic: parseInt(formData.systolic),
      diastolic: parseInt(formData.diastolic),
      heartRate: parseInt(formData.heartRate),
      temperature: formData.temperature ? parseFloat(formData.temperature) : null,
      oxygenSaturation: formData.oxygenSaturation ? parseInt(formData.oxygenSaturation) : null,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      height: formData.height ? parseFloat(formData.height) : null,
      notes: formData.notes || null,
    };

    console.log("📤 HealthDataDTO Payload:", payload);

    setLoading(true);
    setMessage("");

    try {
      await addHealthRecord(payload);
      setMessage("✅ Health record saved successfully!");
      setSubmitSuccess(true);
      
      // Reset form and redirect after 2s
      setTimeout(() => {
        navigate("/patient/health-records");
      }, 2000);
      
    } catch (err) {
      console.error("❌ Add health record error:", err.response?.data || err.message);
      
      const errorMsg = err.response?.data?.message || 
                      "Failed to save health record. Please try again.";
      setMessage(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/patient/health-records");
  };

  if (submitSuccess) {
    return (
      <div className="dashboard-layout">
        <Sidebar active="health" onLogout={() => navigate("/patient/login")} />
        <main className="dashboard-main">
          <Topbar patientName={name} email={localStorage.getItem("email") || ""} />
          <div className="dashboard-content">
            <section className="panel">
              <div className="success-message">
                <h3>✅ Health Record Saved!</h3>
                <p>Redirecting back to your records...</p>
              </div>
            </section>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar active="health" onLogout={() => navigate("/patient/login")} />
      <main className="dashboard-main">
        <Topbar patientName={name} email={localStorage.getItem("email") || ""} />

        <div className="dashboard-content">
          <section className="panel">
            <div className="panel-header">
              <h3>Add New Health Reading</h3>
              <p>Enter your latest vital signs</p>
            </div>

            {message && (
              <div className={`alert ${message.startsWith("✅") ? "alert-success" : "alert-error"}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="health-record-form">
              {/* Blood Pressure Row */}
              <div className="form-grid">
                <div className="form-group">
                  <label>Systolic BP <span className="required">*</span></label>
                  <input
                    type="number"
                    name="systolic"
                    value={formData.systolic}
                    onChange={handleChange}
                    placeholder="120"
                    min="70"
                    max="200"
                    disabled={loading}
                  />
                  <small>mmHg (70-200)</small>
                </div>

                <div className="form-group">
                  <label>Diastolic BP <span className="required">*</span></label>
                  <input
                    type="number"
                    name="diastolic"
                    value={formData.diastolic}
                    onChange={handleChange}
                    placeholder="80"
                    min="40"
                    max="130"
                    disabled={loading}
                  />
                  <small>mmHg (40-130)</small>
                </div>
              </div>

              {/* Heart Rate & Temperature */}
              <div className="form-grid">
                <div className="form-group">
                  <label>Heart Rate <span className="required">*</span></label>
                  <input
                    type="number"
                    name="heartRate"
                    value={formData.heartRate}
                    onChange={handleChange}
                    placeholder="75"
                    min="30"
                    max="220"
                    disabled={loading}
                  />
                  <small>bpm (30-220)</small>
                </div>
            
                <div className="form-group">
                  <label>Temperature</label>
                  <input
                    type="number"
                    step="0.1"
                    name="temperature"
                    value={formData.temperature}
                    onChange={handleChange}
                    placeholder="36.5"
                    min="35"
                    max="42"
                    disabled={loading}
                  />
                  <small>°C (35-42)</small>
                </div>
              </div>

              {/* O2 & Weight */}
              <div className="form-grid">
                <div className="form-group">
                  <label>O₂ Saturation</label>
                  <input
                    type="number"
                    name="oxygenSaturation"
                    value={formData.oxygenSaturation}
                    onChange={handleChange}
                    placeholder="98"
                    min="70"
                    max="100"
                    disabled={loading}
                  />
                  <small>% (70-100)</small>
                </div>

                <div className="form-group">
                  <label>Weight</label>
                  <input
                    type="number"
                    step="0.1"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="70.5"
                    min="0"
                    disabled={loading}
                  />
                  <small>kg</small>
                </div>
              </div>

              {/* Height & Notes */}
              <div className="form-grid">
                <div className="form-group">
                  <label>Height</label>
                  <input
                    type="number"
                    step="0.1"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    placeholder="175"
                    min="0"
                    disabled={loading}
                  />
                  <small>cm</small>
                </div>

                <div className="form-group full-width">
                  <label>Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="How are you feeling today? Any symptoms?"
                    rows="3"
                    maxLength="1000"
                    disabled={loading}
                  />
                  <small>{formData.notes.length}/1000 characters</small>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Saving..." : "Save Reading"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

export default PatientAddHealthRecord;  