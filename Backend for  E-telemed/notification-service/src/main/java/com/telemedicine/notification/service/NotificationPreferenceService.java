package com.telemedicine.notification.service;

import com.telemedicine.common.exception.ResourceNotFoundException;
import com.telemedicine.notification.model.NotificationPreference;
import com.telemedicine.notification.repository.NotificationPreferenceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationPreferenceService {

    private final NotificationPreferenceRepository preferenceRepository;

    @Transactional
    public Map<String, Boolean> updatePreferences(Long patientId, Map<String, Boolean> preferences) {
        log.info("Updating notification preferences for patient: {}", patientId);
        
        validatePreferences(preferences);
        
        return preferenceRepository.findByPatientId(patientId)
            .map(pref -> {
                pref.setPreferences(preferences);
                return saveAndReturn(preferenceRepository.save(pref)).getPreferences();
            })
            .orElseGet(() -> {
                NotificationPreference newPref = NotificationPreference.builder()
                    .patientId(patientId)
                    .preferences(preferences)
                    .build();
                return saveAndReturn(preferenceRepository.save(newPref)).getPreferences();
            });
    }

    public Map<String, Boolean> getPreferences(Long patientId) {
        log.info("Fetching notification preferences for patient: {}", patientId);
        return preferenceRepository.findByPatientId(patientId)
            .map(NotificationPreference::getPreferences)
            .orElseGet(() -> Map.of(
                "emailAppointments", true,
                "emailVitals", true,
                "inAppNotifications", true,
                "smsAlerts", false
            ));
    }

    private NotificationPreference saveAndReturn(NotificationPreference preference) {
        return preferenceRepository.save(preference);
    }

    private void validatePreferences(Map<String, Boolean> preferences) {
        String[] requiredKeys = {
            "emailAppointments", "emailVitals", 
            "inAppNotifications", "smsAlerts"
        };
        
        for (String key : requiredKeys) {
            if (!preferences.containsKey(key)) {
                throw new IllegalArgumentException("Missing required preference: " + key);
            }
        }
    }
    
}
