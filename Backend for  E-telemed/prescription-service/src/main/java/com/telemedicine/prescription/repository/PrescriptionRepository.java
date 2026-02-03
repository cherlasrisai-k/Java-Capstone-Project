package com.telemedicine.prescription.repository;

import com.telemedicine.prescription.model.Prescription;
import com.telemedicine.prescription.model.PrescriptionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    Optional<Prescription> findByConsultationId(Long consultationId);

    Page<Prescription> findByPatientId(Long patientId, Pageable pageable);

    Page<Prescription> findByDoctorId(Long doctorId, Pageable pageable);

    Page<Prescription> findByPatientIdAndStatus(Long patientId, PrescriptionStatus status, Pageable pageable);

    Page<Prescription> findByDoctorIdAndStatus(Long doctorId, PrescriptionStatus status, Pageable pageable);
}
