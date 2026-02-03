package com.telemedicine.consultation.dto;

import com.telemedicine.consultation.model.Consultation;
import com.telemedicine.consultation.model.ConsultationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationDTO {

    private Long id;
    private Long appointmentId;
    private Long patientId;
    private Long doctorId;
    private ConsultationStatus status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String chiefComplaint;
    private String diagnosis;
    private String treatment;
    private String notes;
    private String followUpInstructions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ConsultationDTO from(Consultation consultation) {
        return ConsultationDTO.builder()
                .id(consultation.getId())
                .appointmentId(consultation.getAppointmentId())
                .patientId(consultation.getPatientId())
                .doctorId(consultation.getDoctorId())
                .status(consultation.getStatus())
                .startTime(consultation.getStartTime())
                .endTime(consultation.getEndTime())
                .chiefComplaint(consultation.getChiefComplaint())
                .diagnosis(consultation.getDiagnosis())
                .treatment(consultation.getTreatment())
                .notes(consultation.getNotes())
                .followUpInstructions(consultation.getFollowUpInstructions())
                .createdAt(consultation.getCreatedAt())
                .updatedAt(consultation.getUpdatedAt())
                .build();
    }
}
