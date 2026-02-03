import React from 'react';

const PatientForm = ({ formData, onChange }) => {
  return (
    <form>
      <label>First Name:</label>
      <input name="firstName" value={formData.firstName || ''} onChange={onChange} />
      <label>Last Name:</label>
      <input name="lastName" value={formData.lastName || ''} onChange={onChange} />
      <label>Email:</label>
      <input name="email" value={formData.email || ''} onChange={onChange} />
      <label>Date of Birth:</label>
      <input name="dob" type="date" value={formData.dob || ''} onChange={onChange} />
    </form>
  );
};

export default PatientForm;