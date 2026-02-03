import React, { useEffect, useState } from "react";
import axiosClient, { BASE_URLS } from "../../api/axiosClient";
import "./AdminDashboard.css";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState({ content: [], pageNumber: 0, totalPages: 0 });
  const [patients, setPatients] = useState({ content: [], pageNumber: 0, totalPages: 0 });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formType, setFormType] = useState(""); // "doctor" | "patient"
  const [formData, setFormData] = useState({});
  const [doctorPage, setDoctorPage] = useState(0);
  const [patientPage, setPatientPage] = useState(0);
  const pageSize = 10;

  const logout = () => {
    localStorage.clear();
    navigate("/admin/login", { replace: true });
  };

  const fetchDoctors = async (page = 0) => {
    try {
      const res = await axiosClient.get("/doctors", { params: { page, size: pageSize } });
      setDoctors(res.data.data);
    } catch (err) {
      console.error(err);
      setMessage("Failed to fetch doctors.");
    }
  };

  const fetchPatients = async (page = 0) => {
    try {
      const res = await axiosClient.get("/patients", { params: { page, size: pageSize } });
      setPatients(res.data.data);
    } catch (err) {
      console.error(err);
      setMessage("Failed to fetch patients.");
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchDoctors(doctorPage), fetchPatients(patientPage)]).finally(() => setLoading(false));
  }, [doctorPage, patientPage]);

  const sanitizePayload = (input, type) => {
    const payload = { ...input };
    delete payload.id;
    delete payload.password; 

    const doctorFields = ["specialization", "licenseNumber", "yearsOfExperience", "consultationFee", "qualifications"];
    const patientFields = ["dateOfBirth", "gender", "bloodGroup", "emergencyContactName", "emergencyContactPhone"];

    if (type === "doctor") {
      // remove patient‑only fields
      patientFields.forEach((f) => delete payload[f]);
    } else if (type === "patient") {
      // remove doctor‑only fields
      doctorFields.forEach((f) => delete payload[f]);
    }

    return payload;
  };

const submitForm = async (e) => {
  e.preventDefault();
  try {
    // Step 1: Sanitize the payload to remove irrelevant fields
    const payload = sanitizePayload(formData, formType);

    // Step 2: Assign password ONLY if adding a new user
    if (!editingUser) {
      if (formType === "patient") {
        payload.password = formData.dateOfBirth?.trim() || "Temp@12345";
      } else if (formType === "doctor") {
        payload.password = formData.phoneNumber?.trim() || "Temp@12345";
      }
    }

    // Step 3: Make API request
    if (editingUser) {
      await axiosClient.put(`${BASE_URLS.AUTH}/${formType}s/${editingUser.id}`, payload);
      setMessage(`${capitalize(formType)} updated successfully.`);
    } else {
      await axiosClient.post(`${BASE_URLS.AUTH}/${formType}s`, payload);
      setMessage(`${capitalize(formType)} added successfully.`);
    }

    // Step 4: Close modal and refresh the table
    setShowModal(false);
    formType === "doctor" ? fetchDoctors(doctorPage) : fetchPatients(patientPage);
  } catch (err) {
    console.error("Add/Update error:", err);
    setMessage("Operation failed: " + (err.response?.data?.message || err.message));
  }
};

  const deleteUser = async (id, type) => {
    try {
      await axiosClient.delete(`/${type}s/${id}`);
      setMessage(`${capitalize(type)} deleted successfully.`);
      type === "doctor" ? fetchDoctors(doctorPage) : fetchPatients(patientPage);
    } catch (err) {
      console.error(err);
      setMessage(`Failed to delete ${type}.`);
    }
  };

  const approveDoctor = async (id) => {
    try {
      await axiosClient.put(`/doctors/${id}/approve`);
      setMessage("Doctor approved successfully.");
      fetchDoctors(doctorPage);
    } catch (err) {
      console.error(err);
      setMessage("Failed to approve doctor.");
    }
  };

  const rejectDoctor = async (id) => {
    try {
      await axiosClient.delete(`/doctors/${id}`);
      setMessage("Doctor rejected successfully.");
      fetchDoctors(doctorPage);
    } catch (err) {
      console.error(err);
      setMessage("Failed to reject doctor.");
    }
  };

  const approvePatient = async (id) => {
    try {
      await axiosClient.put(`/patients/${id}/approve`);
      setMessage("Patient approved successfully.");
      fetchPatients(patientPage);
    } catch (err) {
      console.error(err);
      setMessage("Failed to approve patient.");
    }
  };

  const rejectPatient = async (id) => {
    try {
      await axiosClient.delete(`/patients/${id}`);
      setMessage("Patient rejected successfully.");
      fetchPatients(patientPage);
    } catch (err) {
      console.error(err);
      setMessage("Failed to reject patient.");
    }
  };

  const openForm = (type, user = null) => {
    setFormType(type);
    setEditingUser(user);

    if (user) {
      // editing existing user
      setFormData(
        type === "doctor"
          ? {
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phoneNumber: user.phoneNumber,
              specialization: user.specialization,
              licenseNumber: user.licenseNumber,
              yearsOfExperience: user.yearsOfExperience,
              consultationFee: user.consultationFee,
              qualifications: user.qualifications,
            }
          : {
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phoneNumber: user.phoneNumber,
              dateOfBirth: user.dateOfBirth,
              gender: user.gender,
              bloodGroup: user.bloodGroup,
              emergencyContactName: user.emergencyContactName,
              emergencyContactPhone: user.emergencyContactPhone,
            }
      );
    } else {
      // adding new user — no password field
      setFormData(
        type === "doctor"
          ? {
              firstName: "",
              lastName: "",
              email: "",
              password:"",
              role:"DOCTOR",
              phoneNumber: "",
              specialization: "",
              licenseNumber: "",
              yearsOfExperience: 0,
              consultationFee: 0,
              qualifications: "",
            }
          : {
              firstName: "",
              lastName: "",
              email: "",
              password:"",
              role:"PATIENT",
              phoneNumber: "",
              dateOfBirth: "",
              gender: "",
              bloodGroup: "",
              emergencyContactName: "",
              emergencyContactPhone: ""
            }
      );
    }

    setShowModal(true);
  };

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const activeDoctors = doctors.content.filter((doc) => doc.active);
  const pendingDoctors = doctors.content.filter((doc) => !doc.active);
  const activePatients = patients.content.filter((pat) => pat.active);
  const pendingPatients = patients.content.filter((pat) => !pat.active);

  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-box">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>

        {message && <p className="success-text">{message}</p>}
        {loading && <p>Loading...</p>}

        <h2>Active Doctors</h2>
        <button className="add-btn" onClick={() => openForm("doctor")}>Add Doctor</button>
        <UserTable users={activeDoctors} type="doctor" onEdit={openForm} onDelete={deleteUser} />
        <Pagination page={doctors.pageNumber} totalPages={doctors.totalPages} onPageChange={setDoctorPage} />

        <h2>Pending Doctors</h2>
        <UserApprovalTable users={pendingDoctors} type="doctor" onApprove={approveDoctor} onReject={rejectDoctor} />

        <h2>Active Patients</h2>
        <button className="add-btn" onClick={() => openForm("patient")}>Add Patient</button>
        <UserTable users={activePatients} type="patient" onEdit={openForm} onDelete={deleteUser} />
        <Pagination page={patients.pageNumber} totalPages={patients.totalPages} onPageChange={setPatientPage} />

        <h2>Pending Patients</h2>
        <UserApprovalTable users={pendingPatients} type="patient" onApprove={approvePatient} onReject={rejectPatient} />

        {showModal && (
          <UserForm
            formType={formType}
            formData={formData}
            setFormData={setFormData}
            onClose={() => setShowModal(false)}
            onSubmit={submitForm}
            editingUser={editingUser}
          />
        )}
      </div>
    </div>
  );
};

