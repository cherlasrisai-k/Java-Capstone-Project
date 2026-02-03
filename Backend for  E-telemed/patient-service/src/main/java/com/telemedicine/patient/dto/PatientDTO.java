package com.telemedicine.patient.dto;

import com.telemedicine.patient.model.Patient;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientDTO {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String dateOfBirth;
    private String gender;
    private String bloodGroup;
    private boolean active;
    private String emergencyContactName;
    private String emergencyContactPhone;

    public static PatientDTO from(Patient patient) {
        if (patient == null) return null;
        
        PatientDTO dto = new PatientDTO();
        dto.setId(patient.getId());
        dto.setEmail(patient.getEmail());
        dto.setFirstName(patient.getFirstName());
        dto.setLastName(patient.getLastName());
        dto.setPhoneNumber(patient.getPhoneNumber());
        dto.setDateOfBirth(patient.getDateOfBirth() != null ? patient.getDateOfBirth().toString() : null);
        dto.setGender(patient.getGender() != null ? patient.getGender().name() : null);
        dto.setBloodGroup(patient.getBloodGroup());
        dto.setActive(patient.isActive());
        dto.setEmergencyContactName(patient.getEmergencyContactName());
        dto.setEmergencyContactPhone(patient.getEmergencyContactPhone());
        return dto;
    }
}