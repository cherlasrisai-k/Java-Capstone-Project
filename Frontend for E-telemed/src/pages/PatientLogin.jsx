import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import axiosClient from "../api/axiosClient";

function PatientLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await axiosClient.post("/auth/login", {
      email: form.email,
      password: form.password,
    });

    const { accessToken, user } = res.data.data; // <-- already corrected
    const role = user.role;
    const id = user.id;

    if (role !== "PATIENT") {
      alert("You are not registered as a patient.");
      return;
    }

    // Store necessary info
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("userRole", role);
    localStorage.setItem("id", id);
    localStorage.setItem("fullName", user.firstName + " " + user.lastName); // <-- added
    localStorage.setItem("email", user.email); // <-- added

    navigate("/patient/dashboard");
  } catch (err) {
    console.error(err);
    alert("Invalid email or password.");
  }
};

  return (
    <AuthLayout
      title="Patient Login"
      subtitle="Access your dashboard and manage your health records"
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button className="auth-btn" type="submit">
          Login
        </button>

        <p className="auth-footer">
         <Link to="/patient/register" className="auth-link">
            Register
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default PatientLogin;