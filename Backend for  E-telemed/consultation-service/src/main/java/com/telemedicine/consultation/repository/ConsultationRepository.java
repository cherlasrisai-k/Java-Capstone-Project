package com.telemedicine.consultation.repository;

import com.telemedicine.consultation.model.Consultation;
import com.telemedicine.consultation.model.ConsultationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConsultationRepository extends JpaRepository<Consultation, Long> {

    Optional<Consultation> findByAppointmentId(Long appointmentId);

    Page<Consultation> findByPatientId(Long patientId, Pageable pageable);

    Page<Consultation> findByDoctorId(Long doctorId, Pageable pageable);

    Page<Consultation> findByPatientIdAndStatus(Long patientId, ConsultationStatus status, Pageable pageable);

    Page<Consultation> findByDoctorIdAndStatus(Long doctorId, ConsultationStatus status, Pageable pageable);
}
