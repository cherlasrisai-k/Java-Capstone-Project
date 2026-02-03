// src/components/doctor/Topbar.jsx
function Topbar({ doctorName, specialization, appointmentCount }) {
  return (
    <header className="doctor-topbar">
      <div className="topbar-left">
        <h1>Doctor Dashboard</h1>
        <p className="topbar-subtitle">
          {appointmentCount > 0 
            ? `${appointmentCount} appointment${appointmentCount !== 1 ? 's' : ''} today`
            : "Welcome back!"
          }
        </p>
      </div>
      <div className="topbar-right">
        <div className="profile">
          <div className="profile-name">Dr. {doctorName}</div>
          <div className="profile-role">{specialization || "Specialist"}</div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;