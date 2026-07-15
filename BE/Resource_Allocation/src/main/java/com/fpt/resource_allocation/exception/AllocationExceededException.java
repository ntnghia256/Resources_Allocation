package com.fpt.resource_allocation.exception;

public class AllocationExceededException extends RuntimeException {
    public AllocationExceededException(String message) {
        super(message);
    }
}
