package com.telemedicine.common.exception;

/**
 * Exception thrown for invalid request data
 */
public class BadRequestException extends RuntimeException {
    
    /**
	 * 
	 */
	private static final long serialVersionUID = -2637062936507571431L;

	public BadRequestException(String message) {
        super(message);
    }
    
    public BadRequestException(String message, Throwable cause) {
        super(message, cause);
    }
}
