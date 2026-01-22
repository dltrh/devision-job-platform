package com.devision.job_manager_jobpost.validation;

import com.devision.job_manager_jobpost.dto.external.CreateJobPostRequest;
import com.devision.job_manager_jobpost.dto.external.UpdateJobPostRequest;
import com.devision.job_manager_jobpost.model.SalaryType;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.math.BigDecimal;

/**
 * Validator to ensure salary fields match the SalaryType requirements.
 */
public class ValidSalaryValidator implements ConstraintValidator<ValidSalary, Object> {

    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        if (value == null) {
            return true; // Let @NotNull handle null checks
        }

        SalaryType salaryType;
        BigDecimal salaryMin;
        BigDecimal salaryMax;

        // Handle both CreateJobPostRequest and UpdateJobPostRequest
        if (value instanceof CreateJobPostRequest) {
            CreateJobPostRequest request = (CreateJobPostRequest) value;
            salaryType = request.getSalaryType();
            salaryMin = request.getSalaryMin();
            salaryMax = request.getSalaryMax();
        } else if (value instanceof UpdateJobPostRequest) {
            UpdateJobPostRequest request = (UpdateJobPostRequest) value;
            salaryType = request.getSalaryType();
            salaryMin = request.getSalaryMin();
            salaryMax = request.getSalaryMax();
            
            // For updates, if salaryType is null, skip validation
            if (salaryType == null) {
                return true;
            }
        } else {
            return true; // Unknown type, skip validation
        }

        if (salaryType == null) {
            return true; // Let @NotNull handle this
        }

        boolean hasMin = salaryMin != null && salaryMin.compareTo(BigDecimal.ZERO) > 0;
        boolean hasMax = salaryMax != null && salaryMax.compareTo(BigDecimal.ZERO) > 0;

        // Validate based on salary type
        switch (salaryType) {
            case RANGE:
                if (!hasMin || !hasMax) {
                    context.disableDefaultConstraintViolation();
                    context.buildConstraintViolationWithTemplate(
                        "Salary type RANGE requires both salaryMin and salaryMax (e.g., 1000 \u2013 1500 USD)"
                    ).addConstraintViolation();
                    return false;
                }
                if (salaryMin.compareTo(salaryMax) >= 0) {
                    context.disableDefaultConstraintViolation();
                    context.buildConstraintViolationWithTemplate(
                        "For RANGE salary type, salaryMin must be less than salaryMax"
                    ).addConstraintViolation();
                    return false;
                }
                return true;

            case ABOUT:
                if (!hasMin && !hasMax) {
                    context.disableDefaultConstraintViolation();
                    context.buildConstraintViolationWithTemplate(
                        "Salary type ABOUT requires either salaryMin or salaryMax (e.g., About 1000 USD)"
                    ).addConstraintViolation();
                    return false;
                }
                if (hasMin && hasMax) {
                    context.disableDefaultConstraintViolation();
                    context.buildConstraintViolationWithTemplate(
                        "Salary type ABOUT should have only one value (salaryMin or salaryMax), not both"
                    ).addConstraintViolation();
                    return false;
                }
                return true;

            case UP_TO:
                if (!hasMax) {
                    context.disableDefaultConstraintViolation();
                    context.buildConstraintViolationWithTemplate(
                        "Salary type UP_TO requires salaryMax (e.g., Up to 2000 USD)"
                    ).addConstraintViolation();
                    return false;
                }
                if (hasMin) {
                    context.disableDefaultConstraintViolation();
                    context.buildConstraintViolationWithTemplate(
                        "Salary type UP_TO should only have salaryMax, not salaryMin"
                    ).addConstraintViolation();
                    return false;
                }
                return true;

            case FROM:
                if (!hasMin) {
                    context.disableDefaultConstraintViolation();
                    context.buildConstraintViolationWithTemplate(
                        "Salary type FROM requires salaryMin (e.g., From 3000 USD)"
                    ).addConstraintViolation();
                    return false;
                }
                if (hasMax) {
                    context.disableDefaultConstraintViolation();
                    context.buildConstraintViolationWithTemplate(
                        "Salary type FROM should only have salaryMin, not salaryMax"
                    ).addConstraintViolation();
                    return false;
                }
                return true;

            case NEGOTIABLE:
                if (hasMin || hasMax) {
                    context.disableDefaultConstraintViolation();
                    context.buildConstraintViolationWithTemplate(
                        "Salary type NEGOTIABLE should not have salaryMin or salaryMax values"
                    ).addConstraintViolation();
                    return false;
                }
                return true;

            default:
                return true;
        }
    }
}
