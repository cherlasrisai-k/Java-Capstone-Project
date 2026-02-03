package com.telemedicine.healthdata.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SymptomDTO {

    @NotBlank(message = "Symptom description is required")
    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @NotNull(message = "Severity is required")
    @Min(value = 1, message = "Severity must be at least 1")
    @Max(value = 10, message = "Severity must not exceed 10")
    private Integer severity;

    private LocalDateTime onset;
}
