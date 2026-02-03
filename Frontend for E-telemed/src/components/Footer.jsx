// src/components/Footer.jsx
import "../styles/Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <span>© {new Date().getFullYear()} E-TeleMed. All rights reserved.</span>
      <span className="footer-links">
        <a href="#privacy">Privacy</a> · <a href="#terms">Terms</a>
      </span>
    </footer>
  );
}

export default Footer;
