package com.devision.job_manager_applicant_search.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class SearchProfileNotFoundException extends RuntimeException {
    
    public SearchProfileNotFoundException(String message) {
        super(message);
    }
}
