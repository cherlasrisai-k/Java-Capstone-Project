package com.telemedicine.healthdata.service;

import com.telemedicine.common.exception.ResourceNotFoundException;
import com.telemedicine.healthdata.dto.HealthDataDTO;
import com.telemedicine.healthdata.dto.HealthRecordResponseDTO;
import com.telemedicine.healthdata.model.HealthRecord;
import com.telemedicine.healthdata.model.Symptom;
import com.telemedicine.healthdata.repository.HealthRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class HealthDataService {

    private final HealthRecordRepository healthRecordRepository;

    @Transactional
    public HealthRecordResponseDTO saveHealthData(Long patientId, HealthDataDTO data) {
        log.info("Saving health data for patient: {}", patientId);

        HealthRecord record = HealthRecord.builder()
                .patientId(patientId)
                .recordedAt(LocalDateTime.now())
                .systolic(data.getSystolic())
                .diastolic(data.getDiastolic())
                .heartRate(data.getHeartRate())
                .temperature(data.getTemperature())
                .oxygenSaturation(data.getOxygenSaturation())
                .weight(data.getWeight())
                .height(data.getHeight())
                .notes(data.getNotes())
                .build();

        if (data.getSymptoms() != null) {
            data.getSymptoms().forEach(symptomDTO -> {
                Symptom symptom = Symptom.builder()
                        .description(symptomDTO.getDescription())
                        .severity(symptomDTO.getSeverity())
                        .onset(symptomDTO.getOnset() != null ? symptomDTO.getOnset() : LocalDateTime.now())
                        .build();
                record.addSymptom(symptom);
            });
        }

        HealthRecord saved = healthRecordRepository.save(record);
        log.info("Health data saved with ID: {}", saved.getId());

        return HealthRecordResponseDTO.from(saved);
    }

    public Page<HealthRecordResponseDTO> getHealthData(Long patientId,
                                                        LocalDateTime start,
                                                        LocalDateTime end,
                                                        Pageable pageable) {
        log.info("Fetching health data for patient: {} from {} to {}", patientId, start, end);

        Page<HealthRecord> records;
        if (start != null && end != null) {
            records = healthRecordRepository.findByPatientIdAndRecordedAtBetween(
                    patientId, start, end, pageable);
        } else {
            records = healthRecordRepository.findByPatientId(patientId, pageable);
        }

        return records.map(HealthRecordResponseDTO::from);
    }

    public HealthRecordResponseDTO getHealthDataById(Long id) {
        log.info("Fetching health data by ID: {}", id);
        HealthRecord record = healthRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Health Record", "id", id));
        return HealthRecordResponseDTO.from(record);
    }

    public List<HealthRecordResponseDTO> getLatestHealthData(Long patientId, int limit) {
        log.info("Fetching latest {} health records for patient: {}", limit, patientId);
        List<HealthRecord> records = healthRecordRepository.findLatestByPatientId(
                patientId, PageRequest.of(0, limit));
        return records.stream()
                .map(HealthRecordResponseDTO::from)
                .collect(Collectors.toList());
    }
    @Transactional
    public HealthRecordResponseDTO updateHealthData(Long id, HealthDataDTO data) {
        log.info("Updating health data for record ID: {}", id);

        HealthRecord record = healthRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Health Record", "id", id));

        // Update fields
        record.setSystolic(data.getSystolic());
        record.setDiastolic(data.getDiastolic());
        record.setHeartRate(data.getHeartRate());
        record.setTemperature(data.getTemperature());
        record.setOxygenSaturation(data.getOxygenSaturation());
        record.setWeight(data.getWeight());
        record.setHeight(data.getHeight());
        record.setNotes(data.getNotes());

        // Update symptoms
        record.getSymptoms().clear(); // remove existing symptoms
        if (data.getSymptoms() != null) {
            data.getSymptoms().forEach(symptomDTO -> {
                Symptom symptom = Symptom.builder()
                        .description(symptomDTO.getDescription())
                        .severity(symptomDTO.getSeverity())
                        .onset(symptomDTO.getOnset() != null ? symptomDTO.getOnset() : LocalDateTime.now())
                        .build();
                record.addSymptom(symptom);
            });
        }

        HealthRecord updated = healthRecordRepository.save(record);
        log.info("Health data updated for record ID: {}", updated.getId());

        return HealthRecordResponseDTO.from(updated);
    }

}
