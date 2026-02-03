package com.telemedicine.healthdata.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "symptoms")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Symptom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "health_record_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private HealthRecord healthRecord;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(nullable = false)
    private Integer severity; // 1 to 10 scale

    private LocalDateTime onset;
}
