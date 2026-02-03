package com.telemedicine.prescription.service;

import com.telemedicine.common.exception.ResourceNotFoundException;
import com.telemedicine.prescription.dto.PrescriptionDTO;
import com.telemedicine.prescription.dto.PrescriptionRequestDTO;
import com.telemedicine.prescription.model.Medication;
import com.telemedicine.prescription.model.Prescription;
import com.telemedicine.prescription.model.PrescriptionStatus;
import com.telemedicine.prescription.repository.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Slf4j
@Service
@RequiredArgsConstructor
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final DrugInteractionService drugInteractionService;

    @Transactional
    public PrescriptionDTO createPrescription(Long doctorId, PrescriptionRequestDTO request) {
        log.info("Creating prescription for consultation: {} by doctor: {}", request.getConsultationId(), doctorId);

        // Check for drug interactions
        drugInteractionService.checkInteractions(request.getMedications());

        LocalDate validUntil = request.getValidUntil() != null 
                ? request.getValidUntil() 
                : LocalDate.now().plusMonths(3);

        Prescription prescription = Prescription.builder()
                .consultationId(request.getConsultationId())
                .patientId(request.getPatientId())
                .doctorId(doctorId)
                .status(PrescriptionStatus.ACTIVE)
                .prescriptionDate(LocalDate.now())
                .validUntil(validUntil)
                .diagnosis(request.getDiagnosis())
                .generalInstructions(request.getGeneralInstructions())
                .build();

        request.getMedications().forEach(medDto -> {
            Medication medication = Medication.builder()
                    .medicationName(medDto.getMedicationName())
                    .dosage(medDto.getDosage())
                    .frequency(medDto.getFrequency())
                    .durationDays(medDto.getDurationDays())
                    .instructions(medDto.getInstructions())
                    .sideEffects(medDto.getSideEffects())
                    .build();
            prescription.addMedication(medication);
        });

        Prescription saved = prescriptionRepository.save(prescription);
        log.info("Prescription created with ID: {}", saved.getId());

        return PrescriptionDTO.from(saved);
    }

    public PrescriptionDTO getPrescriptionById(Long id) {
        log.info("Fetching prescription by ID: {}", id);
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription", "id", id));
        return PrescriptionDTO.from(prescription);
    }

    public PrescriptionDTO getPrescriptionByConsultationId(Long consultationId) {
        log.info("Fetching prescription by consultation ID: {}", consultationId);
        Prescription prescription = prescriptionRepository.findByConsultationId(consultationId)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription", "consultationId", consultationId));
        return PrescriptionDTO.from(prescription);
    }

    public Page<PrescriptionDTO> getPatientPrescriptions(Long patientId, Pageable pageable) {
        log.info("Fetching prescriptions for patient: {}", patientId);
        return prescriptionRepository.findByPatientId(patientId, pageable)
                .map(PrescriptionDTO::from);
    }

    public Page<PrescriptionDTO> getDoctorPrescriptions(Long doctorId, Pageable pageable) {
        log.info("Fetching prescriptions for doctor: {}", doctorId);
        return prescriptionRepository.findByDoctorId(doctorId, pageable)
                .map(PrescriptionDTO::from);
    }

    @Transactional
    public PrescriptionDTO cancelPrescription(Long id, String reason) {
        log.info("Cancelling prescription: {} with reason: {}", id, reason);
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription", "id", id));

        prescription.setStatus(PrescriptionStatus.CANCELLED);
        Prescription updated = prescriptionRepository.save(prescription);

        return PrescriptionDTO.from(updated);
    }

    @Transactional
    public void updateExpiredPrescriptions() {
        log.info("Updating expired prescriptions");
        LocalDate today = LocalDate.now();
        prescriptionRepository.findAll().forEach(prescription -> {
            if (prescription.getStatus() == PrescriptionStatus.ACTIVE 
                    && prescription.getValidUntil().isBefore(today)) {
                prescription.setStatus(PrescriptionStatus.EXPIRED);
                prescriptionRepository.save(prescription);
            }
        });
    }
}
