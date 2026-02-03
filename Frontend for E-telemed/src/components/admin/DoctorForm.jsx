import React from 'react';

const DoctorForm = ({ formData, onChange }) => {
  return (
    <form>
      <label>First Name:</label>
      <input name="firstName" value={formData.firstName || ''} onChange={onChange} />
      <label>Last Name:</label>
      <input name="lastName" value={formData.lastName || ''} onChange={onChange} />
      <label>Email:</label>
      <input name="email" value={formData.email || ''} onChange={onChange} />
      <label>Specialization:</label>
      <input name="specialization" value={formData.specialization || ''} onChange={onChange} />
    </form>
  );
};

export default DoctorForm;