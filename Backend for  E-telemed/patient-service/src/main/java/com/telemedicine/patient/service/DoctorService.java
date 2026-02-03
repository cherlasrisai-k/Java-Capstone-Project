package com.telemedicine.patient.service;

import com.telemedicine.patient.dto.DoctorDTO;
import com.telemedicine.patient.model.Doctor;
import com.telemedicine.patient.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DoctorService {

    private final DoctorRepository doctorRepository;

    public Page<DoctorDTO> getAllDoctors(Pageable pageable) {
        return doctorRepository.findAll(pageable)
                .map(this::convertToDTO);
    }
    
    @Transactional
    public DoctorDTO addDoctor(DoctorDTO doctorDTO) {
        // Check if email already exists
        if (doctorRepository.existsByEmail(doctorDTO.getEmail())) {
            throw new RuntimeException("Doctor with email " + doctorDTO.getEmail() + " already exists");
        }

        // Using setters (no builder pattern assumed)
        Doctor doctor = new Doctor();
        doctor.setFirstName(doctorDTO.getFirstName());
        doctor.setLastName(doctorDTO.getLastName());
        doctor.setEmail(doctorDTO.getEmail());
        doctor.setPhoneNumber(doctorDTO.getPhoneNumber());
        doctor.setSpecialization(doctorDTO.getSpecialization());
        doctor.setLicenseNumber(doctorDTO.getLicenseNumber());
        doctor.setYearsOfExperience(doctorDTO.getYearsOfExperience());
        doctor.setConsultationFee(doctorDTO.getConsultationFee());
        doctor.setQualifications(doctorDTO.getQualifications());
        doctor.setAvailableForConsultation(false); // Not available until admin approval
        doctor.setActive(false); // Pending admin approval

        Doctor savedDoctor = doctorRepository.save(doctor);
        log.info("New doctor added: {} ({})", savedDoctor.getId(), savedDoctor.getEmail());
        return convertToDTO(savedDoctor);
    }
    public DoctorDTO getDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));
        return convertToDTO(doctor);
    }

    public Page<DoctorDTO> getDoctorsBySpecialization(String specialization, Pageable pageable) {
        return doctorRepository.findBySpecialization(specialization, pageable)
                .map(this::convertToDTO);
    }

    public Page<Doctor> getAvailableDoctors(Pageable pageable) {
        return doctorRepository.findByAvailableForConsultationTrue(pageable);
    }

    public DoctorDTO updateDoctor(Long id, DoctorDTO doctorDTO) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));

        // Update fields
        doctor.setFirstName(doctorDTO.getFirstName());
        doctor.setLastName(doctorDTO.getLastName());
        doctor.setPhoneNumber(doctorDTO.getPhoneNumber());
        doctor.setSpecialization(doctorDTO.getSpecialization());
        doctor.setYearsOfExperience(doctorDTO.getYearsOfExperience());
        doctor.setConsultationFee(doctorDTO.getConsultationFee());
        doctor.setQualifications(doctorDTO.getQualifications());
        doctor.setAvailableForConsultation(doctorDTO.isAvailableForConsultation());

        Doctor savedDoctor = doctorRepository.save(doctor);
        log.info("Doctor updated: {}", id);
        
        return convertToDTO(savedDoctor);
    }

    public void deleteDoctor(Long id) {
        if (!doctorRepository.existsById(id)) {
            throw new RuntimeException("Doctor not found with id: " + id);
        }
        doctorRepository.deleteById(id);
        log.info("Doctor deleted: {}", id);
    }

    public String approveDoctor(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));

        doctor.setActive(true);
        doctor.setAvailableForConsultation(true);
        doctorRepository.save(doctor);
        
        log.info("Doctor approved: {} ({})", id, doctor.getEmail());
        return "Doctor with ID " + id + " has been approved";
    }

    private DoctorDTO convertToDTO(Doctor doctor) {
        return DoctorDTO.builder()
                .id(doctor.getId())
                .email(doctor.getEmail())
                .firstName(doctor.getFirstName())
                .lastName(doctor.getLastName())
                .phoneNumber(doctor.getPhoneNumber())
                .specialization(doctor.getSpecialization())
                .licenseNumber(doctor.getLicenseNumber())
                .active(doctor.isActive())
                .yearsOfExperience(doctor.getYearsOfExperience())
                .consultationFee(doctor.getConsultationFee())
                .qualifications(doctor.getQualifications())
                .availableForConsultation(doctor.isAvailableForConsultation())
                .build();
    }
}