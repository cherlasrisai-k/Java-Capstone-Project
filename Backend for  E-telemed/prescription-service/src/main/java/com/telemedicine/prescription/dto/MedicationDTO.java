package com.telemedicine.prescription.dto;

import com.telemedicine.prescription.model.Medication;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicationDTO {

    private Long id;

    @NotBlank(message = "Medication name is required")
    @Size(max = 200, message = "Medication name must not exceed 200 characters")
    private String medicationName;

    @NotBlank(message = "Dosage is required")
    @Size(max = 100, message = "Dosage must not exceed 100 characters")
    private String dosage;

    @NotBlank(message = "Frequency is required")
    @Size(max = 100, message = "Frequency must not exceed 100 characters")
    private String frequency;

    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1 day")
    @Max(value = 365, message = "Duration must not exceed 365 days")
    private Integer durationDays;

    @Size(max = 500, message = "Instructions must not exceed 500 characters")
    private String instructions;

    @Size(max = 500, message = "Side effects must not exceed 500 characters")
    private String sideEffects;

    public static MedicationDTO from(Medication medication) {
        return MedicationDTO.builder()
                .id(medication.getId())
                .medicationName(medication.getMedicationName())
                .dosage(medication.getDosage())
                .frequency(medication.getFrequency())
                .durationDays(medication.getDurationDays())
                .instructions(medication.getInstructions())
                .sideEffects(medication.getSideEffects())
                .build();
    }
}