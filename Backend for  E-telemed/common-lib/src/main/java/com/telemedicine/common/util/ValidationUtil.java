package com.telemedicine.common.util;

import org.apache.commons.lang3.StringUtils;

import java.util.regex.Pattern;

/**
 * Utility class for common validations
 */
public final class ValidationUtil {
    
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
    );
    
    private static final Pattern PHONE_PATTERN = Pattern.compile(
            "^[+]?[0-9]{10,15}$"
    );
    
    private ValidationUtil() {
        // Prevent instantiation
    }
    
    /**
     * Validate email format
     */
    public static boolean isValidEmail(String email) {
        if (StringUtils.isBlank(email)) {
            return false;
        }
        return EMAIL_PATTERN.matcher(email).matches();
    }
    
    /**
     * Validate phone number format
     */
    public static boolean isValidPhone(String phone) {
        if (StringUtils.isBlank(phone)) {
            return false;
        }
        return PHONE_PATTERN.matcher(phone).matches();
    }
    
    /**
     * Check if string is null or empty
     */
    public static boolean isEmpty(String str) {
        return StringUtils.isBlank(str);
    }
    
    /**
     * Check if string is not null or empty
     */
    public static boolean isNotEmpty(String str) {
        return StringUtils.isNotBlank(str);
    }
    
    /**
     * Validate age (must be between 0 and 150)
     */
    public static boolean isValidAge(int age) {
        return age >= 0 && age <= 150;
    }
    
    /**
     * Validate blood pressure systolic (must be between 70 and 200)
     */
    public static boolean isValidSystolic(int systolic) {
        return systolic >= 70 && systolic <= 200;
    }
    
    /**
     * Validate blood pressure diastolic (must be between 40 and 130)
     */
    public static boolean isValidDiastolic(int diastolic) {
        return diastolic >= 40 && diastolic <= 130;
    }
    
    /**
     * Validate heart rate (must be between 30 and 220)
     */
    public static boolean isValidHeartRate(int heartRate) {
        return heartRate >= 30 && heartRate <= 220;
    }
    
    /**
     * Validate oxygen saturation (must be between 70 and 100)
     */
    public static boolean isValidOxygenSaturation(int oxygenSaturation) {
        return oxygenSaturation >= 70 && oxygenSaturation <= 100;
    }
}
