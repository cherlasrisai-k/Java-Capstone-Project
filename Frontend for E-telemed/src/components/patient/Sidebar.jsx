// src/components/patient/Sidebar.jsx
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";

function Sidebar({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: "🏠",
      to: "/patient/dashboard",
    },
    {
      key: "appointments",
      label: "Appointments",
      icon: "📅",
      to: "/patient/appointments",
    },
    {
      key: "health-records",
      label: "Health Records",
      icon: "📊",
      to: "/patient/health-records",
    },
    {
      key: "prescriptions",
      label: "Prescriptions",
      icon: "💊",
      to: "/patient/prescriptions",
    },
    {
      key: "settings",
      label: "Settings",
      icon: "⚙️",
      to: "/patient/settings",
    },
  ];

  // Function to check if a route is active
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <span className="sidebar-logo-mark">E</span>
        <span className="sidebar-logo-text">E-TeleMed</span>
      </div>

      {/* Menu */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => navigate(item.to)}
            className={isActive(item.to) ? "sidebar-link active" : "sidebar-link"}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={onLogout} type="button">
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
