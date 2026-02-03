package com.telemedicine.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;

/**
 * API Gateway routing configuration
 * Routes requests to appropriate microservices with circuit breaker and retry policies
 */
@Configuration
public class GatewayConfig {
    
    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                
                // ==================== PATIENT SERVICE ROUTES ====================
                
                // Authentication Routes (NO /api/v1 prefix for auth endpoints)
                .route("patient-service-auth", r -> r
                        .path("/auth/**")
                        .filters(f -> f
                                .circuitBreaker(c -> c
                                        .setName("patientServiceCircuitBreaker")
                                        .setFallbackUri("forward:/fallback/patient"))
                                .retry(retryConfig -> retryConfig
                                        .setRetries(3)
                                        .setStatuses(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .setMethods(org.springframework.http.HttpMethod.POST)))
                        .uri("lb://patient-service"))
                
                // Patient Management Routes (NO /api/v1 prefix)
                .route("patient-service-patients", r -> r
                        .path("/patients/**")
                        .filters(f -> f
                                .circuitBreaker(c -> c
                                        .setName("patientServiceCircuitBreaker")
                                        .setFallbackUri("forward:/fallback/patient"))
                                .retry(retryConfig -> retryConfig
                                        .setRetries(2)
                                        .setStatuses(HttpStatus.INTERNAL_SERVER_ERROR)))
                        .uri("lb://patient-service"))
                
                // Doctor Management Routes (NO /api/v1 prefix)
                .route("patient-service-doctors", r -> r
                        .path("/doctors/**")
                        .filters(f -> f
                                .circuitBreaker(c -> c
                                        .setName("patientServiceCircuitBreaker")
                                        .setFallbackUri("forward:/fallback/patient"))
                                .retry(retryConfig -> retryConfig
                                        .setRetries(2)
                                        .setStatuses(HttpStatus.INTERNAL_SERVER_ERROR)))
                        .uri("lb://patient-service"))
                
                // ==================== HEALTH DATA SERVICE ROUTES ====================
                
                .route("health-data-service", r -> r
                        .path("/api/v1/health-data/**")
                        .filters(f -> f
                                .circuitBreaker(c -> c
                                        .setName("healthDataServiceCircuitBreaker")
                                        .setFallbackUri("forward:/fallback/health-data"))
                                .retry(retryConfig -> retryConfig
                                        .setRetries(2)
                                        .setStatuses(HttpStatus.INTERNAL_SERVER_ERROR)))
                        .uri("lb://health-data-service"))
                
                // ==================== CONSULTATION SERVICE ROUTES ====================
                
                // Appointment Routes
                .route("consultation-service-appointments", r -> r
                        .path("/api/v1/appointments/**")
                        .filters(f -> f
                                .circuitBreaker(c -> c
                                        .setName("consultationServiceCircuitBreaker")
                                        .setFallbackUri("forward:/fallback/consultation"))
                                .retry(retryConfig -> retryConfig
                                        .setRetries(2)
                                        .setStatuses(HttpStatus.INTERNAL_SERVER_ERROR)))
                        .uri("lb://consultation-service"))
                
                // Consultation Routes
                .route("consultation-service-consultations", r -> r
                        .path("/api/v1/consultations/**")
                        .filters(f -> f
                                .circuitBreaker(c -> c
                                        .setName("consultationServiceCircuitBreaker")
                                        .setFallbackUri("forward:/fallback/consultation"))
                                .retry(retryConfig -> retryConfig
                                        .setRetries(2)
                                        .setStatuses(HttpStatus.INTERNAL_SERVER_ERROR)))
                        .uri("lb://consultation-service"))
                
                // ==================== PRESCRIPTION SERVICE ROUTES ====================
                
                .route("prescription-service", r -> r
                        .path("/api/v1/prescriptions/**")
                        .filters(f -> f
                                .circuitBreaker(c -> c
                                        .setName("prescriptionServiceCircuitBreaker")
                                        .setFallbackUri("forward:/fallback/prescription"))
                                .retry(retryConfig -> retryConfig
                                        .setRetries(2)
                                        .setStatuses(HttpStatus.INTERNAL_SERVER_ERROR)))
                        .uri("lb://prescription-service"))
                
                // ==================== NOTIFICATION SERVICE ROUTES ====================
                
                .route("notification-service", r -> r
                        .path("/api/v1/notifications/**")
                        .filters(f -> f
                                .circuitBreaker(c -> c
                                        .setName("notificationServiceCircuitBreaker")
                                        .setFallbackUri("forward:/fallback/notification"))
                                .retry(retryConfig -> retryConfig
                                        .setRetries(2)
                                        .setStatuses(HttpStatus.INTERNAL_SERVER_ERROR)))
                        .uri("lb://notification-service"))
                
                .build();
    }
}