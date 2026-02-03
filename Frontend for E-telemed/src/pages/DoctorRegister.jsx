import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import axiosClient, { BASE_URLS } from "../api/axiosClient";

function DoctorRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    specialization: "",
    registrationNumber: "",
    experienceYears: "",
    consultationFee: "",
    availableFrom: "",
    availableTo: "",
    contactNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user changes it
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    // Required text fields
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required.";
    if (!form.specialization.trim())
      newErrors.specialization = "Specialization is required.";
    if (!form.registrationNumber.trim())
      newErrors.registrationNumber = "Registration number is required.";

    // Experience: required, integer, >= 0
    if (!form.experienceYears.trim()) {
      newErrors.experienceYears = "Experience is required.";
    } else if (!/^\d+$/.test(form.experienceYears.trim())) {
      newErrors.experienceYears = "Experience must be a whole number.";
    } else if (parseInt(form.experienceYears.trim(), 10) < 0) {
      newErrors.experienceYears = "Experience cannot be negative.";
    }

    // Consultation fee: required, positive number
    if (!form.consultationFee.trim()) {
      newErrors.consultationFee = "Consultation fee is required.";
    } else if (isNaN(Number(form.consultationFee.trim()))) {
      newErrors.consultationFee = "Consultation fee must be a number.";
    } else if (Number(form.consultationFee.trim()) <= 0) {
      newErrors.consultationFee = "Consultation fee must be greater than 0.";
    }

    // Available from / to: required
    if (!form.availableFrom) newErrors.availableFrom = "Start time is required.";
    if (!form.availableTo) newErrors.availableTo = "End time is required.";

    // Contact number: exactly 10 digits
    if (!form.contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required.";
    } else if (!/^\d{10}$/.test(form.contactNumber.trim())) {
      newErrors.contactNumber = "Contact number must be exactly 10 digits.";
    }

    // Email
    const emailTrimmed = form.email.trim().toLowerCase();
    if (!emailTrimmed) {
      newErrors.email = "Email is required.";
    } else {
      const basicEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!basicEmailRegex.test(emailTrimmed)) {
        newErrors.email = "Please enter a valid email address.";
      }
    }

    // Password
    if (!form.password) {
      newErrors.password = "Password is required.";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    // Confirm password
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validate()) return;

  try {
    setSubmitting(true);

    // ✅ MATCH BACKEND DTO EXACTLY
    const payload = {
      // Core fields
      email: form.email.trim().toLowerCase(),
      password: form.password,
      role: "DOCTOR", // ✅ REQUIRED

      // Split fullName for backend
      firstName: form.fullName.trim().split(' ')[0] || "",
      lastName: form.fullName.trim().split(' ').slice(1).join(' ') || "",

      // Doctor-specific fields (EXACT MATCH)
      specialization: form.specialization.trim(),
      licenseNumber: form.registrationNumber.trim(),        // ✅ Map field name
      yearsOfExperience: parseInt(form.experienceYears.trim(), 10),  // ✅ Correct name
      consultationFee: parseInt(form.consultationFee.trim(), 10),    // ✅ int, not BigDecimal

      // ✅ Remove time fields - NOT in DTO
      phoneNumber: form.contactNumber.trim(),  // ✅ Map contactNumber → phoneNumber
      qualifications: "", // ✅ Optional - can be empty string
      // clinicAddress: null, // Optional if not collecting
    };

    await axiosClient.post(`${BASE_URLS.AUTH}/auth/register`, payload);

    alert("Doctor registration submitted. Awaiting admin approval.");
    navigate("/doctor/login");
  } catch (err) {
    console.error("Registration error:", err.response?.data);
    const msg = err.response?.data?.message || "Registration failed.";
    alert(msg);
  } finally {
    setSubmitting(false);
  }
};

  const inputClass = (fieldName) =>
    errors[fieldName] ? "auth-input error-input" : "auth-input";

  return (
    <AuthLayout
      title="Doctor Registration"
      subtitle="Join E-TeleMed and start consulting patients remotely"
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {/* Full name */}
        <label>Full Name</label>
        <input
          className={inputClass("fullName")}
          type="text"
          name="fullName"
          placeholder="Enter your full name"
          value={form.fullName}
          onChange={handleChange}
          required
        />
        {errors.fullName && <p className="error-text">{errors.fullName}</p>}

        {/* Specialization */}
        <label>Specialization</label>
        <input
          className={inputClass("specialization")}
          type="text"
          name="specialization"
          placeholder="e.g. Cardiologist, Dermatologist"
          value={form.specialization}
          onChange={handleChange}
          required
        />
        {errors.specialization && (
          <p className="error-text">{errors.specialization}</p>
        )}

        {/* Registration number */}
        <label>Registration Number</label>
        <input
          className={inputClass("registrationNumber")}
          type="text"
          name="registrationNumber"
          placeholder="Medical council registration number"
          value={form.registrationNumber}
          onChange={handleChange}
          required
        />
        {errors.registrationNumber && (
          <p className="error-text">{errors.registrationNumber}</p>
        )}

        {/* Experience */}
        <label>Experience (years)</label>
        <input
          className={inputClass("experienceYears")}
          type="number"
          min="0"
          name="experienceYears"
          placeholder="e.g. 5"
          value={form.experienceYears}
          onChange={handleChange}
          required
        />
        {errors.experienceYears && (
          <p className="error-text">{errors.experienceYears}</p>
        )}

        {/* Consultation fee */}
        <label>Consultation Fee (₹)</label>
        <input
          className={inputClass("consultationFee")}
          type="number"
          min="0"
          step="0.01"
          name="consultationFee"
          placeholder="e.g. 500"
          value={form.consultationFee}
          onChange={handleChange}
          required
        />
        {errors.consultationFee && (
          <p className="error-text">{errors.consultationFee}</p>
        )}

        {/* Available from / to */}
        <label>Available From</label>
        <input
          className={inputClass("availableFrom")}
          type="time"
          name="availableFrom"
          value={form.availableFrom}
          onChange={handleChange}
          required
        />
        {errors.availableFrom && (
          <p className="error-text">{errors.availableFrom}</p>
        )}

        <label>Available To</label>
        <input
          className={inputClass("availableTo")}
          type="time"
          name="availableTo"
          value={form.availableTo}
          onChange={handleChange}
          required
        />
        {errors.availableTo && (
          <p className="error-text">{errors.availableTo}</p>
        )}

        {/* Contact */}
        <label>Contact Number</label>
        <input
          className={inputClass("contactNumber")}
          type="tel"
          name="contactNumber"
          placeholder="10-digit mobile number"
          value={form.contactNumber}
          onChange={handleChange}
          maxLength={10}
          required
        />
        {errors.contactNumber && (
          <p className="error-text">{errors.contactNumber}</p>
        )}

        {/* Email */}
        <label>Email</label>
        <input
          className={inputClass("email")}
          type="email"
          name="email"
          placeholder="Enter your email"
          value={form.email}
          onChange={handleChange}
          required
        />
        {errors.email && <p className="error-text">{errors.email}</p>}

        {/* Password */}
        <label>Password</label>
        <input
          className={inputClass("password")}
          type="password"
          name="password"
          placeholder="Create password (min 8 characters)"
          value={form.password}
          onChange={handleChange}
          required
        />
        {errors.password && <p className="error-text">{errors.password}</p>}

        {/* Confirm password */}
        <label>Confirm Password</label>
        <input
          className={inputClass("confirmPassword")}
          type="password"
          name="confirmPassword"
          placeholder="Confirm password"
          value={form.confirmPassword}
          onChange={handleChange}
          required
        />
        {errors.confirmPassword && (
          <p className="error-text">{errors.confirmPassword}</p>
        )}

        {/* Submit */}
        <button className="auth-btn" type="submit" disabled={submitting}>
          {submitting ? "Registering..." : "Register"}
        </button>

        {/* Link to login */}
        <p className="auth-footer">
          Already registered as a doctor?{" "}
          <Link to="/doctor/login" className="auth-link">
            Login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default DoctorRegister;
