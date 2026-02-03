package com.telemedicine.common.exception;

/**
 * Exception thrown for authentication failures
 */
public class UnauthorizedException extends RuntimeException {
    
    /**
	 * 
	 */
	private static final long serialVersionUID = 3957828676330331661L;

	public UnauthorizedException(String message) {
        super(message);
    }
    
    public UnauthorizedException(String message, Throwable cause) {
        super(message, cause);
    }
}
