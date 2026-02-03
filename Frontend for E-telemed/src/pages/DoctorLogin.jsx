// src/pages/DoctorLogin.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import axiosClient from "../api/axiosClient";

function DoctorLogin() {
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

      const { accessToken, user } = res.data.data;
      const { role, id, firstName, lastName, email } = user;

      if (role !== "DOCTOR") {
        alert("You are not registered as a doctor.");
        return;
      }

      // Store JWT and user details in localStorage
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("userRole", role);
      localStorage.setItem("id", id);
      localStorage.setItem("fullName", `${firstName} ${lastName}`);
      localStorage.setItem("email", email);

      navigate("/doctor/dashboard");
    } catch (err) {
      console.error(err);
      alert("Invalid email or password.");
    }
  };

  return (
    <AuthLayout
      title="Doctor Login"
      subtitle="Access your dashboard and manage patient consultations"
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
          Don&apos;t have an account?{" "}
          <Link to="/doctor/register" className="auth-link">
            Register
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default DoctorLogin;