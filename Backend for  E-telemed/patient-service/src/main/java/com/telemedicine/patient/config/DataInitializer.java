package com.telemedicine.patient.config;

import com.telemedicine.patient.model.*;
import com.telemedicine.patient.repository.DoctorRepository;
import com.telemedicine.patient.repository.PatientRepository;
import com.telemedicine.patient.repository.UserRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.List;

@Configuration
public class DataInitializer {

    private final UserRepository userRepository;

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    DataInitializer(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Bean
    CommandLineRunner initAllData(
            UserRepository userRepository,
            DoctorRepository doctorRepository,
            PatientRepository patientRepository,
            PasswordEncoder encoder
    ) {
        return args -> {

            log.info("🔍 Starting database initialization...");

            seedAdmin(userRepository, encoder);
            seedDoctors(doctorRepository, encoder);
            seedPatients(patientRepository, encoder);

            log.info("✅ Database initialization complete.");
        };
    }

    // -------------------------------------------------------------------------
    // ADMIN
    // -------------------------------------------------------------------------
    private void seedAdmin(UserRepository userRepository, PasswordEncoder encoder) {

        if (!userRepository.existsByEmail("admin@telemed.com")) {

            log.info("🌱 Creating Admin...");

            User admin = new User();
            admin.setEmail("admin@telemed.com");
            admin.setPassword(encoder.encode("admin123"));
            admin.setFirstName("Super");
            admin.setLastName("Admin");
            admin.setRole(Role.ADMIN);
            admin.setPhoneNumber("9999999999");
            admin.setActive(true);

            userRepository.save(admin);

            log.info("✔ Admin created successfully.");
        } else {
            log.info("➡ Admin already exists.");
        }
    }

    // -------------------------------------------------------------------------
    // MULTIPLE DOCTORS
    // -------------------------------------------------------------------------
    private void seedDoctors(DoctorRepository doctorRepository, PasswordEncoder encoder) {

        record DocSeed(
                String email, String firstName, String lastName,
                String specialization, String license, int exp,
                int fee, String qualifications, String phone
        ) {}

        List<DocSeed> doctorSeeds = List.of(
                new DocSeed("doctor@telemed.com", "Emily", "Stone", "Cardiology",
                        "LIC-CARD-2024-001", 12, 500, "MBBS, MD (Cardiology)", "9876543210"),

                new DocSeed("neuro@telemed.com", "Raj", "Verma", "Neurology",
                        "LIC-NEURO-2024-007", 15, 700, "MBBS, DM (Neurology)", "9876500001"),

                new DocSeed("ortho@telemed.com", "Sara", "Khan", "Orthopedics",
                        "LIC-ORTHO-2024-110", 10, 450, "MBBS, MS (Ortho)", "9876500002"),

                new DocSeed("derma@telemed.com", "Ritu", "Mehra", "Dermatology",
                        "LIC-DERMA-2024-220", 8, 400, "MBBS, MD (Dermatology)", "9876500003"),

                new DocSeed("pedia@telemed.com", "Arjun", "Sharma", "Pediatrics",
                        "LIC-PEDS-2024-350", 9, 350, "MBBS, MD (Pediatrics)", "9876500004"),
                new DocSeed("surya@telemed.com", "Surya", "Prasad",
                        "General Practice", "LIC-GEN-2024-501",
                        7, 300, "MBBS, SPDM", "9876500005"),

                new DocSeed("krishna@telemed.com", "Krishna", "Murthy",
                        "Psychiatry", "LIC-PSY-2024-880",
                        11, 600, "MBBS, MD (Psychiatry)", "9876500006")
        		);

        for (DocSeed seed : doctorSeeds) {

            if (userRepository.existsByEmail(seed.email())) {
                log.info("➡ Doctor {} already exists.", seed.email());
                continue;
            }

            log.info("🌱 Creating Doctor: {}", seed.email());

            Doctor doc = new Doctor();
            doc.setEmail(seed.email());
            doc.setPassword(encoder.encode("doctor123"));
            doc.setFirstName(seed.firstName());
            doc.setLastName(seed.lastName());
            doc.setPhoneNumber(seed.phone());
            doc.setRole(Role.DOCTOR);
            doc.setActive(false);

            doc.setSpecialization(seed.specialization());
            doc.setLicenseNumber(seed.license());
            doc.setYearsOfExperience(seed.exp());
            doc.setConsultationFee(seed.fee());
            doc.setQualifications(seed.qualifications());

            doc.setClinicAddress(new Address(
                    "Clinic Street",
                    "Block A",
                    "Hyderabad",
                    "Telangana",
                    "500001",
                    "India"
            ));

            doctorRepository.save(doc);
            log.info("✔ Doctor {} created.", seed.email());
        }
    }

    // -------------------------------------------------------------------------
    // MULTIPLE PATIENTS
    // -------------------------------------------------------------------------
    private void seedPatients(PatientRepository patientRepository, PasswordEncoder encoder) {

        record PatSeed(
                String email, String firstName, String lastName, LocalDate dob,
                Patient.Gender gender, String blood, String phone,
                String emergencyName, String emergencyPhone
        ) {}

        List<PatSeed> patientSeeds = List.of(
                new PatSeed("patient@telemed.com", "John", "Doe",
                        LocalDate.of(1998, 5, 20), Patient.Gender.MALE,
                        "O+", "9000000000", "Jane Doe", "9112345678"),

                new PatSeed("alice@telemed.com", "Alice", "Thomas",
                        LocalDate.of(2001, 2, 14), Patient.Gender.FEMALE,
                        "A+", "9000000001", "Michael Thomas", "9112345001"),

                new PatSeed("rohan@telemed.com", "Rohan", "Patil",
                        LocalDate.of(1995, 11, 3), Patient.Gender.MALE,
                        "B+", "9000000002", "Suresh Patil", "9112345002"),

                new PatSeed("keerti@telemed.com", "Keerti", "Mishra",
                        LocalDate.of(1999, 6, 23), Patient.Gender.FEMALE,
                        "AB+", "9000000003", "Anita Mishra", "9112345003"),

                new PatSeed("vivek@telemed.com", "Vivek", "Shah",
                        LocalDate.of(1988, 8, 12), Patient.Gender.MALE,
                        "O-", "9000000004", "Ravi Shah", "9112345004")
        );

        for (PatSeed seed : patientSeeds) {

            if (userRepository.existsByEmail(seed.email())) {
                log.info("➡ Patient {} already exists.", seed.email());
                continue;
            }

            log.info("🌱 Creating Patient: {}", seed.email());

            Patient pat = new Patient();
            pat.setEmail(seed.email());
            pat.setPassword(encoder.encode("patient123"));
            pat.setFirstName(seed.firstName());
            pat.setLastName(seed.lastName());
            pat.setPhoneNumber(seed.phone());
            pat.setRole(Role.PATIENT);
            pat.setActive(false);

            pat.setGender(seed.gender());
            pat.setDateOfBirth(seed.dob());
            pat.setBloodGroup(seed.blood());
            pat.setEmergencyContactName(seed.emergencyName());
            pat.setEmergencyContactPhone(seed.emergencyPhone());

            pat.setAddress(new Address(
                    "Main Street",
                    "Sector 10",
                    "Mumbai",
                    "Maharashtra",
                    "400001",
                    "India"
            ));

            patientRepository.save(pat);
            log.info("✔ Patient {} created.", seed.email());
        }
    }
}