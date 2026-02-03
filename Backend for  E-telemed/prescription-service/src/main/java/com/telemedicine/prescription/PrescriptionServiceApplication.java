package com.telemedicine.prescription;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication(scanBasePackages = {
    "com.telemedicine.prescription",
    "com.telemedicine.common"
})
@EnableDiscoveryClient
@EnableJpaAuditing
public class PrescriptionServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(PrescriptionServiceApplication.class, args);
    }
}
