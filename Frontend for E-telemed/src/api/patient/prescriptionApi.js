import axiosClient from "../axiosClient";
import { BASE_URLS } from "../axiosClient";

const API = BASE_URLS.PRESCRIPTION;

export default {
  create(data) {
    return axiosClient.post(`${API}/api/v1/prescriptions`, data); // ✓
  },

  getById(id) {
    return axiosClient.get(`${API}/api/v1/prescriptions/${id}`); // ✓
  },

  getByConsultation(consultationId) {
    return axiosClient.get(`${API}/api/v1/prescriptions/consultation/${consultationId}`); // ✓
  },

  getByPatient(patientId, pageable = {}) {
    return axiosClient.get(`${API}/api/v1/prescriptions/patient/${patientId}`, {
      params: pageable,
    }); // ✓
  },

  getByDoctor(doctorId, pageable = {}) {
    return axiosClient.get(`${API}/api/v1/prescriptions/doctor/${doctorId}`, {
      params: pageable,
    }); // ✓
  },

  cancel(id, reason) {
    return axiosClient.put(`${API}/api/v1/prescriptions/${id}/cancel`, null, {
      params: { reason },
    }); // ✓
  },
};