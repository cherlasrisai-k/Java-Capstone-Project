// src/pages/AdminLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../AuthLayout";
import axiosClient from "../../api/axiosClient";

function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axiosClient.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      const { accessToken, refreshToken, user } = res.data.data;

      if (user.role !== "ADMIN") {
        alert("This account is not an admin.");
        setLoading(false);
        return;
      }

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("userRole", user.role);

      navigate("/admin/dashboard");
    } catch (err) {
      console.error("Some Error occured");
      alert("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Admin Login"
      subtitle="Manage doctor approvals and platform settings"
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          type="email"
          name="email"
          placeholder="Enter admin email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          placeholder="Enter admin password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button className="auth-btn" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="auth-footer" style={{ textAlign: "center" }}>
          This area is restricted to E-TeleMed administrators.
        </p>
      </form>
    </AuthLayout>
  );
}

export default AdminLogin;