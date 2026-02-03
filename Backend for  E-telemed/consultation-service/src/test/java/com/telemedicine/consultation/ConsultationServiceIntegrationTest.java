package com.telemedicine.consultation;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.telemedicine.consultation.dto.AppointmentDTO;
import com.telemedicine.consultation.dto.AppointmentRequestDTO;
import com.telemedicine.consultation.dto.ConsultationDTO;
import com.telemedicine.consultation.model.AppointmentStatus;
import com.telemedicine.consultation.model.ConsultationStatus;
import com.telemedicine.consultation.service.AppointmentService;
import com.telemedicine.consultation.service.ConsultationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Comprehensive integration tests for Consultation Service
 * Tests appointment scheduling, consultation management, and authorization
 */
@SpringBootTest(classes = ConsultationServiceApplication.class)
@AutoConfigureMockMvc
public class ConsultationServiceIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AppointmentService appointmentService;

    @MockBean
    private ConsultationService consultationService;

    private AppointmentRequestDTO appointmentRequest;
    private AppointmentDTO sampleAppointment;
    private ConsultationDTO sampleConsultation;
    private List<AppointmentDTO> sampleAppointmentList;
    private List<ConsultationDTO> sampleConsultationList;

    @BeforeEach
    void setUp() {
        // ===== Setup Appointment Request =====
        appointmentRequest = AppointmentRequestDTO.builder()
                .doctorId(2L)
                .appointmentDate(LocalDateTime.now().plusDays(1))
                .durationMinutes(30)
                .reason("Regular checkup")
                .notes("No specific concerns")
                .build();

        // ===== Setup Sample Appointment =====
        sampleAppointment = AppointmentDTO.builder()
                .id(1L)
                .patientId(1L)
                .doctorId(2L)
                .appointmentDate(LocalDateTime.now().plusDays(1))
                .durationMinutes(30)
                .status(AppointmentStatus.PENDING)
                .reason("Regular checkup")
                .notes("No specific concerns")
                .createdAt(LocalDateTime.now())
                .build();

        AppointmentDTO appointment2 = AppointmentDTO.builder()
                .id(2L)
                .patientId(1L)
                .doctorId(2L)
                .appointmentDate(LocalDateTime.now().plusDays(2))
                .durationMinutes(45)
                .status(AppointmentStatus.CONFIRMED)
                .reason("Follow-up consultation")
                .notes("Previous visit follow-up")
                .createdAt(LocalDateTime.now().minusDays(1))
                .build();

        sampleAppointmentList = Arrays.asList(sampleAppointment, appointment2);

        // ===== Setup Sample Consultation =====
        sampleConsultation = ConsultationDTO.builder()
                .id(1L)
                .appointmentId(1L)
                .patientId(1L)
                .doctorId(2L)
                .status(ConsultationStatus.IN_PROGRESS)
                .startTime(LocalDateTime.now())
                .chiefComplaint("Persistent headache")
                .createdAt(LocalDateTime.now())
                .build();

        ConsultationDTO consultation2 = ConsultationDTO.builder()
                .id(2L)
                .appointmentId(2L)
                .patientId(1L)
                .doctorId(2L)
                .status(ConsultationStatus.COMPLETED)
                .startTime(LocalDateTime.now().minusDays(7))
                .endTime(LocalDateTime.now().minusDays(7).plusMinutes(30))
                .chiefComplaint("Fever and cold")
                .diagnosis("Upper respiratory tract infection")
                .treatment("Prescribed antibiotics and rest")
                .followUpInstructions("Return if symptoms persist after 3 days")
                .createdAt(LocalDateTime.now().minusDays(7))
                .build();

        sampleConsultationList = Arrays.asList(sampleConsultation, consultation2);

        // ===== Mock AppointmentService =====
        Mockito.when(appointmentService.createAppointment(anyLong(), any(AppointmentRequestDTO.class)))
                .thenReturn(sampleAppointment);

        Page<AppointmentDTO> appointmentPage = new PageImpl<>(
                sampleAppointmentList, PageRequest.of(0, 10), 2);

        Mockito.when(appointmentService.getPatientAppointments(anyLong(), any()))
                .thenReturn(appointmentPage);

        Mockito.when(appointmentService.getDoctorAppointments(anyLong(), any()))
                .thenReturn(appointmentPage);

        Mockito.when(appointmentService.getAppointmentById(anyLong()))
                .thenReturn(sampleAppointment);

        Mockito.when(appointmentService.confirmAppointment(anyLong()))
                .thenAnswer(invocation -> {
                    AppointmentDTO confirmed = AppointmentDTO.builder()
                            .id(sampleAppointment.getId())
                            .patientId(sampleAppointment.getPatientId())
                            .doctorId(sampleAppointment.getDoctorId())
                            .appointmentDate(sampleAppointment.getAppointmentDate())
                            .durationMinutes(sampleAppointment.getDurationMinutes())
                            .status(AppointmentStatus.CONFIRMED)
                            .reason(sampleAppointment.getReason())
                            .notes(sampleAppointment.getNotes())
                            .createdAt(sampleAppointment.getCreatedAt())
                            .updatedAt(LocalDateTime.now())
                            .build();
                    return confirmed;
                });

        Mockito.when(appointmentService.cancelAppointment(anyLong(), anyString()))
                .thenAnswer(invocation -> {
                    AppointmentDTO cancelled = AppointmentDTO.builder()
                            .id(sampleAppointment.getId())
                            .patientId(sampleAppointment.getPatientId())
                            .doctorId(sampleAppointment.getDoctorId())
                            .appointmentDate(sampleAppointment.getAppointmentDate())
                            .durationMinutes(sampleAppointment.getDurationMinutes())
                            .status(AppointmentStatus.CANCELLED)
                            .reason(sampleAppointment.getReason())
                            .cancellationReason(invocation.getArgument(1))
                            .createdAt(sampleAppointment.getCreatedAt())
                            .updatedAt(LocalDateTime.now())
                            .build();
                    return cancelled;
                });

        Mockito.when(appointmentService.rescheduleAppointment(anyLong(), any(LocalDateTime.class)))
                .thenAnswer(invocation -> {
                    AppointmentDTO rescheduled = AppointmentDTO.builder()
                            .id(sampleAppointment.getId())
                            .patientId(sampleAppointment.getPatientId())
                            .doctorId(sampleAppointment.getDoctorId())
                            .appointmentDate(invocation.getArgument(1))
                            .durationMinutes(sampleAppointment.getDurationMinutes())
                            .status(AppointmentStatus.RESCHEDULED)
                            .reason(sampleAppointment.getReason())
                            .createdAt(sampleAppointment.getCreatedAt())
                            .updatedAt(LocalDateTime.now())
                            .build();
                    return rescheduled;
                });

        // ===== Mock ConsultationService =====
        Mockito.when(consultationService.startConsultation(anyLong(), anyString()))
                .thenReturn(sampleConsultation);

        Mockito.when(consultationService.completeConsultation(anyLong(), any(ConsultationDTO.class)))
                .thenAnswer(invocation -> {
                    ConsultationDTO updates = invocation.getArgument(1);
                    ConsultationDTO completed = ConsultationDTO.builder()
                            .id(sampleConsultation.getId())
                            .appointmentId(sampleConsultation.getAppointmentId())
                            .patientId(sampleConsultation.getPatientId())
                            .doctorId(sampleConsultation.getDoctorId())
                            .status(ConsultationStatus.COMPLETED)
                            .startTime(sampleConsultation.getStartTime())
                            .endTime(LocalDateTime.now())
                            .chiefComplaint(sampleConsultation.getChiefComplaint())
                            .diagnosis(updates.getDiagnosis())
                            .treatment(updates.getTreatment())
                            .notes(updates.getNotes())
                            .followUpInstructions(updates.getFollowUpInstructions())
                            .createdAt(sampleConsultation.getCreatedAt())
                            .updatedAt(LocalDateTime.now())
                            .build();
                    return completed;
                });

        Mockito.when(consultationService.getConsultationById(anyLong()))
                .thenReturn(sampleConsultation);

        Mockito.when(consultationService.getConsultationByAppointmentId(anyLong()))
                .thenReturn(sampleConsultation);

        Page<ConsultationDTO> consultationPage = new PageImpl<>(
                sampleConsultationList, PageRequest.of(0, 10), 2);

        Mockito.when(consultationService.getPatientConsultations(anyLong(), any()))
                .thenReturn(consultationPage);

        Mockito.when(consultationService.getDoctorConsultations(anyLong(), any()))
                .thenReturn(consultationPage);

        Mockito.when(consultationService.updateConsultationNotes(anyLong(), anyString()))
                .thenAnswer(invocation -> {
                    ConsultationDTO updated = ConsultationDTO.builder()
                            .id(sampleConsultation.getId())
                            .appointmentId(sampleConsultation.getAppointmentId())
                            .patientId(sampleConsultation.getPatientId())
                            .doctorId(sampleConsultation.getDoctorId())
                            .status(sampleConsultation.getStatus())
                            .startTime(sampleConsultation.getStartTime())
                            .chiefComplaint(sampleConsultation.getChiefComplaint())
                            .notes(invocation.getArgument(1))
                            .createdAt(sampleConsultation.getCreatedAt())
                            .updatedAt(LocalDateTime.now())
                            .build();
                    return updated;
                });
    }

    // ================== APPOINTMENT CREATION TESTS ==================

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testCreateAppointment_AsPatient_Success() throws Exception {
        mockMvc.perform(post("/api/v1/appointments")
                        .header("X-User-Id", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(appointmentRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.patientId").value(1))
                .andExpect(jsonPath("$.data.doctorId").value(2))
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andExpect(jsonPath("$.data.reason").value("Regular checkup"));
    }

    @Test
    void testCreateAppointment_Unauthenticated_Forbidden() throws Exception {
        mockMvc.perform(post("/api/v1/appointments")
                        .header("X-User-Id", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(appointmentRequest)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "doctor@example.com", roles = {"DOCTOR"})
    void testCreateAppointment_AsDoctor_Forbidden() throws Exception {
        mockMvc.perform(post("/api/v1/appointments")
                        .header("X-User-Id", "2")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(appointmentRequest)))
                .andExpect(status().isForbidden());
    }

    // ================== APPOINTMENT RETRIEVAL TESTS ==================

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testGetPatientAppointments_AsPatient_Success() throws Exception {
        mockMvc.perform(get("/api/v1/appointments/patient/1")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.content", hasSize(2)))
                .andExpect(jsonPath("$.data.totalElements").value(2))
                .andExpect(jsonPath("$.data.content[0].status").value("PENDING"))
                .andExpect(jsonPath("$.data.content[1].status").value("CONFIRMED"));
    }

    @Test
    @WithMockUser(username = "doctor@example.com", roles = {"DOCTOR"})
    void testGetDoctorAppointments_AsDoctor_Success() throws Exception {
        mockMvc.perform(get("/api/v1/appointments/doctor/2")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.content", hasSize(2)));
    }

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testGetDoctorAppointments_AsPatient_Forbidden() throws Exception {
        mockMvc.perform(get("/api/v1/appointments/doctor/2")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testGetAppointmentById_Success() throws Exception {
        mockMvc.perform(get("/api/v1/appointments/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.patientId").value(1))
                .andExpect(jsonPath("$.data.doctorId").value(2));
    }

    // ================== APPOINTMENT MANAGEMENT TESTS ==================

    @Test
    @WithMockUser(username = "doctor@example.com", roles = {"DOCTOR"})
    void testConfirmAppointment_AsDoctor_Success() throws Exception {
        mockMvc.perform(put("/api/v1/appointments/1/confirm"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("CONFIRMED"));
    }

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testConfirmAppointment_AsPatient_Forbidden() throws Exception {
        mockMvc.perform(put("/api/v1/appointments/1/confirm"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testCancelAppointment_AsPatient_Success() throws Exception {
        mockMvc.perform(put("/api/v1/appointments/1/cancel")
                        .param("reason", "Personal emergency"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("CANCELLED"))
                .andExpect(jsonPath("$.data.cancellationReason").value("Personal emergency"));
    }

    @Test
    @WithMockUser(username = "doctor@example.com", roles = {"DOCTOR"})
    void testCancelAppointment_AsDoctor_Success() throws Exception {
        mockMvc.perform(put("/api/v1/appointments/1/cancel")
                        .param("reason", "Doctor unavailable"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("CANCELLED"));
    }

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testRescheduleAppointment_Success() throws Exception {
        String newDate = LocalDateTime.now().plusDays(3).toString();

        mockMvc.perform(put("/api/v1/appointments/1/reschedule")
                        .param("newDate", newDate))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("RESCHEDULED"));
    }

    // ================== CONSULTATION MANAGEMENT TESTS ==================

    @Test
    @WithMockUser(username = "doctor@example.com", roles = {"DOCTOR"})
    void testStartConsultation_AsDoctor_Success() throws Exception {
        mockMvc.perform(post("/api/v1/consultations/start")
                        .param("appointmentId", "1")
                        .param("chiefComplaint", "Persistent headache"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.appointmentId").value(1))
                .andExpect(jsonPath("$.data.status").value("IN_PROGRESS"))
                .andExpect(jsonPath("$.data.chiefComplaint").value("Persistent headache"));
    }

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testStartConsultation_AsPatient_Forbidden() throws Exception {
        mockMvc.perform(post("/api/v1/consultations/start")
                        .param("appointmentId", "1")
                        .param("chiefComplaint", "Persistent headache"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "doctor@example.com", roles = {"DOCTOR"})
    void testCompleteConsultation_AsDoctor_Success() throws Exception {
        ConsultationDTO updates = ConsultationDTO.builder()
                .diagnosis("Tension headache")
                .treatment("Prescribed pain relievers and rest")
                .notes("Patient advised to reduce stress")
                .followUpInstructions("Return if symptoms persist after 1 week")
                .build();

        mockMvc.perform(put("/api/v1/consultations/1/complete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updates)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("COMPLETED"))
                .andExpect(jsonPath("$.data.diagnosis").value("Tension headache"))
                .andExpect(jsonPath("$.data.treatment").value("Prescribed pain relievers and rest"));
    }

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testCompleteConsultation_AsPatient_Forbidden() throws Exception {
        ConsultationDTO updates = ConsultationDTO.builder()
                .diagnosis("Test diagnosis")
                .build();

        mockMvc.perform(put("/api/v1/consultations/1/complete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updates)))
                .andExpect(status().isForbidden());
    }

    // ================== CONSULTATION RETRIEVAL TESTS ==================

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testGetConsultationById_AsPatient_Success() throws Exception {
        mockMvc.perform(get("/api/v1/consultations/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.appointmentId").value(1))
                .andExpect(jsonPath("$.data.status").value("IN_PROGRESS"));
    }

    @Test
    @WithMockUser(username = "doctor@example.com", roles = {"DOCTOR"})
    void testGetConsultationByAppointmentId_AsDoctor_Success() throws Exception {
        mockMvc.perform(get("/api/v1/consultations/appointment/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.appointmentId").value(1));
    }

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testGetPatientConsultations_AsPatient_Success() throws Exception {
        mockMvc.perform(get("/api/v1/consultations/patient/1")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.content", hasSize(2)))
                .andExpect(jsonPath("$.data.totalElements").value(2));
    }

    @Test
    @WithMockUser(username = "doctor@example.com", roles = {"DOCTOR"})
    void testGetDoctorConsultations_AsDoctor_Success() throws Exception {
        mockMvc.perform(get("/api/v1/consultations/doctor/2")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content", hasSize(2)));
    }

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testGetDoctorConsultations_AsPatient_Forbidden() throws Exception {
        mockMvc.perform(get("/api/v1/consultations/doctor/2")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "doctor@example.com", roles = {"DOCTOR"})
    void testUpdateConsultationNotes_AsDoctor_Success() throws Exception {
        mockMvc.perform(put("/api/v1/consultations/1/notes")
                        .param("notes", "Patient showing improvement"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.notes").value("Patient showing improvement"));
    }

    // ================== VALIDATION TESTS ==================

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testCreateAppointment_PastDate_BadRequest() throws Exception {
        AppointmentRequestDTO invalidRequest = AppointmentRequestDTO.builder()
                .doctorId(2L)
                .appointmentDate(LocalDateTime.now().minusDays(1))
                .durationMinutes(30)
                .reason("Test")
                .build();

        mockMvc.perform(post("/api/v1/appointments")
                        .header("X-User-Id", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testCreateAppointment_InvalidDuration_BadRequest() throws Exception {
        AppointmentRequestDTO invalidRequest = AppointmentRequestDTO.builder()
                .doctorId(2L)
                .appointmentDate(LocalDateTime.now().plusDays(1))
                .durationMinutes(10)  // Less than 15 min
                .reason("Test")
                .build();

        mockMvc.perform(post("/api/v1/appointments")
                        .header("X-User-Id", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testCreateAppointment_MissingReason_BadRequest() throws Exception {
        AppointmentRequestDTO invalidRequest = AppointmentRequestDTO.builder()
                .doctorId(2L)
                .appointmentDate(LocalDateTime.now().plusDays(1))
                .durationMinutes(30)
                .build();

        mockMvc.perform(post("/api/v1/appointments")
                        .header("X-User-Id", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    // ================== EDGE CASE TESTS ==================

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testCreateAppointment_LongDuration_Success() throws Exception {
        AppointmentRequestDTO longRequest = AppointmentRequestDTO.builder()
                .doctorId(2L)
                .appointmentDate(LocalDateTime.now().plusDays(1))
                .durationMinutes(120)  // Max allowed
                .reason("Comprehensive health checkup")
                .notes("Full body examination required")
                .build();

        mockMvc.perform(post("/api/v1/appointments")
                        .header("X-User-Id", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(longRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void testGetAppointmentById_Unauthenticated_Forbidden() throws Exception {
        mockMvc.perform(get("/api/v1/appointments/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testGetConsultationById_Unauthenticated_Forbidden() throws Exception {
        mockMvc.perform(get("/api/v1/consultations/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void testGetPatientAppointments_AsAdmin_Success() throws Exception {
        mockMvc.perform(get("/api/v1/appointments/patient/1")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void testGetPatientConsultations_AsAdmin_Success() throws Exception {
        mockMvc.perform(get("/api/v1/consultations/patient/1")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}