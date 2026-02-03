package com.telemedicine.consultation.repository;

import com.telemedicine.consultation.model.Appointment;
import com.telemedicine.consultation.model.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    Page<Appointment> findByPatientId(Long patientId, Pageable pageable);

    Page<Appointment> findByDoctorId(Long doctorId, Pageable pageable);

    Page<Appointment> findByPatientIdAndStatus(Long patientId, AppointmentStatus status, Pageable pageable);

    Page<Appointment> findByDoctorIdAndStatus(Long doctorId, AppointmentStatus status, Pageable pageable);

    @Query("SELECT a FROM Appointment a WHERE a.doctorId = :doctorId " +
           "AND a.appointmentDate BETWEEN :start AND :end " +
           "AND a.status NOT IN ('CANCELLED', 'COMPLETED')")
    List<Appointment> findDoctorAppointmentsBetween(
            @Param("doctorId") Long doctorId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    List<Appointment> findByPatientIdAndAppointmentDateAfter(Long patientId, LocalDateTime date);
}
