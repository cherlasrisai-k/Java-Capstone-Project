package com.telemedicine.prescription.controller;

import com.telemedicine.common.dto.ApiResponse;
import com.telemedicine.common.dto.PageResponse;
import com.telemedicine.prescription.dto.PrescriptionDTO;
import com.telemedicine.prescription.dto.PrescriptionRequestDTO;
import com.telemedicine.prescription.service.PrescriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/prescriptions")
@RequiredArgsConstructor
@Tag(name = "Prescriptions", description = "Prescription management endpoints")
@SecurityRequirement(name = "Bearer Authentication")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Create prescription", description = "Create a new prescription for a patient")
    public ResponseEntity<ApiResponse<PrescriptionDTO>> createPrescription(
            @Valid @RequestBody PrescriptionRequestDTO request,
            @RequestHeader("X-User-Id") Long doctorId) {
        PrescriptionDTO prescription = prescriptionService.createPrescription(doctorId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Prescription created successfully", prescription));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    @Operation(summary = "Get prescription by ID", description = "Get prescription details")
    public ResponseEntity<ApiResponse<PrescriptionDTO>> getPrescriptionById(@PathVariable Long id) {
        PrescriptionDTO prescription = prescriptionService.getPrescriptionById(id);
        return ResponseEntity.ok(ApiResponse.success(prescription));
    }

    @GetMapping("/consultation/{consultationId}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    @Operation(summary = "Get prescription by consultation", description = "Get prescription for specific consultation")
    public ResponseEntity<ApiResponse<PrescriptionDTO>> getPrescriptionByConsultationId(
            @PathVariable Long consultationId) {
        PrescriptionDTO prescription = prescriptionService.getPrescriptionByConsultationId(consultationId);
        return ResponseEntity.ok(ApiResponse.success(prescription));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    @Operation(summary = "Get patient prescriptions", description = "Get all prescriptions for a patient")
    public ResponseEntity<ApiResponse<PageResponse<PrescriptionDTO>>> getPatientPrescriptions(
            @PathVariable Long patientId,
            Pageable pageable) {
        Page<PrescriptionDTO> prescriptions = prescriptionService.getPatientPrescriptions(patientId, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(prescriptions)));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get doctor prescriptions", description = "Get all prescriptions created by a doctor")
    public ResponseEntity<ApiResponse<PageResponse<PrescriptionDTO>>> getDoctorPrescriptions(
            @PathVariable Long doctorId,
            Pageable pageable) {
        Page<PrescriptionDTO> prescriptions = prescriptionService.getDoctorPrescriptions(doctorId, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(prescriptions)));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Cancel prescription", description = "Cancel an active prescription")
    public ResponseEntity<ApiResponse<PrescriptionDTO>> cancelPrescription(
            @PathVariable Long id,
            @RequestParam String reason) {
        PrescriptionDTO prescription = prescriptionService.cancelPrescription(id, reason);
        return ResponseEntity.ok(ApiResponse.success("Prescription cancelled", prescription));
    }
}
