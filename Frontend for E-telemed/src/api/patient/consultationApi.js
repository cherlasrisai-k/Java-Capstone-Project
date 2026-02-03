import axiosClient from "../axiosClient";
import { BASE_URLS } from "../axiosClient";

const API = BASE_URLS.CONSULT;

export default {
  start(appointmentId, complaint) {
    return axiosClient.post(`${API}/api/v1/consultations/start`, null, {
      params: { appointmentId, chiefComplaint: complaint },
    }); // ✓
  },

  updateNotes(id, notes) {
    return axiosClient.put(`${API}/api/v1/consultations/${id}/notes`, null, {
      params: { notes },
    }); // ✓
  },

  complete(id, body) {
    return axiosClient.put(`${API}/api/v1/consultations/${id}/complete`, body); // ✓
  },

  getById(id) {
    return axiosClient.get(`${API}/api/v1/consultations/${id}`); // ✓
  },

  getByPatient(patientId, pageable = {}) {
    return axiosClient.get(`${API}/api/v1/consultations/patient/${patientId}`, {
      params: pageable,
    }); // ✓
  },

  getByDoctor(doctorId, pageable = {}) {
    return axiosClient.get(`${API}/api/v1/consultations/doctor/${doctorId}`, {
      params: pageable,
    }); // ✓
  },
};