package com.telemedicine.consultation.service;

import com.telemedicine.common.exception.ResourceNotFoundException;
import com.telemedicine.consultation.dto.AppointmentDTO;
import com.telemedicine.consultation.dto.AppointmentRequestDTO;
import com.telemedicine.consultation.model.Appointment;
import com.telemedicine.consultation.model.AppointmentStatus;
import com.telemedicine.consultation.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;

    @Transactional
    public AppointmentDTO createAppointment(Long patientId, AppointmentRequestDTO request) {
        log.info("Creating appointment for patient: {} with doctor: {}", patientId, request.getDoctorId());

        // ✅ TIME CONFLICT CHECK - Prevent overlapping appointments
        LocalDateTime appointmentEnd = request.getAppointmentDate().plusMinutes(request.getDurationMinutes());
        
        try {
            List<Appointment> conflicts = appointmentRepository.findDoctorAppointmentsBetween(
                    request.getDoctorId(),
                    request.getAppointmentDate(),
                    appointmentEnd
            );
            
            if (!conflicts.isEmpty()) {
                log.warn("Time conflicts found for doctor {}: {} appointments", request.getDoctorId(), conflicts.size());
                throw new IllegalStateException("Doctor is not available at the requested time");
            }
        } catch (Exception e) {
            log.error("Conflict check failed for doctor {}: {}", request.getDoctorId(), e.getMessage());
            throw new IllegalStateException("Unable to verify doctor availability");
        }

        Appointment appointment = Appointment.builder()
                .patientId(patientId)
                .doctorId(request.getDoctorId())
                .appointmentDate(request.getAppointmentDate())
                .durationMinutes(request.getDurationMinutes())
                .status(AppointmentStatus.PENDING)
                .reason(request.getReason())
                .notes(request.getNotes())
                .build();

        Appointment saved = appointmentRepository.save(appointment);
        log.info("✅ Appointment created successfully with ID: {}", saved.getId());

        return AppointmentDTO.from(saved);
    }

    public Page<AppointmentDTO> getPatientAppointments(Long patientId, Pageable pageable) {
        log.info("Fetching appointments for patient: {}", patientId);
        return appointmentRepository.findByPatientId(patientId, pageable)
                .map(AppointmentDTO::from);
    }

    public Page<AppointmentDTO> getDoctorAppointments(Long doctorId, Pageable pageable) {
        log.info("Fetching appointments for doctor: {}", doctorId);
        return appointmentRepository.findByDoctorId(doctorId, pageable)
                .map(AppointmentDTO::from);
    }

    public AppointmentDTO getAppointmentById(Long id) {
        log.info("Fetching appointment by ID: {}", id);
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));
        return AppointmentDTO.from(appointment);
    }

    @Transactional
    public AppointmentDTO confirmAppointment(Long id) {
        log.info("Confirming appointment: {}", id);
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));

        appointment.setStatus(AppointmentStatus.CONFIRMED);
        Appointment updated = appointmentRepository.save(appointment);

        return AppointmentDTO.from(updated);
    }

    @Transactional
    public AppointmentDTO cancelAppointment(Long id, String reason) {
        log.info("Cancelling appointment: {} with reason: {}", id, reason);
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancellationReason(reason);
        Appointment updated = appointmentRepository.save(appointment);

        return AppointmentDTO.from(updated);
    }

    @Transactional
    public AppointmentDTO rescheduleAppointment(Long id, LocalDateTime newDate) {
        log.info("Rescheduling appointment: {} to {}", id, newDate);
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));

        appointment.setAppointmentDate(newDate);
        appointment.setStatus(AppointmentStatus.RESCHEDULED);
        Appointment updated = appointmentRepository.save(appointment);

        return AppointmentDTO.from(updated);
    }
}