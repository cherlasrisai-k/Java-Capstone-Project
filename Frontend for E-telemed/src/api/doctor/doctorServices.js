import axiosClient, { BASE_URLS } from "../axiosClient";
import { consultationMethods } from '../consultationServices';

export default {
  // ========== DOCTOR PROFILE ==========
  getCurrentDoctor() {
    const id = localStorage.getItem('id');
    return axiosClient.get(`${BASE_URLS.AUTH}/doctors/${id}`);
  },

  // ========== PRESCRIPTIONS ==========
  getDoctorPrescriptions(doctorId, page = 0, size = 20) {
    return axiosClient.get(`${BASE_URLS.PRESCRIPTION}/api/v1/prescriptions/doctor/${doctorId}`, {
      params: { page, size }
    });
  },

  createPrescription(prescriptionRequest) {
    // ✅ FIXED: Prescription endpoint expects full payload
    return axiosClient.post(
      `${BASE_URLS.PRESCRIPTION}/api/v1/prescriptions`,
      prescriptionRequest
    );
  },

  getPrescriptionByConsultationId(consultationId) {
    // ✅ FIXED: Get prescription for specific consultation
    return axiosClient.get(
      `${BASE_URLS.PRESCRIPTION}/api/v1/prescriptions/consultation/${consultationId}`
    );
  },

  // ========== APPOINTMENTS ==========
  getDoctorAppointments(doctorId, page = 0, size = 10) {
    return axiosClient.get(
      `${BASE_URLS.CONSULT}/api/v1/appointments/doctor/${doctorId}`,
      { params: { page, size, sort: "appointmentDate,asc" } }
    );
  },

  getAppointmentById(appointmentId) {
    return axiosClient.get(`${BASE_URLS.CONSULT}/api/v1/appointments/${appointmentId}`);
  },

  confirmAppointment(appointmentId) {
    return axiosClient.put(
      `${BASE_URLS.CONSULT}/api/v1/appointments/${appointmentId}/confirm`
    );
  },

  cancelAppointment(appointmentId, reason) {
    return axiosClient.put(
      `${BASE_URLS.CONSULT}/api/v1/appointments/${appointmentId}/cancel`,
      null,
      { params: { reason } }
    );
  },

  rescheduleAppointment(appointmentId, newDate) {
    return axiosClient.put(
      `${BASE_URLS.CONSULT}/api/v1/appointments/${appointmentId}/reschedule`,
      null,
      { params: { newDate } }
    );
  },

  // ========== PATIENTS ==========
  getPatientById(patientId) {
    return axiosClient.get(`${BASE_URLS.AUTH}/patients/${patientId}`);
  },

  getRecentPatients(doctorId, page = 0, size = 5) {
    return axiosClient.get(
      `${BASE_URLS.CONSULT}/api/v1/patients/doctor/${doctorId}/recent`,
      { params: { page, size } }
    ).catch(() => ({ data: { data: { content: [] } } }));
  },

  // ========== CONSULTATIONS ==========
  getConsultations(doctorId, page = 0, size = 10) {
    // ✅ FIXED: Proper async handling with return statement
    return axiosClient.get(
      `${BASE_URLS.CONSULT}/api/v1/consultations/doctor/${doctorId}`,
      { params: { page, size, sort: "createdAt,desc" } }
    ).catch(() => ({ data: { data: { content: [] } } }));
  },

  getConsultationById(consultationId) {
    return axiosClient.get(
      `${BASE_URLS.CONSULT}/api/v1/consultations/${consultationId}`
    );
  },

  startConsultation(appointmentId, chiefComplaint) {
    return axiosClient.post(
      `${BASE_URLS.CONSULT}/api/v1/consultations/start`,
      null,
      { params: { appointmentId, chiefComplaint } }
    );
  },

  updateConsultationNotes(consultationId, notes) {
    return axiosClient.put(
      `${BASE_URLS.CONSULT}/api/v1/consultations/${consultationId}/notes`,
      null,
      { params: { notes } }
    );
  },

  completeConsultation(consultationId, updates) {
    return axiosClient.put(
      `${BASE_URLS.CONSULT}/api/v1/consultations/${consultationId}/complete`,
      updates
    );
  },
sendEmailNotification: (payload) =>
    {
      return axiosClient.post(`${BASE_URLS.NOTIFICATION}/api/v1/notifications/email`, payload)
    },
  // ========== CONSULTATION MESSAGES ==========
  getConsultationMessages(consultationId) {
    return axiosClient.get(
      `${BASE_URLS.CONSULT}/api/v1/consultations/${consultationId}/messages`
    );
  },

  sendConsultationMessage(consultationId, messageRequest) {
    return axiosClient.post(
      `${BASE_URLS.CONSULT}/api/v1/consultations/${consultationId}/messages`,
      messageRequest
    );
  },

  getConsultationPrescription(consultationId) {
    // ✅ FIXED: Use correct prescription endpoint
    return axiosClient.get(
      `${BASE_URLS.PRESCRIPTION}/api/v1/prescriptions/consultation/${consultationId}`
    );
  },

  // ========== NOTIFICATIONS ==========
  getNotifications(doctorId, page = 0, size = 5) {
    return axiosClient.get(
      `${BASE_URLS.NOTIFICATION}/api/v1/notifications/user/${doctorId}`,
      { params: { page, size, sort: "createdAt,desc" } }
    ).catch(() => ({ data: { data: { content: [] } } }));
  },

  getUnreadNotificationCount(doctorId) {
    return axiosClient.get(
      `${BASE_URLS.NOTIFICATION}/api/v1/notifications/user/${doctorId}/unread-count`
    ).catch(() => ({ data: { data: 0 } }));
  },

  markNotificationAsRead(notificationId) {
    return axiosClient.put(
      `${BASE_URLS.NOTIFICATION}/api/v1/notifications/${notificationId}/mark-read`
    ).catch(() => ({ data: { success: true } }));
  },

  // ========== HEALTH ALERTS ==========
  getDoctorAlerts(doctorId, page = 0, size = 5) {
    return axiosClient.get(
      `${BASE_URLS.HEALTH}/api/v1/alerts/doctor/${doctorId}`,
      { params: { page, size } }
    ).catch(() => ({ data: { data: { content: [] } } }));
  },

  // ========== EXPORTED METHODS ==========
  ...consultationMethods
};