package com.telemedicine.patient.service;

import com.telemedicine.common.exception.ResourceNotFoundException;
import com.telemedicine.patient.dto.PatientDTO;
import com.telemedicine.patient.model.Patient;
import com.telemedicine.patient.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Slf4j
@Service
@RequiredArgsConstructor
public class PatientService {
    
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;
    
    public Page<PatientDTO> getAllPatients(Pageable pageable) {
        log.info("Fetching all patients");
        return patientRepository.findAll(pageable).map(PatientDTO::from);
    }

    @Transactional
    public PatientDTO addPatient(PatientDTO patientDTO) {
        if (patientRepository.existsByEmail(patientDTO.getEmail())) {
            throw new RuntimeException("Patient with email " + patientDTO.getEmail() + " already exists");
        }

        Patient patient = new Patient();
        patient.setFirstName(patientDTO.getFirstName());
        patient.setLastName(patientDTO.getLastName());
        patient.setEmail(patientDTO.getEmail());
        patient.setPhoneNumber(patientDTO.getPhoneNumber());
        if (patientDTO.getDateOfBirth() != null) {
            patient.setDateOfBirth(LocalDate.parse(patientDTO.getDateOfBirth()));
        }
        patient.setGender(patientDTO.getGender() != null ? Patient.Gender.valueOf(patientDTO.getGender()) : null);
        patient.setBloodGroup(patientDTO.getBloodGroup());
        patient.setEmergencyContactName(patientDTO.getEmergencyContactName());
        patient.setEmergencyContactPhone(patientDTO.getEmergencyContactPhone());
        patient.setActive(false);

        Patient savedPatient = patientRepository.save(patient);
        log.info("New patient added: {} ({})", savedPatient.getId(), savedPatient.getEmail());
        return PatientDTO.from(savedPatient);
    }

    public PatientDTO getPatientById(Long id) {
        log.info("Fetching patient with ID: {}", id);
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));
        return PatientDTO.from(patient);
    }
    
    @Transactional
    public PatientDTO updatePatient(Long id, PatientDTO patientDTO) {
        log.info("Updating patient with ID: {}, data: {}", id, patientDTO);
        
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));
        
        // ✅ Safe null/empty checks for ALL frontend fields
        if (patientDTO.getFirstName() != null && !patientDTO.getFirstName().trim().isEmpty()) {
            patient.setFirstName(patientDTO.getFirstName().trim());
        }
        if (patientDTO.getLastName() != null && !patientDTO.getLastName().trim().isEmpty()) {
            patient.setLastName(patientDTO.getLastName().trim());
        }
        if (patientDTO.getEmail() != null && !patientDTO.getEmail().trim().isEmpty()) {
            // ✅ Email uniqueness check
            if (!patientDTO.getEmail().equals(patient.getEmail()) && 
                patientRepository.existsByEmail(patientDTO.getEmail().trim())) {
                throw new RuntimeException("Email already exists");
            }
            patient.setEmail(patientDTO.getEmail().trim());
        }
        if (patientDTO.getPhoneNumber() != null && !patientDTO.getPhoneNumber().trim().isEmpty()) {
            patient.setPhoneNumber(patientDTO.getPhoneNumber().trim());
        }
        if (patientDTO.getDateOfBirth() != null && !patientDTO.getDateOfBirth().trim().isEmpty()) {
            try {
                patient.setDateOfBirth(LocalDate.parse(patientDTO.getDateOfBirth().trim()));
            } catch (Exception e) {
                log.warn("Invalid date format: {}", patientDTO.getDateOfBirth());
            }
        }
        if (patientDTO.getEmergencyContactName() != null) {
            patient.setEmergencyContactName(patientDTO.getEmergencyContactName().trim());
        }
        if (patientDTO.getEmergencyContactPhone() != null) {
            patient.setEmergencyContactPhone(patientDTO.getEmergencyContactPhone().trim());
        }
        
        Patient savedPatient = patientRepository.save(patient);
        log.info("Patient {} updated successfully", id);
        return PatientDTO.from(savedPatient);
    }
    
    @Transactional
    public void deletePatient(Long id) {
        log.info("Deleting patient with ID: {}", id);
        if (!patientRepository.existsById(id)) {
            throw new ResourceNotFoundException("Patient", "id", id);
        }
        patientRepository.deleteById(id);
        log.info("Patient deleted successfully: {}", id);
    }

    @Transactional
    public void activatePatient(Long id) {
        log.info("Activating patient with ID: {}", id);
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));
        patient.setActive(true);
        patientRepository.save(patient);
        log.info("Patient activated successfully: {}", id);
    }

    @Transactional
    public void changePassword(Long patientId, String currentPassword, String newPassword) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", patientId));
        
        if (!passwordEncoder.matches(currentPassword, patient.getPassword())) {
            throw new BadCredentialsException("Current password is incorrect");
        }
        
        patient.setPassword(passwordEncoder.encode(newPassword));
        patientRepository.save(patient);
        log.info("Password changed successfully for patient: {}", patientId);
    }

    public PatientDTO getCurrentPatient() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        
        Patient patient = patientRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "email", email));
        
        return PatientDTO.from(patient);
    }
}