// src/components/doctor/Sidebar.jsx
import { useNavigate } from "react-router-dom";

function Sidebar({ active, onLogout }) {
  const navigate = useNavigate();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊", path: "/doctor/dashboard" },
    { id: "appointments", label: "Appointments", icon: "📅", path: "/doctor/appointments" },
    { id: "consultations", label: "Consultations", icon: "🩺", path: "/doctor/consultations" },
    { id: "patients", label: "Patients", icon: "👥", path: "/doctor/patients" },
    { id: "prescriptions", label: "Prescriptions", icon: "💊", path: "/doctor/prescriptions" },
    { id: "messages", label: "Messages", icon: "💬", path: "/doctor/messages" },
  ];

  return (
    <aside className="doctor-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <strong>E-TeleMed</strong>
        </div>
        <div className="sidebar-role">Doctor Portal</div>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={active === item.id ? "nav-item active" : "nav-item"}
            onClick={() => navigate(item.path)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;