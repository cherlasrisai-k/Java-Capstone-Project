package com.telemedicine.consultation.controller;

import com.telemedicine.common.dto.ApiResponse;
import com.telemedicine.common.dto.PageResponse;
import com.telemedicine.consultation.dto.ConsultationDTO;
import com.telemedicine.consultation.service.ConsultationService;
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
@RequestMapping("/api/v1/consultations")
@RequiredArgsConstructor
@Tag(name = "Consultations", description = "Consultation management endpoints")
@SecurityRequirement(name = "Bearer Authentication")
public class ConsultationController {

    private final ConsultationService consultationService;

    @PostMapping("/start")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Start consultation", description = "Start a consultation for an appointment")
    public ResponseEntity<ApiResponse<ConsultationDTO>> startConsultation(
            @RequestParam Long appointmentId,
            @RequestParam String chiefComplaint) {
        ConsultationDTO consultation = consultationService.startConsultation(appointmentId, chiefComplaint);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Consultation started", consultation));
    }
    
    @PutMapping("/{id}/complete")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Complete consultation", description = "Complete and finalize consultation with diagnosis")
    public ResponseEntity<ApiResponse<ConsultationDTO>> completeConsultation(
            @PathVariable Long id,
            @Valid @RequestBody ConsultationDTO updates) {
        ConsultationDTO consultation = consultationService.completeConsultation(id, updates);
        return ResponseEntity.ok(ApiResponse.success("Consultation completed", consultation));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    @Operation(summary = "Get consultation by ID", description = "Get consultation details")
    public ResponseEntity<ApiResponse<ConsultationDTO>> getConsultationById(@PathVariable Long id) {
        ConsultationDTO consultation = consultationService.getConsultationById(id);
        return ResponseEntity.ok(ApiResponse.success(consultation));
    }

    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    @Operation(summary = "Get consultation by appointment", description = "Get consultation for specific appointment")
    public ResponseEntity<ApiResponse<ConsultationDTO>> getConsultationByAppointmentId(
            @PathVariable Long appointmentId) {
        ConsultationDTO consultation = consultationService.getConsultationByAppointmentId(appointmentId);
        return ResponseEntity.ok(ApiResponse.success(consultation));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    @Operation(summary = "Get patient consultations", description = "Get all consultations for a patient")
    public ResponseEntity<ApiResponse<PageResponse<ConsultationDTO>>> getPatientConsultations(
            @PathVariable Long patientId,
            Pageable pageable) {
        Page<ConsultationDTO> consultations = consultationService.getPatientConsultations(patientId, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(consultations)));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get doctor consultations", description = "Get all consultations for a doctor")
    public ResponseEntity<ApiResponse<PageResponse<ConsultationDTO>>> getDoctorConsultations(
            @PathVariable Long doctorId,
            Pageable pageable) {
        Page<ConsultationDTO> consultations = consultationService.getDoctorConsultations(doctorId, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(consultations)));
    }

    @PutMapping("/{id}/notes")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Update consultation notes", description = "Update notes for ongoing consultation")
    public ResponseEntity<ApiResponse<ConsultationDTO>> updateConsultationNotes(
            @PathVariable Long id,
            @RequestParam String notes) {
        ConsultationDTO consultation = consultationService.updateConsultationNotes(id, notes);
        return ResponseEntity.ok(ApiResponse.success("Notes updated", consultation));
    }
}