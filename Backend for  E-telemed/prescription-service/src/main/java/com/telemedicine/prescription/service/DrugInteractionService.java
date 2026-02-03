package com.telemedicine.prescription.service;

import com.telemedicine.prescription.dto.MedicationDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class DrugInteractionService {

    public void checkInteractions(List<MedicationDTO> medications) {
        log.info("Checking drug interactions for {} medications", medications.size());
        
        // Basic interaction check (in production, integrate with drug interaction API)
        for (int i = 0; i < medications.size(); i++) {
            for (int j = i + 1; j < medications.size(); j++) {
                String med1 = medications.get(i).getMedicationName().toLowerCase();
                String med2 = medications.get(j).getMedicationName().toLowerCase();
                
                // Example: Check for known dangerous combinations
                if (hasKnownInteraction(med1, med2)) {
                    log.warn("Potential drug interaction detected: {} and {}", med1, med2);
                    // In production: throw exception or return warnings
                }
            }
        }
    }

    private boolean hasKnownInteraction(String med1, String med2) {
        // Simplified example - in production, use comprehensive drug database
        return (med1.contains("warfarin") && med2.contains("aspirin")) ||
               (med1.contains("aspirin") && med2.contains("ibuprofen"));
    }
}
