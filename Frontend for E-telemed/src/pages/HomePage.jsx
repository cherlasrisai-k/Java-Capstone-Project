// src/pages/HomePage.jsx
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/home.css";

function HomePage() {
  return (
    <>
      <Navbar />
      <main className="home-container">
        {/* Hero section */}
        <section className="hero">
         <div className="hero-left">
  <div className="hero-badge">
    <span className="badge-pill">
      <span className="badge-dot"></span>
      24/7 Remote Care • HIPAA Inspired
    </span>
  </div>

  <h1>
    Consult Your Doctor <span className="highlight">Anywhere</span>, 
    Monitor Your Health <span className="highlight">Anytime</span>.
  </h1>
            <p className="hero-subtitle">
              E-TeleMed connects patients and doctors through secure remote 
              consultations, live health monitoring, and digital prescriptions.
            </p>

            <div className="hero-buttons">
              <Link to="/patient/login" className="btn primary">
                I&apos;m a Patient
              </Link>
              <Link to="/doctor/login" className="btn secondary">
                I&apos;m a Doctor
              </Link>
            </div>

            <p className="hero-note">
              No long queues. No travel. Just quality care from the comfort of your home.
            </p>
          </div>

          <div className="hero-right">
            <div className="dashboard-card">
              <h3>Today&apos;s Snapshot</h3>
              <div className="metric-row">
                <span>Heart Rate</span>
                <strong>78 bpm</strong>
              </div>
              <div className="metric-row">
                <span>Blood Pressure</span>
                <strong>120 / 80 mmHg</strong>
              </div>
              <div className="metric-row">
                <span>Blood Sugar</span>
                <strong>98 mg/dL</strong>
              </div>
              <p className="card-footnote">Track your vitals live with your doctor.</p>
            </div>
          </div>
        </section>

        {/* For Patients / For Doctors section */}
        <section className="section" id="patients">
          <h2>For Patients</h2>
          <div className="card-grid">
            <div className="info-card">
              <h3>Remote Appointments</h3>
              <p>Book online consultations and follow-ups without visiting the hospital.</p>
            </div>
            <div className="info-card">
              <h3>Health Metrics</h3>
              <p>Securely upload your vitals so your doctor can monitor your progress.</p>
            </div>
            <div className="info-card">
              <h3>Digital Prescriptions</h3>
              <p>Access all prescriptions in one place and never lose a paper slip again.</p>
            </div>
          </div>

          <div className="center-btn">
            <Link to="/patient/register" className="btn primary">
              Get Started as Patient
            </Link>
          </div>
        </section>

        <section className="section" id="doctors">
          <h2>For Doctors</h2>
          <div className="card-grid">
            <div className="info-card">
              <h3>Patient Dashboard</h3>
              <p>View patient history, vitals, and trends in one unified dashboard.</p>
            </div>
            <div className="info-card">
              <h3>Manage Consultations</h3>
              <p>Schedule, reschedule, and run remote consultations seamlessly.</p>
            </div>
            <div className="info-card">
              <h3>Smart Alerts</h3>
              <p>Receive alerts when a patient&apos;s health metrics go out of range.</p>
            </div>
          </div>

          <div className="center-btn">
            <Link to="/doctor/register" className="btn secondary">
              Get Started as Doctor
            </Link>
          </div>
        </section>

        {/* Contact / Footer section anchor */}
        <section className="section contact" id="contact">
          <h2>Contact</h2>
          <p>
            Have questions about integrating E-TeleMed into your hospital or clinic?
            Reach out to us at <span className="highlight">support@etelemed.com</span>.
          </p>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default HomePage;
