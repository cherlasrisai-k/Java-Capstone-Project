package com.telemedicine.common.exception;

/**
 * General service exception for internal errors
 */
public class ServiceException extends RuntimeException {
    
    /**
	 * 
	 */
	private static final long serialVersionUID = -7069961397138736357L;

	public ServiceException(String message) {
        super(message);
    }
    
    public ServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