const UserTable = ({ users, type, onEdit, onDelete }) => (
  <table className="admin-table">
    <thead>
      <tr>
        {type === "doctor" ? (
          <>
            <th>Name</th>
            <th>Specialization</th>
            <th>License</th>
            <th>Experience</th>
            <th>Fee</th>
            <th>Qualifications</th>
            <th>Contact</th>
            <th>Email</th>
            <th>Edit</th>
            <th>Delete</th>
          </>
        ) : (
          <>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>DOB</th>
            <th>Gender</th>
            <th>Blood Group</th>
            <th>Emergency Contact</th>
            <th>Edit</th>
            <th>Delete</th>
          </>
        )}
      </tr>
    </thead>
    <tbody>
      {users.length === 0 ? (
        <tr>
          <td colSpan={type === "doctor" ? 10 : 9} className="empty-msg">No records found.</td>
        </tr>
      ) : (
        users.map((user) => (
          <tr key={user.id}>
            {type === "doctor" ? (
              <>
                <td>{user.firstName} {user.lastName}</td>
                <td>{user.specialization}</td>
                <td>{user.licenseNumber}</td>
                <td>{user.yearsOfExperience} yrs</td>
                <td>₹{user.consultationFee}</td>
                <td>{user.qualifications}</td>
                <td>{user.phoneNumber}</td>
                <td>{user.email}</td>
                <td><button onClick={() => onEdit(type, user)}>Edit</button></td>
                <td><button className="delete-btn" onClick={() => onDelete(user.id, type)}>Delete</button></td>
              </>
            ) : (
              <>
                <td>{user.firstName} {user.lastName}</td>
                <td>{user.phoneNumber}</td>
                <td>{user.email}</td>
                <td>{user.dateOfBirth}</td>
                <td>{user.gender}</td>
                <td>{user.bloodGroup}</td>
                <td>{user.emergencyContactName} ({user.emergencyContactPhone})</td>
                <td><button onClick={() => onEdit(type, user)}>Edit</button></td>
                <td><button className="delete-btn" onClick={() => onDelete(user.id, type)}>Delete</button></td>
              </>
            )}
          </tr>
        ))
      )}
    </tbody>
  </table>
);

