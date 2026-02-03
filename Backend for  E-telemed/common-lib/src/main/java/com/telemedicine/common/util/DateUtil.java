package com.telemedicine.common.util;

import com.telemedicine.common.constant.ApiConstants;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

/**
 * Utility class for date operations
 */
@Slf4j
public final class DateUtil {
    
    private static final DateTimeFormatter DATE_FORMATTER = 
            DateTimeFormatter.ofPattern(ApiConstants.DATE_FORMAT);
    
    private static final DateTimeFormatter DATE_TIME_FORMATTER = 
            DateTimeFormatter.ofPattern(ApiConstants.DATE_TIME_FORMAT);
    
    private DateUtil() {
        // Prevent instantiation
    }
    
    /**
     * Get current date
     */
    public static LocalDate now() {
        return LocalDate.now();
    }
    
    /**
     * Get current date time
     */
    public static LocalDateTime nowDateTime() {
        return LocalDateTime.now();
    }
    
    /**
     * Format LocalDate to string
     */
    public static String format(LocalDate date) {
        if (date == null) {
            return null;
        }
        return date.format(DATE_FORMATTER);
    }
    
    /**
     * Format LocalDateTime to string
     */
    public static String format(LocalDateTime dateTime) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.format(DATE_TIME_FORMATTER);
    }
    
    /**
     * Parse string to LocalDate
     */
    public static LocalDate parseDate(String dateString) {
        if (dateString == null || dateString.trim().isEmpty()) {
            return null;
        }
        try {
            return LocalDate.parse(dateString, DATE_FORMATTER);
        } catch (Exception e) {
            log.error("Error parsing date: {}", dateString, e);
            return null;
        }
    }
    
    /**
     * Parse string to LocalDateTime
     */
    public static LocalDateTime parseDateTime(String dateTimeString) {
        if (dateTimeString == null || dateTimeString.trim().isEmpty()) {
            return null;
        }
        try {
            return LocalDateTime.parse(dateTimeString, DATE_TIME_FORMATTER);
        } catch (Exception e) {
            log.error("Error parsing datetime: {}", dateTimeString, e);
            return null;
        }
    }
    
    /**
     * Check if date is in the past
     */
    public static boolean isPast(LocalDate date) {
        return date != null && date.isBefore(LocalDate.now());
    }
    
    /**
     * Check if datetime is in the past
     */
    public static boolean isPast(LocalDateTime dateTime) {
        return dateTime != null && dateTime.isBefore(LocalDateTime.now());
    }
    
    /**
     * Calculate days between two dates
     */
    public static long daysBetween(LocalDate startDate, LocalDate endDate) {
        return ChronoUnit.DAYS.between(startDate, endDate);
    }
    
    /**
     * Add days to date
     */
    public static LocalDate addDays(LocalDate date, long days) {
        return date.plusDays(days);
    }
    
    /**
     * Subtract days from date
     */
    public static LocalDate subtractDays(LocalDate date, long days) {
        return date.minusDays(days);
    }
}
