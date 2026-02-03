package com.telemedicine.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Standard error response for exception handling
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {
    
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
    
    private int status;
    private String error;
    private String message;
    private String path;
    private String trace;
    
    // For validation errors
    private Map<String, String> validationErrors;
    
    /**
     * Create simple error response
     */
    public static ErrorResponse of(int status, String error, String message) {
        return ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status)
                .error(error)
                .message(message)
                .build();
    }
    
    /**
     * Create error response with path
     */
    public static ErrorResponse of(int status, String error, String message, String path) {
        return ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status)
                .error(error)
                .message(message)
                .path(path)
                .build();
    }
    
    /**
     * Create validation error response
     */
    public static ErrorResponse ofValidation(int status, String error, String message, 
                                            Map<String, String> validationErrors) {
        return ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status)
                .error(error)
                .message(message)
                .validationErrors(validationErrors)
                .build();
    }
}