import axiosClient from "../axiosClient";
import { BASE_URLS } from "../axiosClient";

const API = BASE_URLS.CONSULT;

export default {
  create(data) {
    return axiosClient.post(`${API}/api/v1/appointments`, data); // Create new appointment
  },

  reschedule(id, newDate) {
    return axiosClient.put(`${API}/api/v1/appointments/${id}/reschedule`, null, {
      params: { newDate },
    }); // Reschedule appointment
  },

  confirm(id) {
    return axiosClient.put(`${API}/api/v1/appointments/${id}/confirm`); // Confirm appointment
  },

  cancel(id, reason) {
    return axiosClient.put(`${API}/api/v1/appointments/${id}/cancel`, null, {
      params: { reason },
    }); // Cancel appointment with reason
  },

  getByPatient(patientId, pageable = {}) {
    return axiosClient.get(`${API}/api/v1/appointments/patient/${patientId}`, {
      params: pageable,
    }); // Get appointments by patient
  },

  getByDoctor(doctorId, pageable = {}) {
    return axiosClient.get(`${API}/api/v1/appointments/doctor/${doctorId}`, {
      params: pageable,
    }); // Get appointments by doctor
  },
};