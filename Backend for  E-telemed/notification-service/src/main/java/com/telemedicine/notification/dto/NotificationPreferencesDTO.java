package com.telemedicine.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class NotificationPreferencesDTO {
 private boolean emailAppointments;
 private boolean emailVitals;
 private boolean inAppNotifications;
 private boolean smsAlerts;
}
