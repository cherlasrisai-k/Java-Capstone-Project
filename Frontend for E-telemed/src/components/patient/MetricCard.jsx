// src/components/MetricCard.jsx
import "./../../styles/dashboard.css";

function MetricCard({ label, value, unit, status, icon }) {
  return (
    <div className="metric-card">
      <div className="metric-header">
        <span className="metric-icon">{icon}</span>
        <span className="metric-label">{label}</span>
      </div>
      <div className="metric-value-row">
        <span className="metric-value">{value}</span>
        {unit && <span className="metric-unit">{unit}</span>}
      </div>
      {status && <span className="metric-status">{status}</span>}
    </div>
  );
}

export default MetricCard;
