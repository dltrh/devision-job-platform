package com.devision.job_manager_company.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Validates that a phone number:
 * - Starts with a valid international dial code (e.g., +84, +49)
 * - Contains only digits after the + sign
 * - The digits following the dial code are less than 13 characters
 */
@Documented
@Constraint(validatedBy = PhoneNumberValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidPhoneNumber {
    String message() default "Invalid phone number. Must start with + followed by country code and digits (max 15 digits total)";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
