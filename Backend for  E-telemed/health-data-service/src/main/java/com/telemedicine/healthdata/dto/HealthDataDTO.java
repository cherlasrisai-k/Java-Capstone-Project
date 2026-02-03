package com.telemedicine.healthdata.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthDataDTO {

    @Min(value = 70, message = "Systolic must be at least 70")
    @Max(value = 200, message = "Systolic must not exceed 200")
    private Integer systolic;

    @Min(value = 40, message = "Diastolic must be at least 40")
    @Max(value = 130, message = "Diastolic must not exceed 130")
    private Integer diastolic;

    @Min(value = 30, message = "Heart rate must be at least 30 bpm")
    @Max(value = 220, message = "Heart rate must not exceed 220 bpm")
    private Integer heartRate;

    @DecimalMin(value = "35.0", message = "Temperature must be at least 35°C")
    @DecimalMax(value = "42.0", message = "Temperature must not exceed 42°C")
    private Double temperature;

    @Min(value = 70, message = "Oxygen saturation must be at least 70%")
    @Max(value = 100, message = "Oxygen saturation must not exceed 100%")
    private Integer oxygenSaturation;

    @Positive(message = "Weight must be positive")
    private Double weight;

    @Positive(message = "Height must be positive")
    private Double height;

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;

    @Size(max = 10, message = "Maximum 10 symptoms allowed")
    private List<SymptomDTO> symptoms;
}
