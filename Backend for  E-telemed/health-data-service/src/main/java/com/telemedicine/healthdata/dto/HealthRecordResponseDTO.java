package com.telemedicine.healthdata.dto;

import com.telemedicine.healthdata.model.HealthRecord;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HealthRecordResponseDTO {

    private Long id;
    private Long patientId;
    private LocalDateTime recordedAt;
    private Integer systolic;
    private Integer diastolic;
    private Integer heartRate;
    private Double temperature;
    private Integer oxygenSaturation;
    private Double weight;
    private Double height;
    private String notes;
    private List<SymptomDTO> symptoms;
    private LocalDateTime createdAt;

    public static HealthRecordResponseDTO from(HealthRecord record) {
        return HealthRecordResponseDTO.builder()
                .id(record.getId())
                .patientId(record.getPatientId())
                .recordedAt(record.getRecordedAt())
                .systolic(record.getSystolic())
                .diastolic(record.getDiastolic())
                .heartRate(record.getHeartRate())
                .temperature(record.getTemperature())
                .oxygenSaturation(record.getOxygenSaturation())
                .weight(record.getWeight())
                .height(record.getHeight())
                .notes(record.getNotes())
                .symptoms(record.getSymptoms().stream()
                        .map(s -> SymptomDTO.builder()
                                .description(s.getDescription())
                                .severity(s.getSeverity())
                                .onset(s.getOnset())
                                .build())
                        .collect(Collectors.toList()))
                .createdAt(record.getCreatedAt())
                .build();
    }
}
