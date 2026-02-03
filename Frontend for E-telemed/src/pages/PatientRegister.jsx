import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import axiosClient from "../api/axiosClient";

function PatientRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",          // changed from dob
    gender: "",
    phoneNumber: "",          // changed from contactNumber
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    bloodGroup: "",
    email: "",
    password: "",
    confirmPassword: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    allergies: "",
    medicalHistory: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required.";
    if (!form.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required.";
    if (!form.gender) newErrors.gender = "Gender is required.";

    if (!form.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required.";
    else if (!/^\d{10}$/.test(form.phoneNumber.trim()))
      newErrors.phoneNumber = "Phone number must be exactly 10 digits.";

    if (!form.addressLine1.trim()) newErrors.addressLine1 = "Address Line 1 is required.";
    if (!form.city.trim()) newErrors.city = "City is required.";
    if (!form.state.trim()) newErrors.state = "State is required.";
    if (!form.postalCode.trim()) newErrors.postalCode = "Postal code is required.";
    if (!form.country.trim()) newErrors.country = "Country is required.";

    if (!form.emergencyContactName.trim()) newErrors.emergencyContactName = "Emergency contact name is required.";
    if (!form.emergencyContactPhone.trim()) newErrors.emergencyContactPhone = "Emergency contact phone is required.";
    else if (!/^\d{10}$/.test(form.emergencyContactPhone.trim()))
      newErrors.emergencyContactPhone = "Emergency contact phone must be 10 digits.";

    const emailTrimmed = form.email.trim().toLowerCase();
    if (!emailTrimmed) newErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed))
      newErrors.email = "Please enter a valid email address.";

    if (!form.password) newErrors.password = "Password is required.";
    else if (form.password.length < 8) newErrors.password = "Password must be at least 8 characters.";

    if (!form.confirmPassword) newErrors.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords do not match.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);

      // Prepare payload exactly as per API schema:
      const payload = {
  firstName: form.firstName.trim(),
  lastName: form.lastName.trim(),
  dateOfBirth: form.dateOfBirth,
  gender: form.gender.toUpperCase(), // ✅ Ensure uppercase
  phoneNumber: form.phoneNumber.trim(),
  bloodGroup: form.bloodGroup || null,
  role: "PATIENT",
  email: form.email.trim().toLowerCase(),
  password: form.password,
  address: {
    addressline1: form.addressLine1.trim(),
    addressline2: form.addressLine2.trim() || null,
    city: form.city.trim(),
    state: form.state.trim(),
    postalCode: form.postalCode.trim(),
    country: form.country.trim(),
  },
  emergencyContactName: form.emergencyContactName.trim(),
  emergencyContactPhone: form.emergencyContactPhone.trim(),
  // ✅ Remove allergies/medicalHistory - not in DTO
};

      await axiosClient.post("/auth/register", payload);

      alert("Registration successful. You can now login.");
      navigate("/patient/login");
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        "Registration failed. Please try again.";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (fieldName) =>
    errors[fieldName] ? "auth-input error-input" : "auth-input";

  return (
    <AuthLayout title="Patient Registration" subtitle="Create your account to begin remote consultations">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label>First Name</label>
        <input className={inputClass("firstName")} type="text" name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required />
        {errors.firstName && <p className="error-text">{errors.firstName}</p>}

        <label>Last Name</label>
        <input className={inputClass("lastName")} type="text" name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required />
        {errors.lastName && <p className="error-text">{errors.lastName}</p>}

        <label>Date of Birth</label>
        <input className={inputClass("dateOfBirth")} type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} required />
        {errors.dateOfBirth && <p className="error-text">{errors.dateOfBirth}</p>}

        <label>Gender</label>
        <select className={inputClass("gender")} name="gender" value={form.gender} onChange={handleChange} required>
          <option value="">Select Gender</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
          <option value="OTHER">Other</option>
        </select>
        {errors.gender && <p className="error-text">{errors.gender}</p>}

        <label>Phone Number</label>
        <input className={inputClass("phoneNumber")} type="tel" name="phoneNumber" placeholder="10-digit mobile number" value={form.phoneNumber} onChange={handleChange} maxLength={10} required />
        {errors.phoneNumber && <p className="error-text">{errors.phoneNumber}</p>}

        <label>Address Line 1</label>
        <input className={inputClass("addressLine1")} type="text" name="addressLine1" placeholder="House No / Street" value={form.addressLine1} onChange={handleChange} required />
        {errors.addressLine1 && <p className="error-text">{errors.addressLine1}</p>}

        <label>Address Line 2 (optional)</label>
        <input className="auth-input" type="text" name="addressLine2" placeholder="Area / Landmark" value={form.addressLine2} onChange={handleChange} />

        <label>City</label>
        <input className={inputClass("city")} type="text" name="city" placeholder="City" value={form.city} onChange={handleChange} required />
        {errors.city && <p className="error-text">{errors.city}</p>}

        <label>State</label>
        <input className={inputClass("state")} type="text" name="state" placeholder="State" value={form.state} onChange={handleChange} required />
        {errors.state && <p className="error-text">{errors.state}</p>}

        <label>Postal Code</label>
        <input className={inputClass("postalCode")} type="text" name="postalCode" placeholder="PIN code" value={form.postalCode} onChange={handleChange} required />
        {errors.postalCode && <p className="error-text">{errors.postalCode}</p>}

        <label>Country</label>
        <input className={inputClass("country")} type="text" name="country" placeholder="Country" value={form.country} onChange={handleChange} required />
        {errors.country && <p className="error-text">{errors.country}</p>}

        <label>Blood Group (optional)</label>
        <select className="auth-input" name="bloodGroup" value={form.bloodGroup} onChange={handleChange}>
          <option value="">Select Blood Group</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
        </select>

        <label>Emergency Contact Name</label>
        <input className={inputClass("emergencyContactName")} type="text" name="emergencyContactName" placeholder="Full Name" value={form.emergencyContactName} onChange={handleChange} required />
        {errors.emergencyContactName && <p className="error-text">{errors.emergencyContactName}</p>}

        <label>Emergency Contact Phone</label>
        <input className={inputClass("emergencyContactPhone")} type="tel" name="emergencyContactPhone" placeholder="10-digit phone number" value={form.emergencyContactPhone} onChange={handleChange} maxLength={10} required />
        {errors.emergencyContactPhone && <p className="error-text">{errors.emergencyContactPhone}</p>}

        <label>Allergies (optional)</label>
        <input className="auth-input" type="text" name="allergies" placeholder="E.g., Peanuts, Pollen" value={form.allergies} onChange={handleChange} />

        <label>Medical History (optional)</label>
        <textarea className="auth-input" name="medicalHistory" placeholder="Any chronic conditions or past illnesses" value={form.medicalHistory} onChange={handleChange} rows={3} />

        <label>Email</label>
        <input className={inputClass("email")} type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        {errors.email && <p className="error-text">{errors.email}</p>}

        <label>Password</label>
        <input className={inputClass("password")} type="password" name="password" placeholder="Password (min 8 chars)" value={form.password} onChange={handleChange} required />
        {errors.password && <p className="error-text">{errors.password}</p>}

        <label>Confirm Password</label>
        <input className={inputClass("confirmPassword")} type="password" name="confirmPassword" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} required />
        {errors.confirmPassword && <p className="error-text">{errors.confirmPassword}</p>}

        <button className="auth-btn" type="submit" disabled={submitting}>
          {submitting ? "Registering..." : "Register"}
        </button>

        <p className="auth-footer">
          Already have an account? <Link to="/patient/login" className="auth-link">Login</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default PatientRegister;
