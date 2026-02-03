	package com.telemedicine.patient.dto;

import com.telemedicine.patient.model.Doctor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorDTO {

    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String specialization;
    private String licenseNumber;
    private Integer yearsOfExperience;
    private boolean active;
    private int consultationFee;
    private String qualifications;
    private boolean availableForConsultation;

    public static DoctorDTO from(Doctor doctor) {
        return DoctorDTO.builder()
                .id(doctor.getId())
                .email(doctor.getEmail())
                .firstName(doctor.getFirstName())
                .lastName(doctor.getLastName())
                .phoneNumber(doctor.getPhoneNumber())
                .active(doctor.isActive())
                .specialization(doctor.getSpecialization())
                .licenseNumber(doctor.getLicenseNumber())
                .yearsOfExperience(doctor.getYearsOfExperience())
                .consultationFee(doctor.getConsultationFee())
                .qualifications(doctor.getQualifications())
                .availableForConsultation(doctor.isAvailableForConsultation())
                .build();
    }
}