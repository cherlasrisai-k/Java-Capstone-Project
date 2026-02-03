package com.telemedicine.notification.dto;

import com.telemedicine.notification.model.NotificationType;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequestDTO {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Notification type is required")
    private NotificationType type;

    @NotBlank(message = "Subject is required")
    @Size(max = 200, message = "Subject must not exceed 200 characters")
    private String subject;

    @NotBlank(message = "Message is required")
    @Size(max = 2000, message = "Message must not exceed 2000 characters")
    private String message;

    @NotBlank(message = "Recipient is required")
    @Size(max = 100, message = "Recipient must not exceed 100 characters")
    private String recipient;

    @Size(max = 50, message = "Reference type must not exceed 50 characters")
    private String referenceType;

    private Long referenceId;
}
