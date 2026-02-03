package com.telemedicine.consultation.controller;

import com.telemedicine.common.dto.ApiResponse;
import com.telemedicine.common.dto.PageResponse;
import com.telemedicine.consultation.dto.AppointmentDTO;
import com.telemedicine.consultation.dto.AppointmentRequestDTO;
import com.telemedicine.consultation.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
@Tag(name = "Appointments", description = "Appointment scheduling and management")
@SecurityRequirement(name = "Bearer Authentication")
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Create appointment", description = "Schedule a new appointment with a doctor")
    public ResponseEntity<ApiResponse<AppointmentDTO>> createAppointment(
            @Valid @RequestBody AppointmentRequestDTO request,
            @RequestHeader("X-User-Id") Long patientId) {
        AppointmentDTO appointment = appointmentService.createAppointment(patientId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Appointment created successfully", appointment));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    @Operation(summary = "Get patient appointments", description = "Get all appointments for a patient")
    public ResponseEntity<ApiResponse<PageResponse<AppointmentDTO>>> getPatientAppointments(
            @PathVariable Long patientId,
            Pageable pageable) {
        Page<AppointmentDTO> appointments = appointmentService.getPatientAppointments(patientId, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(appointments)));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    @Operation(summary = "Get doctor appointments", description = "Get all appointments for a doctor")
    public ResponseEntity<ApiResponse<PageResponse<AppointmentDTO>>> getDoctorAppointments(
            @PathVariable Long doctorId,
            Pageable pageable) {
        Page<AppointmentDTO> appointments = appointmentService.getDoctorAppointments(doctorId, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(appointments)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    @Operation(summary = "Get appointment by ID", description = "Get appointment details")
    public ResponseEntity<ApiResponse<AppointmentDTO>> getAppointmentById(@PathVariable Long id) {
        AppointmentDTO appointment = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(ApiResponse.success(appointment));
    }

    @PutMapping("/{id}/confirm")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Confirm appointment", description = "Doctor confirms the appointment")
    public ResponseEntity<ApiResponse<AppointmentDTO>> confirmAppointment(@PathVariable Long id) {
        AppointmentDTO appointment = appointmentService.confirmAppointment(id);
        return ResponseEntity.ok(ApiResponse.success("Appointment confirmed", appointment));
    }

    // ✅ CANCEL APPOINTMENT ENDPOINT (Already exists - perfect for frontend!)
    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR')")
    @Operation(summary = "Cancel appointment", description = "Cancel an appointment with reason")
    public ResponseEntity<ApiResponse<AppointmentDTO>> cancelAppointment(
            @PathVariable Long id,
            @RequestParam String reason) {
        AppointmentDTO appointment = appointmentService.cancelAppointment(id, reason);
        return ResponseEntity.ok(ApiResponse.success("Appointment cancelled", appointment));
    }

    @PutMapping("/{id}/reschedule")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR')")
    @Operation(summary = "Reschedule appointment", description = "Change appointment date")
    public ResponseEntity<ApiResponse<AppointmentDTO>> rescheduleAppointment(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime newDate) {
        AppointmentDTO appointment = appointmentService.rescheduleAppointment(id, newDate);
        return ResponseEntity.ok(ApiResponse.success("Appointment rescheduled", appointment));
    }
}