// src/components/Topbar.jsx
import "./../../styles/dashboard.css";

function Topbar({ patientName, email }) {
  return (
    <header className="topbar">
      <div>
        <h1 className="topbar-title">Patient Dashboard</h1>
        <p className="topbar-subtitle">
          Welcome back{patientName ? `, ${patientName}` : ""}. Here is your
          health overview.
        </p>
      </div>

      <div className="topbar-user">
        <div className="topbar-user-info">
          <span className="topbar-user-name">{patientName}</span>
          <span className="topbar-user-email">{email}</span>
        </div>
        <div className="topbar-avatar">
          {patientName ? patientName.charAt(0).toUpperCase() : "P"}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
