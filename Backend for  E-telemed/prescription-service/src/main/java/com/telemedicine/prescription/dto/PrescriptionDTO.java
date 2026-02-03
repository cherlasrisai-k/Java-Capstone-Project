package com.telemedicine.prescription.dto;

import com.telemedicine.prescription.model.Prescription;
import com.telemedicine.prescription.model.PrescriptionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionDTO {

    private Long id;
    private Long consultationId;
    private Long patientId;
    private Long doctorId;
    private PrescriptionStatus status;
    private LocalDate prescriptionDate;
    private LocalDate validUntil;
    private String diagnosis;
    private String generalInstructions;
    private List<MedicationDTO> medications;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static PrescriptionDTO from(Prescription prescription) {
        return PrescriptionDTO.builder()
                .id(prescription.getId())
                .consultationId(prescription.getConsultationId())
                .patientId(prescription.getPatientId())
                .doctorId(prescription.getDoctorId())
                .status(prescription.getStatus())
                .prescriptionDate(prescription.getPrescriptionDate())
                .validUntil(prescription.getValidUntil())
                .diagnosis(prescription.getDiagnosis())
                .generalInstructions(prescription.getGeneralInstructions())
                .medications(prescription.getMedications().stream()
                        .map(MedicationDTO::from)
                        .collect(Collectors.toList()))
                .createdAt(prescription.getCreatedAt())
                .updatedAt(prescription.getUpdatedAt())
                .build();
    }
}
