package com.telemedicine.notification.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "notification_preferences")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long patientId;

    @ElementCollection
    @MapKeyColumn(name = "preference_key")
    @Column(name = "preference_value", nullable = false)
    @CollectionTable(
        name = "patient_notification_preferences",
        joinColumns = @JoinColumn(name = "notification_preference_id")
    )
    private Map<String, Boolean> preferences;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}