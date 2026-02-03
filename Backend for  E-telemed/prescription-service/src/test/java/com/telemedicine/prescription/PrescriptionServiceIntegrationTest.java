package com.telemedicine.prescription;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.telemedicine.prescription.dto.MedicationDTO;
import com.telemedicine.prescription.dto.PrescriptionDTO;
import com.telemedicine.prescription.dto.PrescriptionRequestDTO;
import com.telemedicine.prescription.model.PrescriptionStatus;
import com.telemedicine.prescription.service.PrescriptionService;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Comprehensive integration tests for Prescription Service
 * Tests prescription creation, retrieval, and authorization
 */
@SpringBootTest(classes = PrescriptionServiceApplication.class)
@AutoConfigureMockMvc
public class PrescriptionServiceIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PrescriptionService prescriptionService;

    private PrescriptionRequestDTO prescriptionRequest;
    private PrescriptionDTO samplePrescription;
    private List<PrescriptionDTO> samplePrescriptionList;

    @BeforeEach
    void setUp() {
        // ===== Setup Medication DTOs =====
        MedicationDTO medication1 = MedicationDTO.builder()
                .medicationName("Paracetamol")
                .dosage("500mg")
                .frequency("Twice daily")
                .durationDays(7)
                .instructions("Take after meals")
                .sideEffects("May cause drowsiness")
                .build();

        MedicationDTO medication2 = MedicationDTO.builder()
                .medicationName("Amoxicillin")
                .dosage("250mg")
                .frequency("Three times daily")
                .durationDays(5)
                .instructions("Complete full course")
                .sideEffects("Possible stomach upset")
                .build();

        // ===== Setup Prescription Request =====
        prescriptionRequest = PrescriptionRequestDTO.builder()
                .consultationId(1L)
                .patientId(1L)
                .validUntil(LocalDate.now().plusMonths(3))
                .diagnosis("Upper respiratory tract infection")
                .generalInstructions("Rest well and stay hydrated. Avoid cold foods.")
                .medications(Arrays.asList(medication1, medication2))
                .build();

        // ===== Setup Sample Prescription =====
        samplePrescription = PrescriptionDTO.builder()
                .id(1L)
                .consultationId(1L)
                .patientId(1L)
                .doctorId(2L)
                .status(PrescriptionStatus.ACTIVE)
                .prescriptionDate(LocalDate.now())
                .validUntil(LocalDate.now().plusMonths(3))
                .diagnosis("Upper respiratory tract infection")
                .generalInstructions("Rest well and stay hydrated. Avoid cold foods.")
                .medications(Arrays.asList(medication1, medication2))
                .createdAt(LocalDateTime.now())
                .build();

        PrescriptionDTO prescription2 = PrescriptionDTO.builder()
                .id(2L)
                .consultationId(2L)
                .patientId(1L)
                .doctorId(2L)
                .status(PrescriptionStatus.COMPLETED)
                .prescriptionDate(LocalDate.now().minusMonths(1))
                .validUntil(LocalDate.now().plusMonths(2))
                .diagnosis("Hypertension management")
                .generalInstructions("Monitor blood pressure daily")
                .medications(Arrays.asList(
                        MedicationDTO.builder()
                                .medicationName("Amlodipine")
                                .dosage("5mg")
                                .frequency("Once daily")
                                .durationDays(30)
                                .instructions("Take in the morning")
                                .build()
                ))
                .createdAt(LocalDateTime.now().minusMonths(1))
                .build();

        samplePrescriptionList = Arrays.asList(samplePrescription, prescription2);

        // ===== Mock PrescriptionService =====
        Mockito.when(prescriptionService.createPrescription(anyLong(), any(PrescriptionRequestDTO.class)))
                .thenReturn(samplePrescription);

        Mockito.when(prescriptionService.getPrescriptionById(anyLong()))
                .thenReturn(samplePrescription);

        Mockito.when(prescriptionService.getPrescriptionByConsultationId(anyLong()))
                .thenReturn(samplePrescription);

        Page<PrescriptionDTO> prescriptionPage = new PageImpl<>(
                samplePrescriptionList, PageRequest.of(0, 10), 2);

        Mockito.when(prescriptionService.getPatientPrescriptions(anyLong(), any()))
                .thenReturn(prescriptionPage);

        Mockito.when(prescriptionService.getDoctorPrescriptions(anyLong(), any()))
                .thenReturn(prescriptionPage);

        Mockito.when(prescriptionService.cancelPrescription(anyLong(), anyString()))
                .thenAnswer(invocation -> {
                    PrescriptionDTO cancelled = PrescriptionDTO.builder()
                            .id(samplePrescription.getId())
                            .consultationId(samplePrescription.getConsultationId())
                            .patientId(samplePrescription.getPatientId())
                            .doctorId(samplePrescription.getDoctorId())
                            .status(PrescriptionStatus.CANCELLED)
                            .prescriptionDate(samplePrescription.getPrescriptionDate())
                            .validUntil(samplePrescription.getValidUntil())
                            .diagnosis(samplePrescription.getDiagnosis())
                            .generalInstructions(samplePrescription.getGeneralInstructions())
                            .medications(samplePrescription.getMedications())
                            .createdAt(samplePrescription.getCreatedAt())
                            .updatedAt(LocalDateTime.now())
                            .build();
                    return cancelled;
                });
    }

    // ================== PRESCRIPTION CREATION TESTS ==================

    @Test
    @WithMockUser(username = "doctor@example.com", roles = {"DOCTOR"})
    void testCreatePrescription_AsDoctor_Success() throws Exception {
        mockMvc.perform(post("/api/v1/prescriptions")
                        .header("X-User-Id", "2")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(prescriptionRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.consultationId").value(1))
                .andExpect(jsonPath("$.data.patientId").value(1))
                .andExpect(jsonPath("$.data.doctorId").value(2))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"))
                .andExpect(jsonPath("$.data.diagnosis").value("Upper respiratory tract infection"))
                .andExpect(jsonPath("$.data.medications").isArray())
                .andExpect(jsonPath("$.data.medications", hasSize(2)))
                .andExpect(jsonPath("$.data.medications[0].medicationName").value("Paracetamol"))
                .andExpect(jsonPath("$.data.medications[1].medicationName").value("Amoxicillin"));
    }

    @Test
    void testCreatePrescription_Unauthenticated_Forbidden() throws Exception {
        mockMvc.perform(post("/api/v1/prescriptions")
                        .header("X-User-Id", "2")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(prescriptionRequest)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testCreatePrescription_AsPatient_Forbidden() throws Exception {
        mockMvc.perform(post("/api/v1/prescriptions")
                        .header("X-User-Id", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(prescriptionRequest)))
                .andExpect(status().isForbidden());
    }

    // ================== PRESCRIPTION RETRIEVAL TESTS ==================

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testGetPrescriptionById_AsPatient_Success() throws Exception {
        mockMvc.perform(get("/api/v1/prescriptions/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"))
                .andExpect(jsonPath("$.data.medications", hasSize(2)));
    }

    @Test
    @WithMockUser(username = "doctor@example.com", roles = {"DOCTOR"})
    void testGetPrescriptionById_AsDoctor_Success() throws Exception {
        mockMvc.perform(get("/api/v1/prescriptions/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1));
    }

    @Test
    void testGetPrescriptionById_Unauthenticated_Forbidden() throws Exception {
        mockMvc.perform(get("/api/v1/prescriptions/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testGetPrescriptionByConsultationId_Success() throws Exception {
        mockMvc.perform(get("/api/v1/prescriptions/consultation/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.consultationId").value(1))
                .andExpect(jsonPath("$.data.medications").isArray());
    }

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testGetPatientPrescriptions_AsPatient_Success() throws Exception {
        mockMvc.perform(get("/api/v1/prescriptions/patient/1")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.content", hasSize(2)))
                .andExpect(jsonPath("$.data.totalElements").value(2))
                .andExpect(jsonPath("$.data.content[0].status").value("ACTIVE"))
                .andExpect(jsonPath("$.data.content[1].status").value("COMPLETED"));
    }

    @Test
    @WithMockUser(username = "doctor@example.com", roles = {"DOCTOR"})
    void testGetDoctorPrescriptions_AsDoctor_Success() throws Exception {
        mockMvc.perform(get("/api/v1/prescriptions/doctor/2")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content", hasSize(2)));
    }

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testGetDoctorPrescriptions_AsPatient_Forbidden() throws Exception {
        mockMvc.perform(get("/api/v1/prescriptions/doctor/2")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isForbidden());
    }

    // ================== PRESCRIPTION CANCELLATION TESTS ==================

    @Test
    @WithMockUser(username = "doctor@example.com", roles = {"DOCTOR"})
    void testCancelPrescription_AsDoctor_Success() throws Exception {
        mockMvc.perform(put("/api/v1/prescriptions/1/cancel")
                        .param("reason", "Patient allergic to medication"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("CANCELLED"));
    }

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testCancelPrescription_AsPatient_Forbidden() throws Exception {
        mockMvc.perform(put("/api/v1/prescriptions/1/cancel")
                        .param("reason", "Test reason"))
                .andExpect(status().isForbidden());
    }

    // ================== VALIDATION TESTS ==================

    @Test
    @WithMockUser(username = "doctor@example.com", roles = {"DOCTOR"})
    void testCreatePrescription_MissingDiagnosis_BadRequest() throws Exception {
        PrescriptionRequestDTO invalidRequest = PrescriptionRequestDTO.builder()
                .consultationId(1L)
                .patientId(1L)
                .medications(Arrays.asList(
                        MedicationDTO.builder()
                                .medicationName("Test Med")
                                .dosage("100mg")
                                .frequency("Once daily")
                                .durationDays(7)
                                .build()
                ))
                .build();

        mockMvc.perform(post("/api/v1/prescriptions")
                        .header("X-User-Id", "2")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "doctor@example.com", roles = {"DOCTOR"})
    void testCreatePrescription_EmptyMedications_BadRequest() throws Exception {
        PrescriptionRequestDTO invalidRequest = PrescriptionRequestDTO.builder()
                .consultationId(1L)
                .patientId(1L)
                .diagnosis("Test diagnosis")
                .medications(Arrays.asList())
                .build();

        mockMvc.perform(post("/api/v1/prescriptions")
                        .header("X-User-Id", "2")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "doctor@example.com", roles = {"DOCTOR"})
    void testCreatePrescription_InvalidMedicationDuration_BadRequest() throws Exception {
        MedicationDTO invalidMed = MedicationDTO.builder()
                .medicationName("Test Med")
                .dosage("100mg")
                .frequency("Once daily")
                .durationDays(500)  // Exceeds max 365 days
                .build();

        PrescriptionRequestDTO invalidRequest = PrescriptionRequestDTO.builder()
                .consultationId(1L)
                .patientId(1L)
                .diagnosis("Test diagnosis")
                .medications(Arrays.asList(invalidMed))
                .build();

        mockMvc.perform(post("/api/v1/prescriptions")
                        .header("X-User-Id", "2")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    // ================== EDGE CASE TESTS ==================

    @Test
    @WithMockUser(username = "doctor@example.com", roles = {"DOCTOR"})
    void testCreatePrescription_SingleMedication_Success() throws Exception {
        MedicationDTO singleMed = MedicationDTO.builder()
                .medicationName("Aspirin")
                .dosage("100mg")
                .frequency("Once daily")
                .durationDays(30)
                .instructions("Take with food")
                .build();

        PrescriptionRequestDTO request = PrescriptionRequestDTO.builder()
                .consultationId(1L)
                .patientId(1L)
                .diagnosis("Preventive care")
                .medications(Arrays.asList(singleMed))
                .build();

        mockMvc.perform(post("/api/v1/prescriptions")
                        .header("X-User-Id", "2")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(username = "doctor@example.com", roles = {"DOCTOR"})
    void testCreatePrescription_MultipleMedications_Success() throws Exception {
        List<MedicationDTO> medications = Arrays.asList(
                MedicationDTO.builder()
                        .medicationName("Med 1")
                        .dosage("100mg")
                        .frequency("Once daily")
                        .durationDays(7)
                        .build(),
                MedicationDTO.builder()
                        .medicationName("Med 2")
                        .dosage("200mg")
                        .frequency("Twice daily")
                        .durationDays(10)
                        .build(),
                MedicationDTO.builder()
                        .medicationName("Med 3")
                        .dosage("50mg")
                        .frequency("Three times daily")
                        .durationDays(5)
                        .build()
        );

        PrescriptionRequestDTO request = PrescriptionRequestDTO.builder()
                .consultationId(1L)
                .patientId(1L)
                .diagnosis("Complex treatment")
                .medications(medications)
                .build();

        mockMvc.perform(post("/api/v1/prescriptions")
                        .header("X-User-Id", "2")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void testGetPatientPrescriptions_AsAdmin_Success() throws Exception {
        mockMvc.perform(get("/api/v1/prescriptions/patient/1")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void testGetPrescriptionById_AsAdmin_Success() throws Exception {
        mockMvc.perform(get("/api/v1/prescriptions/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}