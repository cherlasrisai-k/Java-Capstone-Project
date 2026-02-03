// src/components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar({ simple = false }) {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/admin/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <Link to="/" className="logo">
          E-TeleMed
        </Link>
      </div>

      <nav className="navbar-right">
        {simple ? (
          // ✅ Simple navbar for auth pages
          <>
            <Link to="/" className="nav-link">
              Home
            </Link>
          </>
        ) : (
          // ✅ Full navbar for main site
          <>
            <Link to="/" className="nav-link">Home</Link>
            <a href="#patients" className="nav-link">For Patients</a>
            <a href="#doctors" className="nav-link">For Doctors</a>
            <a href="#contact" className="nav-link">Contact</a>
            <button className="nav-login-btn" onClick={handleLoginClick}>
              Admin Login
            </button>
          </>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
