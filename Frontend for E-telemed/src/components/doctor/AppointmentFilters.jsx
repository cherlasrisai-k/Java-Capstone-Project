// src/components/doctor/AppointmentFilters.jsx
import React, { useState } from "react";

function AppointmentFilters({ filters, onFilterChange }) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange(localFilters);
  };

  return (
    <form className="filters-form" onSubmit={handleSubmit}>
      <div className="filter-group">
        <label>Date</label>
        <input
          type="date"
          value={localFilters.date}
          onChange={(e) => setLocalFilters({ ...localFilters, date: e.target.value })}
        />
      </div>
      
      <div className="filter-group">
        <label>Status</label>
        <select
          value={localFilters.status}
          onChange={(e) => setLocalFilters({ ...localFilters, status: e.target.value })}
        >
          <option value="ALL">All Statuses</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Search Patient</label>
        <input
          type="text"
          placeholder="Patient name or ID"
          value={localFilters.patientSearch}
          onChange={(e) => setLocalFilters({ ...localFilters, patientSearch: e.target.value })}
        />
      </div>

      <button type="submit" className="btn primary small">Filter</button>
    </form>
  );
}

export default AppointmentFilters;