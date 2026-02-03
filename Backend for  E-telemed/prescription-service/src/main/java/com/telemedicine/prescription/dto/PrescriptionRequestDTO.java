package com.telemedicine.prescription.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionRequestDTO {

    @NotNull(message = "Consultation ID is required")
    private Long consultationId;

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @Future(message = "Valid until date must be in the future")
    private LocalDate validUntil;

    @NotBlank(message = "Diagnosis is required")
    @Size(max = 1000, message = "Diagnosis must not exceed 1000 characters")
    private String diagnosis;

    @Size(max = 1000, message = "General instructions must not exceed 1000 characters")
    private String generalInstructions;

    @NotEmpty(message = "At least one medication is required")
    @Valid
    private List<MedicationDTO> medications;
}
