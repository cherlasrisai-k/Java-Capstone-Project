package com.telemedicine.consultation.service;

import com.telemedicine.common.exception.ResourceNotFoundException;
import com.telemedicine.consultation.dto.ConsultationDTO;
import com.telemedicine.consultation.model.Appointment;
import com.telemedicine.consultation.model.AppointmentStatus;
import com.telemedicine.consultation.model.Consultation;
import com.telemedicine.consultation.model.ConsultationStatus;
import com.telemedicine.consultation.repository.AppointmentRepository;
import com.telemedicine.consultation.repository.ConsultationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final AppointmentRepository appointmentRepository;

    @Transactional
    public ConsultationDTO startConsultation(Long appointmentId, String chiefComplaint) {
        log.info("Starting consultation for appointment: {}", appointmentId);

        // ✅ VALIDATE APPOINTMENT STATUS
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));

        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new IllegalStateException("Appointment must be confirmed before starting consultation");
        }

        // ✅ TIME CHECK - Cannot start before appointment time
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(appointment.getAppointmentDate())) {
            throw new IllegalStateException(
                String.format("Consultation cannot be started before appointment start time. " +
                    "Scheduled: %s, Current: %s", 
                    appointment.getAppointmentDate(), now)
            );
        }

        // ✅ PREVENT DUPLICATE CONSULTATIONS
        if (consultationRepository.findByAppointmentId(appointmentId).isPresent()) {
            throw new IllegalStateException("Consultation already exists for this appointment");
        }

        Consultation consultation = Consultation.builder()
                .appointmentId(appointmentId)
                .patientId(appointment.getPatientId())
                .doctorId(appointment.getDoctorId())
                .status(ConsultationStatus.IN_PROGRESS)
                .startTime(LocalDateTime.now())
                .chiefComplaint(chiefComplaint)
                .build();

        Consultation saved = consultationRepository.save(consultation);
        log.info("✅ Consultation started with ID: {}", saved.getId());

        return ConsultationDTO.from(saved);
    }

    @Transactional
    public ConsultationDTO completeConsultation(Long id, ConsultationDTO updates) {
        log.info("Completing consultation: {}", id);

        Consultation consultation = consultationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation", "id", id));

        if (consultation.getStatus() != ConsultationStatus.IN_PROGRESS) {
            throw new IllegalStateException("Only in-progress consultations can be completed");
        }

        consultation.setStatus(ConsultationStatus.COMPLETED);
        consultation.setEndTime(LocalDateTime.now());
        consultation.setDiagnosis(updates.getDiagnosis());
        consultation.setTreatment(updates.getTreatment());
        consultation.setNotes(updates.getNotes());
        consultation.setFollowUpInstructions(updates.getFollowUpInstructions());

        Consultation updated = consultationRepository.save(consultation);

        // Update appointment status
        Appointment appointment = appointmentRepository.findById(consultation.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", consultation.getAppointmentId()));
        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(appointment);

        log.info("✅ Consultation completed: {}", id);
        return ConsultationDTO.from(updated);
    }

    public ConsultationDTO getConsultationById(Long id) {
        log.info("Fetching consultation by ID: {}", id);
        Consultation consultation = consultationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation", "id", id));
        return ConsultationDTO.from(consultation);
    }

    public ConsultationDTO getConsultationByAppointmentId(Long appointmentId) {
        log.info("Fetching consultation by appointment ID: {}", appointmentId);
        Consultation consultation = consultationRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation", "appointmentId", appointmentId));
        return ConsultationDTO.from(consultation);
    }

    public Page<ConsultationDTO> getPatientConsultations(Long patientId, Pageable pageable) {
        log.info("Fetching consultations for patient: {}", patientId);
        return consultationRepository.findByPatientId(patientId, pageable)
                .map(ConsultationDTO::from);
    }

    public Page<ConsultationDTO> getDoctorConsultations(Long doctorId, Pageable pageable) {
        log.info("Fetching consultations for doctor: {}", doctorId);
        return consultationRepository.findByDoctorId(doctorId, pageable)
                .map(ConsultationDTO::from);
    }

    @Transactional
    public ConsultationDTO updateConsultationNotes(Long id, String notes) {
        log.info("Updating consultation notes: {}", id);
        Consultation consultation = consultationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation", "id", id));

        consultation.setNotes(notes);
        Consultation updated = consultationRepository.save(consultation);

        return ConsultationDTO.from(updated);
    }
}