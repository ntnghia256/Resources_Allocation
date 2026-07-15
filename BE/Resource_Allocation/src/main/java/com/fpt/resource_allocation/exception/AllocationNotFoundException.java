package com.fpt.resource_allocation.exception;

public class AllocationNotFoundException extends RuntimeException {
    public AllocationNotFoundException(String message) {
        super(message);
    }
}
