package com.telemedicine.healthdata;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.telemedicine.healthdata.dto.HealthDataDTO;
import com.telemedicine.healthdata.dto.HealthRecordResponseDTO;
import com.telemedicine.healthdata.dto.SymptomDTO;
import com.telemedicine.healthdata.service.HealthDataService;
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
 * Comprehensive integration tests for Health Data Service
 * Tests health data upload, retrieval, and authorization
 */
@SpringBootTest(classes = HealthDataServiceApplication.class)
@AutoConfigureMockMvc
public class HealthDataServiceIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private HealthDataService healthDataService;

    private HealthDataDTO sampleHealthData;
    private HealthRecordResponseDTO sampleHealthRecord;
    private List<HealthRecordResponseDTO> sampleHealthRecordList;

    @BeforeEach
    void setUp() {
        // ===== Setup Sample Symptom =====
        SymptomDTO symptom1 = SymptomDTO.builder()
                .description("Mild headache")
                .severity(3)
                .onset(LocalDateTime.now().minusHours(2))
                .build();

        SymptomDTO symptom2 = SymptomDTO.builder()
                .description("Fatigue")
                .severity(5)
                .onset(LocalDateTime.now().minusDays(1))
                .build();

        // ===== Setup Sample Health Data DTO =====
        sampleHealthData = HealthDataDTO.builder()
                .systolic(120)
                .diastolic(80)
                .heartRate(72)
                .temperature(37.2)
                .oxygenSaturation(98)
                .weight(70.5)
                .height(175.0)
                .notes("Feeling healthy today")
                .symptoms(Arrays.asList(symptom1))
                .build();

        // ===== Setup Sample Health Record Response =====
        sampleHealthRecord = HealthRecordResponseDTO.builder()
                .id(1L)
                .patientId(1L)
                .recordedAt(LocalDateTime.now())
                .systolic(120)
                .diastolic(80)
                .heartRate(72)
                .temperature(37.2)
                .oxygenSaturation(98)
                .weight(70.5)
                .height(175.0)
                .notes("Feeling healthy today")
                .symptoms(Arrays.asList(symptom1))
                .createdAt(LocalDateTime.now())
                .build();

        HealthRecordResponseDTO record2 = HealthRecordResponseDTO.builder()
                .id(2L)
                .patientId(1L)
                .recordedAt(LocalDateTime.now().minusDays(1))
                .systolic(125)
                .diastolic(82)
                .heartRate(75)
                .temperature(37.0)
                .oxygenSaturation(97)
                .weight(70.3)
                .height(175.0)
                .notes("Slight elevation in BP")
                .symptoms(Arrays.asList(symptom2))
                .createdAt(LocalDateTime.now().minusDays(1))
                .build();

        sampleHealthRecordList = Arrays.asList(sampleHealthRecord, record2);

        // ===== Mock HealthDataService =====
        Mockito.when(healthDataService.saveHealthData(anyLong(), any(HealthDataDTO.class)))
                .thenReturn(sampleHealthRecord);

        Page<HealthRecordResponseDTO> healthRecordPage = new PageImpl<>(
                sampleHealthRecordList, PageRequest.of(0, 10), 2);

        Mockito.when(healthDataService.getHealthData(anyLong(), any(), any(), any()))
                .thenReturn(healthRecordPage);

        Mockito.when(healthDataService.getHealthDataById(anyLong()))
                .thenReturn(sampleHealthRecord);

        Mockito.when(healthDataService.getLatestHealthData(anyLong(), anyInt()))
                .thenReturn(sampleHealthRecordList);
    }

    // ================== HEALTH DATA UPLOAD TESTS ==================

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testUploadHealthData_AsPatient_Success() throws Exception {
        mockMvc.perform(post("/api/v1/health-data")
                        .header("X-User-Id", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleHealthData)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.patientId").value(1))
                .andExpect(jsonPath("$.data.systolic").value(120))
                .andExpect(jsonPath("$.data.diastolic").value(80))
                .andExpect(jsonPath("$.data.heartRate").value(72))
                .andExpect(jsonPath("$.data.temperature").value(37.2))
                .andExpect(jsonPath("$.data.oxygenSaturation").value(98));
    }

    @Test
    void testUploadHealthData_Unauthenticated_Forbidden() throws Exception {
        mockMvc.perform(post("/api/v1/health-data")
                        .header("X-User-Id", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleHealthData)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "doctor@example.com", roles = {"DOCTOR"})
    void testUploadHealthData_AsDoctor_Forbidden() throws Exception {
        mockMvc.perform(post("/api/v1/health-data")
                        .header("X-User-Id", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleHealthData)))
                .andExpect(status().isForbidden());
    }

    // ================== HEALTH DATA RETRIEVAL TESTS ==================

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testGetHealthData_AsPatient_Success() throws Exception {
        mockMvc.perform(get("/api/v1/health-data")
                        .param("patientId", "1")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.content", hasSize(2)))
                .andExpect(jsonPath("$.data.totalElements").value(2))
                .andExpect(jsonPath("$.data.content[0].systolic").value(120))
                .andExpect(jsonPath("$.data.content[1].systolic").value(125));
    }

    @Test
    @WithMockUser(username = "doctor@example.com", roles = {"DOCTOR"})
    void testGetHealthData_AsDoctor_Success() throws Exception {
        mockMvc.perform(get("/api/v1/health-data")
                        .param("patientId", "1")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content", hasSize(2)));
    }

    @Test
    void testGetHealthData_Unauthenticated_Forbidden() throws Exception {
        mockMvc.perform(get("/api/v1/health-data")
                        .param("patientId", "1")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testGetHealthDataWithDateRange_Success() throws Exception {
        String startDate = LocalDateTime.now().minusDays(7).toString();
        String endDate = LocalDateTime.now().toString();

        mockMvc.perform(get("/api/v1/health-data")
                        .param("patientId", "1")
                        .param("startDate", startDate)
                        .param("endDate", endDate)
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray());
    }

    // ================== GET HEALTH DATA BY ID TESTS ==================

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testGetHealthDataById_AsPatient_Success() throws Exception {
        mockMvc.perform(get("/api/v1/health-data/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.patientId").value(1))
                .andExpect(jsonPath("$.data.systolic").value(120))
                .andExpect(jsonPath("$.data.symptoms").isArray())
                .andExpect(jsonPath("$.data.symptoms", hasSize(1)));
    }

    @Test
    @WithMockUser(username = "doctor@example.com", roles = {"DOCTOR"})
    void testGetHealthDataById_AsDoctor_Success() throws Exception {
        mockMvc.perform(get("/api/v1/health-data/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1));
    }

    @Test
    void testGetHealthDataById_Unauthenticated_Forbidden() throws Exception {
        mockMvc.perform(get("/api/v1/health-data/1"))
                .andExpect(status().isForbidden());
    }

    // ================== GET LATEST HEALTH DATA TESTS ==================

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testGetLatestHealthData_Success() throws Exception {
        mockMvc.perform(get("/api/v1/health-data/latest")
                        .param("patientId", "1")
                        .param("limit", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[0].id").value(1))
                .andExpect(jsonPath("$.data[1].id").value(2));
    }

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testGetLatestHealthData_DefaultLimit_Success() throws Exception {
        mockMvc.perform(get("/api/v1/health-data/latest")
                        .param("patientId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @WithMockUser(username = "doctor@example.com", roles = {"DOCTOR"})
    void testGetLatestHealthData_AsDoctor_Success() throws Exception {
        mockMvc.perform(get("/api/v1/health-data/latest")
                        .param("patientId", "1")
                        .param("limit", "3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    // ================== VALIDATION TESTS ==================

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testUploadHealthData_InvalidSystolic_BadRequest() throws Exception {
        HealthDataDTO invalidData = HealthDataDTO.builder()
                .systolic(250)  // Too high
                .diastolic(80)
                .heartRate(72)
                .temperature(37.2)
                .oxygenSaturation(98)
                .build();

        mockMvc.perform(post("/api/v1/health-data")
                        .header("X-User-Id", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidData)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testUploadHealthData_InvalidHeartRate_BadRequest() throws Exception {
        HealthDataDTO invalidData = HealthDataDTO.builder()
                .systolic(120)
                .diastolic(80)
                .heartRate(250)  // Too high
                .temperature(37.2)
                .oxygenSaturation(98)
                .build();

        mockMvc.perform(post("/api/v1/health-data")
                        .header("X-User-Id", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidData)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testUploadHealthData_InvalidTemperature_BadRequest() throws Exception {
        HealthDataDTO invalidData = HealthDataDTO.builder()
                .systolic(120)
                .diastolic(80)
                .heartRate(72)
                .temperature(45.0)  // Too high
                .oxygenSaturation(98)
                .build();

        mockMvc.perform(post("/api/v1/health-data")
                        .header("X-User-Id", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidData)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testUploadHealthData_InvalidOxygenSaturation_BadRequest() throws Exception {
        HealthDataDTO invalidData = HealthDataDTO.builder()
                .systolic(120)
                .diastolic(80)
                .heartRate(72)
                .temperature(37.2)
                .oxygenSaturation(105)  // Too high
                .build();

        mockMvc.perform(post("/api/v1/health-data")
                        .header("X-User-Id", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidData)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testUploadHealthData_TooManySymptoms_BadRequest() throws Exception {
        // Create 11 symptoms (more than max 10)
        List<SymptomDTO> tooManySymptoms = Arrays.asList(
                new SymptomDTO("Symptom 1", 1, LocalDateTime.now()),
                new SymptomDTO("Symptom 2", 2, LocalDateTime.now()),
                new SymptomDTO("Symptom 3", 3, LocalDateTime.now()),
                new SymptomDTO("Symptom 4", 4, LocalDateTime.now()),
                new SymptomDTO("Symptom 5", 5, LocalDateTime.now()),
                new SymptomDTO("Symptom 6", 6, LocalDateTime.now()),
                new SymptomDTO("Symptom 7", 7, LocalDateTime.now()),
                new SymptomDTO("Symptom 8", 8, LocalDateTime.now()),
                new SymptomDTO("Symptom 9", 9, LocalDateTime.now()),
                new SymptomDTO("Symptom 10", 10, LocalDateTime.now()),
                new SymptomDTO("Symptom 11", 10, LocalDateTime.now())
        );

        HealthDataDTO invalidData = HealthDataDTO.builder()
                .systolic(120)
                .diastolic(80)
                .heartRate(72)
                .temperature(37.2)
                .oxygenSaturation(98)
                .symptoms(tooManySymptoms)
                .build();

        mockMvc.perform(post("/api/v1/health-data")
                        .header("X-User-Id", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidData)))
                .andExpect(status().isBadRequest());
    }

    // ================== EDGE CASE TESTS ==================

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testUploadHealthData_MinimalData_Success() throws Exception {
        HealthDataDTO minimalData = HealthDataDTO.builder()
                .systolic(120)
                .diastolic(80)
                .heartRate(72)
                .build();

        mockMvc.perform(post("/api/v1/health-data")
                        .header("X-User-Id", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(minimalData)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testUploadHealthData_WithNotesAndSymptoms_Success() throws Exception {
        SymptomDTO symptom = SymptomDTO.builder()
                .description("Severe chest pain")
                .severity(9)
                .onset(LocalDateTime.now())
                .build();

        HealthDataDTO fullData = HealthDataDTO.builder()
                .systolic(150)
                .diastolic(95)
                .heartRate(95)
                .temperature(38.5)
                .oxygenSaturation(94)
                .weight(72.0)
                .height(175.0)
                .notes("Experiencing discomfort, seeking immediate attention")
                .symptoms(Arrays.asList(symptom))
                .build();

        mockMvc.perform(post("/api/v1/health-data")
                        .header("X-User-Id", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(fullData)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.symptoms", hasSize(1)))
                .andExpect(jsonPath("$.data.symptoms[0].description").value("Mild headache"));
    }

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testGetHealthData_NoRecordsFound_EmptyList() throws Exception {
        Page<HealthRecordResponseDTO> emptyPage = new PageImpl<>(
                Arrays.asList(), PageRequest.of(0, 10), 0);

        Mockito.when(healthDataService.getHealthData(anyLong(), any(), any(), any()))
                .thenReturn(emptyPage);

        mockMvc.perform(get("/api/v1/health-data")
                        .param("patientId", "999")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isEmpty())
                .andExpect(jsonPath("$.data.totalElements").value(0));
    }
}