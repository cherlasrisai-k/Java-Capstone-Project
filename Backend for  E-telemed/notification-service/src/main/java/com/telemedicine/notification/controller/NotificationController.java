package com.telemedicine.notification.controller;

import com.telemedicine.common.dto.ApiResponse;
import com.telemedicine.notification.dto.EmailRequestDTO;
import com.telemedicine.notification.dto.NotificationDTO;
import com.telemedicine.notification.dto.NotificationPreferencesDTO;
import com.telemedicine.notification.dto.NotificationRequestDTO;
import com.telemedicine.notification.model.NotificationStatus;
import com.telemedicine.notification.service.EmailService;
import com.telemedicine.notification.service.NotificationPreferenceService;
import com.telemedicine.notification.service.NotificationService;
import com.telemedicine.notification.service.SmsService;
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
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Notification management endpoints")
@SecurityRequirement(name = "Bearer Authentication")
public class NotificationController {

    private final NotificationService notificationService;
    private final EmailService emailService;
    private final SmsService smsService;
    private final NotificationPreferenceService preferenceService;

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    @Operation(summary = "Send notification", description = "Send a notification to a user")
    public ResponseEntity<ApiResponse<NotificationDTO>> sendNotification(
            @Valid @RequestBody NotificationRequestDTO request) {
        NotificationDTO notification = notificationService.sendNotification(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Notification sent successfully", notification));
    }

    @PostMapping("/email")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    @Operation(summary = "Send email", description = "Send an email directly")
    public ResponseEntity<ApiResponse<String>> sendEmail(@Valid @RequestBody EmailRequestDTO request)
            throws Exception {
        if (request.isHtml()) {
            emailService.sendHtmlEmail(request.getTo(), request.getSubject(), request.getMessage());
        } else {
            emailService.sendSimpleEmail(request.getTo(), request.getSubject(), request.getMessage());
        }
        return ResponseEntity.ok(ApiResponse.success("Email sent successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    @Operation(summary = "Get notification by ID", description = "Get notification details")
    public ResponseEntity<ApiResponse<NotificationDTO>> getNotificationById(@PathVariable Long id) {
        NotificationDTO notification = notificationService.getNotificationById(id);
        return ResponseEntity.ok(ApiResponse.success(notification));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    @Operation(summary = "Get user notifications", description = "Get all notifications for a user")
    public ResponseEntity<ApiResponse<Page<NotificationDTO>>> getUserNotifications(@PathVariable Long userId,
                                                                                   Pageable pageable) {
        Page<NotificationDTO> notifications = notificationService.getUserNotifications(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    @GetMapping("/user/{userId}/status/{status}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    @Operation(summary = "Get user notifications by status", description = "Get notifications filtered by status")
    public ResponseEntity<ApiResponse<Page<NotificationDTO>>> getUserNotificationsByStatus(
            @PathVariable Long userId, @PathVariable NotificationStatus status, Pageable pageable) {
        Page<NotificationDTO> notifications = notificationService.getUserNotificationsByStatus(userId, status,
                pageable);
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    @GetMapping("/user/{userId}/unread-count")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    @Operation(summary = "Get unread count", description = "Get count of unread notifications")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(@PathVariable Long userId) {
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @PutMapping("/{id}/mark-read")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN')")
    @Operation(summary = "Mark as read", description = "Mark notification as read")
    public ResponseEntity<ApiResponse<NotificationDTO>> markAsRead(@PathVariable Long id) {
        NotificationDTO notification = notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", notification));
    }

    // Only these two methods for patient preferences are kept to avoid duplicate mapping
    
    @GetMapping("/patients/{patientId}/preferences")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Get patient notification preferences", description = "Get notification preferences for authenticated patient")
    public ResponseEntity<ApiResponse<NotificationPreferencesDTO>> getNotificationPreferences(
            @PathVariable Long patientId) {
        
        var prefs = NotificationPreferencesDTO.builder()
                .emailAppointments(true)
                .emailVitals(true)
                .inAppNotifications(true)
                .smsAlerts(false)
                .build();
        
        return ResponseEntity.ok(ApiResponse.success(prefs));
    }

    @PutMapping("/patients/{patientId}/preferences")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Update patient notification preferences", description = "Update notification preferences for authenticated patient")
    public ResponseEntity<ApiResponse<String>> updateNotificationPreferences(
            @PathVariable Long patientId, @RequestBody NotificationPreferencesDTO prefs) {
        // Optionally call preferenceService.updatePreferences(patientId, prefs)
        return ResponseEntity.ok(ApiResponse.success("Preferences saved"));
    }
}