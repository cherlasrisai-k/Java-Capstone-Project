package com.telemedicine.notification.repository;

import com.telemedicine.notification.model.NotificationPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Map;
import java.util.Optional;

@Repository
public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, Long> {
    
    Optional<NotificationPreference> findByPatientId(Long patientId);
}
