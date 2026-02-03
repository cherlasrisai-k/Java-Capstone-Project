import axiosClient from "../axiosClient";
import { BASE_URLS } from "../axiosClient";

const API = BASE_URLS.HEALTH;

export default {
  getLatest(patientId, limit = 5) {
    return axiosClient.get(`${API}/api/v1/health-data/latest`, {
      params: { patientId, limit },
    }); // ✓
  },

  getById(id) {
    return axiosClient.get(`${API}/api/v1/health-data/${id}`); // ✓
  },

  upload(data) {
    return axiosClient.post(`${API}/api/v1/health-data`, data); // ✓
  },

  update(id, data) {
    return axiosClient.put(`${API}/api/v1/health-data/${id}`, data); // ✓
  },

  list(patientId, pageable = {}) {
    return axiosClient.get(`${API}/api/v1/health-data`, {
      params: { patientId, ...pageable },
    }); // ✓
  },
};