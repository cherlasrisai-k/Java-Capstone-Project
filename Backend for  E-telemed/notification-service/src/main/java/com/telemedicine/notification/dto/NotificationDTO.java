package com.telemedicine.notification.dto;

import com.telemedicine.notification.model.Notification;
import com.telemedicine.notification.model.NotificationStatus;
import com.telemedicine.notification.model.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {

    private Long id;
    private Long userId;
    private NotificationType type;
    private NotificationStatus status;
    private String subject;
    private String message;
    private String recipient;
    private String errorMessage;
    private LocalDateTime sentAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime readAt;
    private String referenceType;
    private Long referenceId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static NotificationDTO from(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .userId(notification.getUserId())
                .type(notification.getType())
                .status(notification.getStatus())
                .subject(notification.getSubject())
                .message(notification.getMessage())
                .recipient(notification.getRecipient())
                .errorMessage(notification.getErrorMessage())
                .sentAt(notification.getSentAt())
                .deliveredAt(notification.getDeliveredAt())
                .readAt(notification.getReadAt())
                .referenceType(notification.getReferenceType())
                .referenceId(notification.getReferenceId())
                .createdAt(notification.getCreatedAt())
                .updatedAt(notification.getUpdatedAt())
                .build();
    }
}