package com.telemedicine.prescription.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "medications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Medication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Prescription prescription;

    @Column(nullable = false, length = 200)
    private String medicationName;

    @Column(nullable = false, length = 100)
    private String dosage;

    @Column(nullable = false, length = 100)
    private String frequency;

    @Column(nullable = false)
    private Integer durationDays;

    @Column(length = 500)
    private String instructions;

    @Column(length = 500)
    private String sideEffects;
}