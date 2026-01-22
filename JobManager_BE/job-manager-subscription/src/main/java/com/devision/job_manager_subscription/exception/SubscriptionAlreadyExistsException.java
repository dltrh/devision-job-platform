package com.devision.job_manager_subscription.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class SubscriptionAlreadyExistsException extends RuntimeException {
    
    public SubscriptionAlreadyExistsException(String message) {
        super(message);
    }
}
