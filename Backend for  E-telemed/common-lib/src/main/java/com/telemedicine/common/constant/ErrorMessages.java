package com.telemedicine.common.constant;

/**
 * Standardized error messages
 */
public final class ErrorMessages {
    
    private ErrorMessages() {
        // Prevent instantiation
    }
    
    // Authentication & Authorization
    public static final String INVALID_CREDENTIALS = "Invalid email or password";
    public static final String UNAUTHORIZED_ACCESS = "You are not authorized to access this resource";
    public static final String TOKEN_EXPIRED = "Authentication token has expired";
    public static final String TOKEN_INVALID = "Invalid authentication token";
    
    // User Related
    public static final String USER_NOT_FOUND = "User not found";
    public static final String USER_ALREADY_EXISTS = "User with this email already exists";
    public static final String PATIENT_NOT_FOUND = "Patient not found";
    public static final String DOCTOR_NOT_FOUND = "Doctor not found";
    
    // Health Data Related
    public static final String HEALTH_DATA_NOT_FOUND = "Health data not found";
    public static final String INVALID_HEALTH_DATA = "Invalid health data provided";
    
    // Appointment Related
    public static final String APPOINTMENT_NOT_FOUND = "Appointment not found";
    public static final String DOCTOR_NOT_AVAILABLE = "Doctor is not available at the requested time";
    public static final String APPOINTMENT_ALREADY_BOOKED = "This time slot is already booked";
    public static final String CANNOT_CANCEL_APPOINTMENT = "Cannot cancel appointment that has already passed";
    
    // Prescription Related
    public static final String PRESCRIPTION_NOT_FOUND = "Prescription not found";
    public static final String INVALID_PRESCRIPTION = "Invalid prescription data";
    
    // Validation
    public static final String INVALID_EMAIL = "Invalid email format";
    public static final String INVALID_PHONE = "Invalid phone number format";
    public static final String REQUIRED_FIELD = "This field is required";
    public static final String INVALID_DATE = "Invalid date format";
    public static final String DATE_IN_PAST = "Date cannot be in the past";
    
    // General
    public static final String INTERNAL_SERVER_ERROR = "An internal server error occurred";
    public static final String BAD_REQUEST = "Invalid request data";
}
