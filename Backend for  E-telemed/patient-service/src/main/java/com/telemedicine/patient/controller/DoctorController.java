package com.telemedicine.patient.controller;

import com.telemedicine.common.dto.ApiResponse;
import com.telemedicine.common.dto.PageResponse;
import com.telemedicine.patient.dto.AuthResponse;
import com.telemedicine.patient.dto.DoctorDTO;
import com.telemedicine.patient.dto.RegisterRequest;
import com.telemedicine.patient.model.Doctor;
import com.telemedicine.patient.model.Role;
import com.telemedicine.patient.service.AuthService;
import com.telemedicine.patient.service.DoctorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/doctors")
@RequiredArgsConstructor
@Tag(name = "Doctors", description = "Doctor management endpoints")
public class DoctorController {

    private final DoctorService doctorService;
    
    private final AuthService authService;
    @GetMapping
    @Operation(summary = "Get all doctors", description = "Get paginated list of all doctors")
    public ResponseEntity<ApiResponse<PageResponse<DoctorDTO>>> getAllDoctors(Pageable pageable) {
        Page<DoctorDTO> doctors = doctorService.getAllDoctors(pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(doctors)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get doctor by ID", description = "Get doctor details by ID")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<DoctorDTO>> getDoctorById(@PathVariable Long id) {
        DoctorDTO doctor = doctorService.getDoctorById(id);
        return ResponseEntity.ok(ApiResponse.success(doctor));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Add new doctor")
    public ResponseEntity<?> addDoctor(@Valid @RequestBody RegisterRequest request) {
        // Force role to DOCTOR if coming from this endpoint

        // Call AuthService for registration
        AuthResponse response = authService.register(request);

        return ResponseEntity.ok(
                ApiResponse.success("Doctor added successfully", response.getUser())
        );
    }
    @GetMapping("/specialization/{specialization}")
    @Operation(summary = "Get doctors by specialization", description = "Get doctors by medical specialization")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<PageResponse<DoctorDTO>>> getDoctorsBySpecialization(
            @PathVariable String specialization,
            Pageable pageable) {
        Page<DoctorDTO> doctors = doctorService.getDoctorsBySpecialization(specialization, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(doctors)));
    }

    @GetMapping("/available")
    @Operation(summary = "Get available doctors", description = "Get doctors available for consultation")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<Page<Doctor>>> getAvailableDoctors(Pageable pageable) {
        Page<Doctor> doctors = doctorService.getAvailableDoctors(pageable);
        return ResponseEntity.ok(ApiResponse.success(doctors));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    @Operation(summary = "Update doctor", description = "Update doctor profile")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<DoctorDTO>> updateDoctor(
            @PathVariable Long id,
            @Valid @RequestBody DoctorDTO doctorDTO) {
        DoctorDTO updated = doctorService.updateDoctor(id, doctorDTO);
        return ResponseEntity.ok(ApiResponse.success("Doctor updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete doctor")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<Void>> deleteDoctor(@PathVariable Long id) {
        doctorService.deleteDoctor(id);
        return ResponseEntity.ok(ApiResponse.success("Doctor deleted successfully", null));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Approve doctor registration")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<ApiResponse<String>> approveDoctor(@PathVariable Long id) {
        String message = doctorService.approveDoctor(id);
        return ResponseEntity.ok(ApiResponse.success("Doctor approved successfully", message));
    }
}