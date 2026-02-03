package com.telemedicine.healthdata.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "health_records")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long patientId;

    @Column(nullable = false)
    private LocalDateTime recordedAt;

    // Blood Pressure
    private Integer systolic;
    private Integer diastolic;

    // Other Vitals
    private Integer heartRate;  // bpm
    private Double temperature; // Celsius
    private Integer oxygenSaturation; // percent SpO2
    private Double weight; // kg
    private Double height; // cm

    @Column(length = 1000)
    private String notes;

    @OneToMany(mappedBy = "healthRecord", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Symptom> symptoms = new ArrayList<>();

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public void addSymptom(Symptom symptom) {
        symptoms.add(symptom);
        symptom.setHealthRecord(this);
    }

    public void removeSymptom(Symptom symptom) {
        symptoms.remove(symptom);
        symptom.setHealthRecord(null);
    }
}
