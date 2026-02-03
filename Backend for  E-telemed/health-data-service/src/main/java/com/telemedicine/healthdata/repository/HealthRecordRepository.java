package com.telemedicine.healthdata.repository;

import com.telemedicine.healthdata.model.HealthRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface HealthRecordRepository extends JpaRepository<HealthRecord, Long> {

    Page<HealthRecord> findByPatientId(Long patientId, Pageable pageable);

    Page<HealthRecord> findByPatientIdAndRecordedAtBetween(
            Long patientId,
            LocalDateTime start,
            LocalDateTime end,
            Pageable pageable
    );

    @Query("SELECT hr FROM HealthRecord hr WHERE hr.patientId = :patientId ORDER BY hr.recordedAt DESC")
    List<HealthRecord> findLatestByPatientId(@Param("patientId") Long patientId, Pageable pageable);
}
