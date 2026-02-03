// src/components/AuthLayout.jsx
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import "./../styles/auth.css";

function AuthLayout({ title, subtitle, children }) {
  return (
    <>
      {/* Simple navbar: logo + Home */}
      <Navbar simple />

      <div className="auth-container">
        {/* Left Branding Side */}
        <div className="auth-left">
          <h1>E-TeleMed</h1>
          <p>
            Your health, delivered with technology.
            Remote consultations · Live monitoring · Secure & private.
          </p>
          <ul>
            <li>✔ Reduce hospital visits</li>
            <li>✔ Continuous remote monitoring</li>
            <li>✔ End-to-end encrypted records</li>
          </ul>
        </div>

        {/* Right Form Side */}
        <div className="auth-right">
          <div className="auth-card">
            <h2>{title}</h2>
            <p className="auth-subtitle">{subtitle}</p>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

export default AuthLayout;
