package com.devision.job_manager_jobpost.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

/**
 * Custom validation annotation to ensure salary fields comply with SalaryType requirements.
 * 
 * Requirements:
 * - RANGE: Must have both salaryMin and salaryMax
 * - ABOUT: Must have either salaryMin or salaryMax (not both)
 * - UP_TO: Must have salaryMax only
 * - FROM: Must have salaryMin only
 * - NEGOTIABLE: Should not have salaryMin or salaryMax
 */
@Documented
@Constraint(validatedBy = ValidSalaryValidator.class)
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidSalary {
    String message() default "Salary fields do not match the selected salary type";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