const UserApprovalTable = ({ users, type, onApprove, onReject }) => (
  <table className="admin-table">
    <thead>
      <tr>
        {type === "doctor" ? (
          <>
            <th>Name</th>
            <th>Specialization</th>
            <th>License</th>
            <th>Experience</th>
            <th>Fee</th>
            <th>Qualifications</th>
            <th>Contact</th>
            <th>Email</th>
            <th>Approve</th>
            <th>Reject</th>
          </>
        ) : (
          <>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>DOB</th>
            <th>Gender</th>
            <th>Blood Group</th>
            <th>Emergency Contact</th>
            <th>Approve</th>
            <th>Reject</th>
          </>
        )}
      </tr>
    </thead>
    <tbody>
      {users.length === 0 ? (
        <tr>
          <td colSpan={type === "doctor" ? 10 : 9} className="empty-msg">No pending records.</td>
        </tr>
      ) : (
        users.map((user) => (
          <tr key={user.id}>
            {type === "doctor" ? (
              <>
                <td>{user.firstName} {user.lastName}</td>
                <td>{user.specialization}</td>
                <td>{user.licenseNumber}</td>
                <td>{user.yearsOfExperience} yrs</td>
                <td>₹{user.consultationFee}</td>
                <td>{user.qualifications}</td>
                <td>{user.phoneNumber}</td>
                <td>{user.email}</td>
                <td><button className="approve-btn" onClick={() => onApprove(user.id)}>Approve</button></td>
                <td><button className="reject-btn" onClick={() => onReject(user.id)}>Reject</button></td>
              </>
            ) : (
              <>
                <td>{user.firstName} {user.lastName}</td>
                <td>{user.phoneNumber}</td>
                <td>{user.email}</td>
                <td>{user.dateOfBirth}</td>
                <td>{user.gender}</td>
                <td>{user.bloodGroup}</td>
                <td>{user.emergencyContactName} ({user.emergencyContactPhone})</td>
                <td><button className="approve-btn" onClick={() => onApprove(user.id)}>Approve</button></td>
                <td><button className="reject-btn" onClick={() => onReject(user.id)}>Reject</button></td>
              </>
            )}
          </tr>
        ))
      )}
    </tbody>
  </table>
);

const Pagination = ({ page, totalPages, onPageChange }) => {
  const prevPage = () => page > 0 && onPageChange(page - 1);
  const nextPage = () => page < totalPages - 1 && onPageChange(page + 1);

  return (
    <div className="pagination">
      <button disabled={page === 0} onClick={prevPage}>Previous</button>
      <span>Page {page + 1} of {totalPages}</span>
      <button disabled={page === totalPages - 1} onClick={nextPage}>Next</button>
    </div>
  );
};

const UserForm = ({ formType, formData, setFormData, onClose, onSubmit, editingUser }) => {
  const handleInput = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>{editingUser ? `Edit ${formType}` : `Add ${formType}`}</h3>
        <form onSubmit={onSubmit}>
          <label>First Name *</label>
          <input name="firstName" value={formData.firstName || ""} onChange={handleInput} required />

          <label>Last Name *</label>
          <input name="lastName" value={formData.lastName || ""} onChange={handleInput} required />

          <label>Email *</label>
          <input type="email" name="email" value={formData.email || ""} onChange={handleInput} required />

          <label>Phone Number *</label>
          <input name="phoneNumber" value={formData.phoneNumber || ""} onChange={handleInput} required />

          {formType === "doctor" ? (
            <>
              <label>Specialization *</label>
              <input name="specialization" value={formData.specialization || ""} onChange={handleInput} required />

              <label>License Number *</label>
              <input name="licenseNumber" value={formData.licenseNumber || ""} onChange={handleInput} required />

              <label>Years of Experience *</label>
              <input type="number" name="yearsOfExperience" value={formData.yearsOfExperience || ""} onChange={handleInput} required />

              <label>Consultation Fee (₹) *</label>
              <input type="number" name="consultationFee" value={formData.consultationFee || ""} onChange={handleInput} required />

              <label>Qualifications *</label>
              <input name="qualifications" value={formData.qualifications || ""} onChange={handleInput} required />
            </>
          ) : (
            <>
              <label>Date of Birth</label>
              <input type="date" name="dateOfBirth" value={formData.dateOfBirth || ""} onChange={handleInput} />

              <label>Gender</label>
              <select name="gender" value={formData.gender || ""} onChange={handleInput}>
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>

              <label>Blood Group</label>
              <input name="bloodGroup" value={formData.bloodGroup || ""} onChange={handleInput} />

              <label>Emergency Contact Name</label>
              <input name="emergencyContactName" value={formData.emergencyContactName || ""} onChange={handleInput} />

              <label>Emergency Contact Phone</label>
              <input name="emergencyContactPhone" value={formData.emergencyContactPhone || ""} onChange={handleInput} />
            </>
          )}

          <button type="submit">{editingUser ? "Update" : "Add"}</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;