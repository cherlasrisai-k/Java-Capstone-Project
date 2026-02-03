package com.telemedicine.consultation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication(scanBasePackages = {
    "com.telemedicine.consultation",
    "com.telemedicine.common"
})
@EnableDiscoveryClient
@EnableJpaAuditing
public class ConsultationServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ConsultationServiceApplication.class, args);
    }
}