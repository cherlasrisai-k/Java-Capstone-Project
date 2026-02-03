import axiosClient from './axiosClient';
import { BASE_URLS } from './axiosClient';  // ✅ CORRECT IMPORT

export const consultationMethods = {
  getConsultationById(consultationId) {
    return axiosClient.get(`${BASE_URLS.CONSULT}/api/v1/consultations/${consultationId}`);
  },
  // New method to fetch consultation by appointment ID
  getConsultationByAppointmentId(appointmentId) {
    return axiosClient.get(`${BASE_URLS.CONSULT}/api/v1/consultations/appointment/${appointmentId}`);
  },
  getConsultationMessages(consultationId) {
    return axiosClient.get(`${BASE_URLS.CONSULT}/api/v1/appointments/${consultationId}/messages`);
  },
  sendConsultationMessage(consultationId, messageData) {
    return axiosClient.post(`${BASE_URLS.CONSULT}/api/v1/appointments/${consultationId}/messages`, messageData);
  },
  getConsultationPrescription(consultationId) {
    return axiosClient.get(`${BASE_URLS.PRESCRIPTION}/api/v1/prescriptions/consultation/${consultationId}`);
  },
  createPrescription(prescriptionData) {
    return axiosClient.post(`${BASE_URLS.PRESCRIPTION}/api/v1/prescriptions`, prescriptionData);
  },
  getPrescriptionById(prescriptionId) {
    return axiosClient.get(`${BASE_URLS.PRESCRIPTION}/api/v1/prescriptions/${prescriptionId}`);
  },
  getDoctorPrescriptions(doctorId, page = 0, size = 10) {
    return axiosClient.get(`${BASE_URLS.PRESCRIPTION}/api/v1/prescriptions/doctor/${doctorId}?page=${page}&size=${size}`);
  },
  getPatientPrescriptions(patientId, page = 0, size = 10) {
    return axiosClient.get(`${BASE_URLS.PRESCRIPTION}/api/v1/prescriptions/patient/${patientId}?page=${page}&size=${size}`);
  },
  cancelPrescription(prescriptionId, reason) {
    return axiosClient.put(`${BASE_URLS.PRESCRIPTION}/api/v1/prescriptions/${prescriptionId}/cancel?reason=${encodeURIComponent(reason)}`);
  },
  getDoctorConsultations(doctorId, page = 0, size = 10) {
    return axiosClient.get(`${BASE_URLS.CONSULT}/api/v1/consultations/doctor/${doctorId}?page=${page}&size=${size}`);
  },
  getPatientConsultations(patientId, page = 0, size = 10) {
    return axiosClient.get(`${BASE_URLS.CONSULT}/api/v1/consultations/patient/${patientId}?page=${page}&size=${size}`);
  },
};

export const patientPrescriptionMethods = consultationMethods;
