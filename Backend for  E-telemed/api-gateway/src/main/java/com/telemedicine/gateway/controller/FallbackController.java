package com.telemedicine.gateway.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/fallback")
public class FallbackController {
    
    @GetMapping("/patient")
    public ResponseEntity<String> patientServiceFallback() {
        return ResponseEntity.status(503).body("{\"error\": \"Patient service unavailable\"}");
    }
    
    @GetMapping("/health-data")
    public ResponseEntity<String> healthDataServiceFallback() {
        return ResponseEntity.status(503).body("{\"error\": \"Health data service unavailable\"}");
    }
    
    @GetMapping("/consultation")
    public ResponseEntity<String> consultationServiceFallback() {
        return ResponseEntity.status(503).body("{\"error\": \"Consultation service unavailable\"}");
    }
    
    @GetMapping("/prescription")
    public ResponseEntity<String> prescriptionServiceFallback() {
        return ResponseEntity.status(503).body("{\"error\": \"Prescription service unavailable\"}");
    }
    
    @GetMapping("/notification")
    public ResponseEntity<String> notificationServiceFallback() {
        return ResponseEntity.status(503).body("{\"error\": \"Notification service unavailable\"}");
    }
}
