package com.telemedicine.healthdata.controller;

import com.telemedicine.common.dto.ApiResponse;
import com.telemedicine.common.dto.PageResponse;
import com.telemedicine.healthdata.dto.HealthDataDTO;
import com.telemedicine.healthdata.dto.HealthRecordResponseDTO;
import com.telemedicine.healthdata.service.HealthDataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/health-data")
@RequiredArgsConstructor
@Tag(name = "Health Data", description = "Health data management endpoints")
@SecurityRequirement(name = "Bearer Authentication")
public class HealthDataController {

    private final HealthDataService healthDataService;

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Upload health data", description = "Upload personal health metrics")
    public ResponseEntity<ApiResponse<HealthRecordResponseDTO>> uploadHealthData(
            @Valid @RequestBody HealthDataDTO healthData,
            HttpServletRequest request) {
        
        // Get userId from JWT token (set by filter)
        Long userId = (Long) request.getAttribute("userId");
        String email = (String) request.getAttribute("email");
        String role = (String) request.getAttribute("role");
        
        log.info("Uploading health data for user: {} (ID: {}, Role: {})", email, userId, role);
        
        if (userId == null) {
            log.error("User ID not found in request attributes");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("User not authenticated"));
        }
        
        HealthRecordResponseDTO record = healthDataService.saveHealthData(userId, healthData);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Health data uploaded successfully", record));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR')")
    @Operation(summary = "Get health data", description = "Get health data for patient with optional date range")
    public ResponseEntity<ApiResponse<PageResponse<HealthRecordResponseDTO>>> getHealthData(
            @RequestParam Long patientId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            Pageable pageable,
            HttpServletRequest request) {
        
        Long requestingUserId = (Long) request.getAttribute("userId");
        String role = (String) request.getAttribute("role");
        
        log.info("Fetching health data for patient: {} by user: {} (Role: {})", 
                patientId, requestingUserId, role);
        
        // Patients can only view their own data
        if ("PATIENT".equals(role) && !requestingUserId.equals(patientId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied: You can only view your own health data"));
        }

        Page<HealthRecordResponseDTO> records = healthDataService.getHealthData(
                patientId, startDate, endDate, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(records)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR')")
    @Operation(summary = "Get health record by ID", description = "Get specific health record details")
    public ResponseEntity<ApiResponse<HealthRecordResponseDTO>> getHealthDataById(
            @PathVariable Long id,
            HttpServletRequest request) {
        
        Long requestingUserId = (Long) request.getAttribute("userId");
        String role = (String) request.getAttribute("role");
        
        HealthRecordResponseDTO record = healthDataService.getHealthDataById(id);
        
        // Patients can only view their own data
        if ("PATIENT".equals(role) && !requestingUserId.equals(record.getPatientId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied: You can only view your own health data"));
        }
        
        return ResponseEntity.ok(ApiResponse.success(record));
    }

    @GetMapping("/latest")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR')")
    @Operation(summary = "Get latest health data", description = "Get latest N health records for patient")
    public ResponseEntity<ApiResponse<List<HealthRecordResponseDTO>>> getLatestHealthData(
            @RequestParam Long patientId,
            @RequestParam(defaultValue = "5") int limit,
            HttpServletRequest request) {
        
        Long requestingUserId = (Long) request.getAttribute("userId");
        String role = (String) request.getAttribute("role");
        
        // Patients can only view their own data
        if ("PATIENT".equals(role) && !requestingUserId.equals(patientId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied: You can only view your own health data"));
        }
        
        List<HealthRecordResponseDTO> records = healthDataService.getLatestHealthData(patientId, limit);
        return ResponseEntity.ok(ApiResponse.success(records));
    }
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Update health record", description = "Update existing health data for a patient")
    public ResponseEntity<ApiResponse<HealthRecordResponseDTO>> updateHealthData(
            @PathVariable Long id,
            @Valid @RequestBody HealthDataDTO healthData,
            HttpServletRequest request) {

        Long userId = (Long) request.getAttribute("userId");
        String role = (String) request.getAttribute("role");

        log.info("Updating health data for record ID: {} by user: {} (Role: {})", id, userId, role);

        if (userId == null) {
            log.error("User ID not found in request attributes");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("User not authenticated"));
        }

        // Fetch the existing record
        HealthRecordResponseDTO existingRecord = healthDataService.getHealthDataById(id);

        // Ensure the patient owns this record
        if (!userId.equals(existingRecord.getPatientId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied: You can only update your own health data"));
        }

        // Perform update
        HealthRecordResponseDTO updatedRecord = healthDataService.updateHealthData(id, healthData);

        return ResponseEntity.ok(ApiResponse.success("Health data updated successfully", updatedRecord));
    }
}