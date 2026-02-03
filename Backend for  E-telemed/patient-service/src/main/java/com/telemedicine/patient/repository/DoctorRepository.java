package com.telemedicine.patient.repository;

import com.telemedicine.patient.model.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    
    Optional<Doctor> findByEmail(String email);
    
    boolean existsByEmail(String email);
    Page<Doctor> findBySpecialization(String specialization, Pageable pageable);
    
    Page<Doctor> findByAvailableForConsultationTrue(Pageable pageable);
    
    boolean existsByLicenseNumber(String licenseNumber);
} 