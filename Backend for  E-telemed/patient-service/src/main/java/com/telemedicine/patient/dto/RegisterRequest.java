package com.telemedicine.patient.dto;

import com.telemedicine.patient.model.Role;
import com.telemedicine.patient.model.Patient.Gender;
import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @JsonAlias({"username"})  // Accept "username" in JSON
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotNull(message = "Role is required")
    private Role role;

    // PATIENT fields
    private String phoneNumber;
    private String dateOfBirth;
    private Gender gender;
    private String bloodGroup;
    private AddressDTO address;
    private String emergencyContactName;
    private String emergencyContactPhone;

    // DOCTOR fields
    private String specialization;
    private String licenseNumber;
    private Integer yearsOfExperience;
    private int consultationFee;
    private String qualifications;
    private AddressDTO clinicAddress;
}