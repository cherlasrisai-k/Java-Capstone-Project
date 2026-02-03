package com.telemedicine.common.constant;

/**
 * Common API constants
 */
public final class ApiConstants {
    
    private ApiConstants() {
        // Prevent instantiation
    }
    
    // API Versioning
    public static final String API_VERSION_V1 = "/api/v1";
    
    // Pagination
    public static final String DEFAULT_PAGE_NUMBER = "0";
    public static final String DEFAULT_PAGE_SIZE = "20";
    public static final String DEFAULT_SORT_BY = "id";
    public static final String DEFAULT_SORT_DIRECTION = "DESC";
    
    // Date Formats
    public static final String DATE_FORMAT = "yyyy-MM-dd";
    public static final String DATE_TIME_FORMAT = "yyyy-MM-dd HH:mm:ss";
    public static final String TIME_FORMAT = "HH:mm:ss";
    
    // Headers
    public static final String HEADER_AUTHORIZATION = "Authorization";
    public static final String HEADER_BEARER_PREFIX = "Bearer ";
    
    // Roles
    public static final String ROLE_PATIENT = "PATIENT";
    public static final String ROLE_DOCTOR = "DOCTOR";
    public static final String ROLE_ADMIN = "ADMIN";
}
