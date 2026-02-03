package com.telemedicine.patient.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "patients")
@PrimaryKeyJoinColumn(name = "user_id")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Builder
public class Patient extends User {

    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private String bloodGroup;

    @Embedded
    private Address address;

    private String emergencyContactName;
    private String emergencyContactPhone;

    public enum Gender {
        MALE, FEMALE, OTHER
    }

}