package com.telemedicine.patient;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.telemedicine.common.dto.PageResponse;
import com.telemedicine.patient.dto.*;
import com.telemedicine.patient.model.Role;
import com.telemedicine.patient.service.AuthService;
import com.telemedicine.patient.service.DoctorService;
import com.telemedicine.common.security.JwtService;
import com.telemedicine.patient.service.PatientService;
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
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = com.telemedicine.patient.PatientServiceApplication.class)
@AutoConfigureMockMvc
public class PatientServiceApplicationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private DoctorService doctorService;

    @MockBean
    private PatientService patientService;

    private RegisterRequest patient;
    private RegisterRequest doctor;
    private RegisterRequest admin;

    private AuthResponse patientAuth;
    private AuthResponse doctorAuth;
    private AuthResponse adminAuth;

    @BeforeEach
    void setUp() {
        // --- Test Users ---
        patient = RegisterRequest.builder()
                .email("patient@example.com")
                .password("Patient123!")
                .firstName("Alice")
                .lastName("Patient")
                .role(Role.PATIENT)
                .build();

        doctor = RegisterRequest.builder()
                .email("doctor@example.com")
                .password("Doctor123!")
                .firstName("Bob")
                .lastName("Doctor")
                .role(Role.DOCTOR)
                .specialization("Cardiology")
                .licenseNumber("MED-001")
                .yearsOfExperience(5)
                .build();

        admin = RegisterRequest.builder()
                .email("admin@example.com")
                .password("Admin123!")
                .firstName("Charlie")
                .lastName("Admin")
                .role(Role.ADMIN)
                .build();

        // --- Mock AuthResponses ---
        patientAuth = buildAuthResponse(patient, 1L);
        doctorAuth = buildAuthResponse(doctor, 2L);
        adminAuth = buildAuthResponse(admin, 3L);

        // --- Mock AuthService ---
        Mockito.when(authService.register(any(RegisterRequest.class))).thenReturn(patientAuth);
        Mockito.when(authService.login(any())).thenReturn(patientAuth);
        Mockito.when(authService.refreshToken(anyString())).thenReturn(patientAuth);

        // --- Mock JwtService ---
        UserDetails mockUser = User.withUsername("patient@example.com")
                .password("password")
                .roles("PATIENT").build();
        Mockito.when(jwtService.isTokenValid(anyString(), any(UserDetails.class))).thenReturn(true);
        Mockito.when(jwtService.extractUserId(anyString())).thenReturn(1L);
        Mockito.when(jwtService.extractRole(anyString())).thenReturn("PATIENT");

        // --- Mock DoctorService ---
        Page<DoctorDTO> emptyDoctorPage = new PageImpl<>(Collections.emptyList(), PageRequest.of(0, 10), 0);
        Mockito.when(doctorService.getAllDoctors(any())).thenReturn(emptyDoctorPage);
        //Mockito.when(doctorService.getAvailableDoctors(any())).thenReturn(emptyDoctorPage);
        Mockito.when(doctorService.getDoctorsBySpecialization(anyString(), any())).thenReturn(emptyDoctorPage);
        Mockito.when(doctorService.getDoctorById(anyLong())).thenReturn(new DoctorDTO());
        Mockito.when(doctorService.updateDoctor(anyLong(), any())).thenReturn(new DoctorDTO());

        // --- Mock PatientService ---
        Page<PatientDTO> emptyPatientPage = new PageImpl<>(Collections.emptyList(), PageRequest.of(0, 10), 0);
        Mockito.when(patientService.getAllPatients(any())).thenReturn(emptyPatientPage);
        Mockito.when(patientService.getPatientById(anyLong())).thenReturn(new PatientDTO());
        Mockito.when(patientService.updatePatient(anyLong(), any())).thenReturn(new PatientDTO());
        Mockito.doNothing().when(patientService).deletePatient(anyLong());
    }

    private AuthResponse buildAuthResponse(RegisterRequest user, Long id) {
        UserDTO dto = UserDTO.builder()
                .id(id)
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .active(true)
                .build();

        return AuthResponse.builder()
                .accessToken("mockAccessToken")
                .refreshToken("mockRefreshToken")
                .user(dto)
                .build();
    }

    // ---------------- AUTH TESTS ----------------
    @Test
    void testRegisterLoginRefresh() throws Exception {
        // Register
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(patient)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.accessToken").value("mockAccessToken"));

        // Login
        LoginRequest loginRequest = new LoginRequest(patient.getEmail(), patient.getPassword());
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").value("mockAccessToken"));

        // Refresh
        mockMvc.perform(post("/auth/refresh")
                        .param("refreshToken", "anyRefreshToken"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").value("mockAccessToken"));
    }

    // ---------------- DOCTOR TESTS ----------------
    @Test
    @WithMockUser(username = "doctor@example.com", roles = {"DOCTOR"})
    void testDoctorEndpoints() throws Exception {
        mockMvc.perform(get("/doctors").param("page","0").param("size","10"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/doctors/specialization/Cardiology").param("page","0").param("size","10"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/doctors/1"))
                .andExpect(status().isOk());

        DoctorDTO dto = new DoctorDTO();
        dto.setFirstName("UpdatedDoctor");
        mockMvc.perform(put("/doctors/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());
    }

    // ---------------- PATIENT TESTS ----------------
    @Test
    @WithMockUser(username = "doctor@example.com", roles = {"DOCTOR"})
    void testPatientEndpointsDoctorRole() throws Exception {
        mockMvc.perform(get("/patients").param("page","0").param("size","10"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/patients/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "patient@example.com", roles = {"PATIENT"})
    void testPatientEndpointsEdgeCases() throws Exception {
        // Patient trying to GET all patients -> forbidden
        mockMvc.perform(get("/patients").param("page","0").param("size","10"))
                .andExpect(status().isForbidden());

        // Patient updating their own profile
        PatientDTO update = new PatientDTO();
        update.setFirstName("NewName");
        mockMvc.perform(put("/patients/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk());

        // Patient trying to delete -> forbidden
        mockMvc.perform(delete("/patients/1"))
                .andExpect(status().isForbidden());
    }

    // ---------------- ADMIN TESTS ----------------
    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void testAdminEndpoints() throws Exception {
        mockMvc.perform(get("/patients").param("page","0").param("size","10"))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/patients/1"))
                .andExpect(status().isOk());
    }
}
