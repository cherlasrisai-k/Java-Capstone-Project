package com.telemedicine.patient.controller;

import com.telemedicine.common.dto.ApiResponse;
import com.telemedicine.common.dto.PageResponse;
import com.telemedicine.patient.dto.AuthResponse;
import com.telemedicine.patient.dto.ChangePasswordRequest;
import com.telemedicine.patient.dto.PatientDTO;
import com.telemedicine.patient.dto.RegisterRequest;
import com.telemedicine.patient.model.Role;
import com.telemedicine.patient.service.AuthService;
import com.telemedicine.patient.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/patients")
@RequiredArgsConstructor
@Tag(name = "Patients", description = "Patient management endpoints")
@SecurityRequirement(name = "Bearer Authentication")
public class PatientController {

    private final PatientService patientService;
    private final AuthService authService;

    @GetMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    @Operation(summary = "Get all patients")
    public ResponseEntity<ApiResponse<PageResponse<PatientDTO>>> getAllPatients(Pageable pageable) {
        var patients = patientService.getAllPatients(pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(patients)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    @Operation(summary = "Get patient by ID")
    public ResponseEntity<ApiResponse<PatientDTO>> getPatientById(@PathVariable Long id) {
        var patient = patientService.getPatientById(id);
        return ResponseEntity.ok(ApiResponse.success(patient));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Add new patient")
    public ResponseEntity<?> addPatient(@Valid @RequestBody RegisterRequest request) {
        request.setRole(Role.PATIENT);
        request.setPassword(request.getDateOfBirth());
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Patient added successfully", response.getUser()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT','ADMIN')")
    @Operation(summary = "Update patient profile")
    public ResponseEntity<ApiResponse<PatientDTO>> updatePatient(
            @PathVariable Long id, 
            @Valid @RequestBody PatientDTO patientDTO) {
        var updatedPatient = patientService.updatePatient(id, patientDTO);
        return ResponseEntity.ok(ApiResponse.success("Patient updated successfully", updatedPatient));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Approve patient registration")
    public ResponseEntity<ApiResponse<String>> approvePatient(@PathVariable Long id) {
        patientService.activatePatient(id);
        return ResponseEntity.ok(ApiResponse.success("Patient approved successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete patient")
    public ResponseEntity<ApiResponse<Void>> deletePatient(@PathVariable Long id) {
        patientService.deletePatient(id);
        return ResponseEntity.ok(ApiResponse.success("Patient deleted successfully"));
    }

    @PostMapping("/{id}/change-password")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Change patient password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @PathVariable Long id, @Valid @RequestBody ChangePasswordRequest request) {
        patientService.changePassword(id, request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
    }

    @GetMapping("/current")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Get current authenticated patient")
    public ResponseEntity<ApiResponse<PatientDTO>> getCurrentPatient() {
        var patient = patientService.getCurrentPatient();
        return ResponseEntity.ok(ApiResponse.success(patient));
    }
}