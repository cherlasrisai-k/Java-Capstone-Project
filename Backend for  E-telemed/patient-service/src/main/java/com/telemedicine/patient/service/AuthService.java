package com.telemedicine.patient.service;

import com.telemedicine.common.security.JwtService;
import com.telemedicine.patient.dto.AuthResponse;
import com.telemedicine.patient.dto.LoginRequest;
import com.telemedicine.patient.dto.RegisterRequest;
import com.telemedicine.patient.dto.UserDTO;
import com.telemedicine.patient.model.Doctor;
import com.telemedicine.patient.model.Patient;
import com.telemedicine.patient.model.Role;
import com.telemedicine.patient.model.User;
import com.telemedicine.patient.repository.DoctorRepository;
import com.telemedicine.patient.repository.PatientRepository;
import com.telemedicine.patient.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User savedUser;

        // Handle role-specific registration
        switch (request.getRole()) {
            case PATIENT:
                savedUser = registerPatient(request);
                log.info("Patient registered successfully: {}", request.getEmail());
                break;

            case DOCTOR:
                savedUser = registerDoctor(request);
                log.info("Doctor registered successfully: {}", request.getEmail());
                break;

            case ADMIN:
                savedUser = registerAdmin(request);
                log.info("Admin registered successfully: {}", request.getEmail());
                break;

            default:
                throw new RuntimeException("Invalid role selected");
        }

        // Generate tokens
        String accessToken = jwtService.generateAccessToken(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getRole().name()
        );
        String refreshToken = jwtService.generateRefreshToken(
                savedUser.getId(),
                savedUser.getEmail()
        );

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpiration())
                .user(convertToUserDTO(savedUser))
                .build();
    }

    private Patient registerPatient(RegisterRequest request) {
        Patient patient = new Patient();
        patient.setEmail(request.getEmail());
        patient.setPassword(passwordEncoder.encode(request.getPassword()));
        patient.setFirstName(request.getFirstName());
        patient.setLastName(request.getLastName());
        patient.setPhoneNumber(request.getPhoneNumber());
        patient.setRole(Role.PATIENT);
        patient.setActive(false); // Inactive by default, needs admin approval

        // Parse and set date of birth
        if (request.getDateOfBirth() != null) {
            try {
                patient.setDateOfBirth(LocalDate.parse(request.getDateOfBirth()));
            } catch (DateTimeParseException e) {
                throw new RuntimeException("Invalid date format, expected yyyy-MM-dd");
            }
        }

        patient.setGender(request.getGender());
        patient.setBloodGroup(request.getBloodGroup());
        patient.setAddress(request.getAddress() != null ? request.getAddress().toEntity() : null);
        patient.setEmergencyContactName(request.getEmergencyContactName());
        patient.setEmergencyContactPhone(request.getEmergencyContactPhone());

        return patientRepository.save(patient);
    }

    private Doctor registerDoctor(RegisterRequest request) {
        Doctor doctor = new Doctor();
        doctor.setEmail(request.getEmail());
        doctor.setPassword(passwordEncoder.encode(request.getPassword()));
        doctor.setFirstName(request.getFirstName());
        doctor.setLastName(request.getLastName());
        doctor.setPhoneNumber(request.getPhoneNumber());
        doctor.setRole(Role.DOCTOR);
        doctor.setActive(false); // Inactive by default, needs admin approval

        // Doctor-specific fields
        doctor.setSpecialization(request.getSpecialization());
        doctor.setLicenseNumber(request.getLicenseNumber());
        doctor.setYearsOfExperience(request.getYearsOfExperience());
        doctor.setConsultationFee(request.getConsultationFee());
        doctor.setQualifications(request.getQualifications());
        doctor.setClinicAddress(request.getClinicAddress() != null ? request.getClinicAddress().toEntity() : null);
        doctor.setAvailableForConsultation(false); // Not available until approved

        return doctorRepository.save(doctor);
    }

    private User registerAdmin(RegisterRequest request) {
        // Admin is just a base User, no additional Patient/Doctor entity
        User admin = new User();
        admin.setEmail(request.getEmail());
        admin.setPassword(passwordEncoder.encode(request.getPassword()));
        admin.setFirstName(request.getFirstName());
        admin.setLastName(request.getLastName());
        admin.setPhoneNumber(request.getPhoneNumber());
        admin.setRole(Role.ADMIN);
        admin.setActive(true); // Admin is active immediately (no approval needed)
        return userRepository.save(admin);
    }

    public AuthResponse login(LoginRequest request) {
        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        // Check if user is active
        if (!user.isActive()) {
            throw new RuntimeException("Account not approved by admin yet");
        }

        // Authenticate credentials
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // Generate tokens
        String accessToken = jwtService.generateAccessToken(
                user.getId(),
                user.getEmail(),
                user.getRole().name()
        );
        String refreshToken = jwtService.generateRefreshToken(
                user.getId(),
                user.getEmail()
        );

        log.info("User logged in successfully: {} (Role: {})", user.getEmail(), user.getRole());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpiration())
                .user(convertToUserDTO(user))
                .build();
    }

    public AuthResponse refreshToken(String refreshToken) {
        // Validate refresh token
        if (!jwtService.isTokenValid(refreshToken)) {
            throw new RuntimeException("Invalid or expired refresh token");
        }

        // Extract email and find user
        String email = jwtService.extractUsername(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Generate new tokens
        String newAccessToken = jwtService.generateAccessToken(
                user.getId(),
                user.getEmail(),
                user.getRole().name()
        );
        String newRefreshToken = jwtService.generateRefreshToken(
                user.getId(),
                user.getEmail()
        );

        log.info("Token refreshed for user: {}", user.getEmail());

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpiration())
                .user(convertToUserDTO(user))
                .build();
    }

    private UserDTO convertToUserDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}