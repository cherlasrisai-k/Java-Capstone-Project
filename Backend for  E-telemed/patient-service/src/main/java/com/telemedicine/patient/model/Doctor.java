package com.telemedicine.patient.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "doctors")
@PrimaryKeyJoinColumn(name = "user_id")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Doctor extends User {
	@Column(nullable = false)
	private String specialization;
	@Column(unique = true, nullable = false)
	private String licenseNumber;
	private Integer yearsOfExperience;
	@Column(precision = 10, scale = 2)
	private int consultationFee;
	private String qualifications;
	@Embedded
	private Address clinicAddress;
	private boolean availableForConsultation = true;
}