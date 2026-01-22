import { JobPostFormData, JobPostFormErrors } from "./types";
import { EMPLOYMENT_TYPES, SALARY_TYPES } from "@/utils/constants";

/**
 * Maximum salary value allowed (numeric field with precision 19, scale 2)
 * Database constraint: absolute value must be less than 10^17
 * Using a practical limit of 1 billion (1,000,000,000) for realistic salaries
 * while staying well within the database constraint
 */
const MAX_SALARY_VALUE = 1000000000;
const MAX_SALARY_DISPLAY = "1,000,000,000";

/**
 * Validate salary value doesn't exceed the maximum allowed limit
 */
const validateSalaryOverflow = (value: string): string | null => {
    if (!value) return null;
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return null;
    if (numValue > MAX_SALARY_VALUE) {
        return `Salary cannot exceed ${MAX_SALARY_DISPLAY}`;
    }
    return null;
};

/**
 * Validate Step 1: Basics
 */
export const validateBasics = (data: JobPostFormData): JobPostFormErrors => {
    const errors: JobPostFormErrors = {};

    if (!data.title.trim()) {
        errors.title = "Job title is required";
    } else if (data.title.length < 3) {
        errors.title = "Job title must be at least 3 characters";
    } else if (data.title.length > 255) {
        errors.title = "Job title must not exceed 255 characters";
    }

    if (data.employmentTypes.length === 0) {
        errors.employmentTypes = "Please select at least one employment type";
    }

    // Validation: Only Internship + Contract can be combined
    if (data.employmentTypes.length > 1) {
        const hasInternship = data.employmentTypes.includes(EMPLOYMENT_TYPES.INTERNSHIP);
        const hasContract = data.employmentTypes.includes(EMPLOYMENT_TYPES.CONTRACT);
        const isValidCombination =
            hasInternship && hasContract && data.employmentTypes.length === 2;

        if (!isValidCombination) {
            errors.employmentTypes = "Only Internship and Contract can be combined together";
        }
    }

    return errors;
};

/**
 * Validate Step 2: Compensation & Location
 */
export const validateCompensation = (data: JobPostFormData): JobPostFormErrors => {
    const errors: JobPostFormErrors = {};

    if (!data.salaryType) {
        errors.salaryType = "Salary type is required";
    }

    // Validate salary based on type
    if (data.salaryType === SALARY_TYPES.RANGE) {
        if (!data.salaryMin || parseFloat(data.salaryMin) <= 0) {
            errors.salaryMin = "Minimum salary is required for range type";
        } else {
            const overflowError = validateSalaryOverflow(data.salaryMin);
            if (overflowError) {
                errors.salaryMin = overflowError;
            }
        }
        if (!data.salaryMax || parseFloat(data.salaryMax) <= 0) {
            errors.salaryMax = "Maximum salary is required for range type";
        } else {
            const overflowError = validateSalaryOverflow(data.salaryMax);
            if (overflowError) {
                errors.salaryMax = overflowError;
            }
        }
        if (
            data.salaryMin &&
            data.salaryMax &&
            parseFloat(data.salaryMin) >= parseFloat(data.salaryMax)
        ) {
            errors.salaryMax = "Maximum salary must be greater than minimum";
        }
    } else if (data.salaryType === SALARY_TYPES.ABOUT || data.salaryType === SALARY_TYPES.FROM) {
        if (!data.salaryMin || parseFloat(data.salaryMin) <= 0) {
            errors.salaryMin = "Salary amount is required";
        } else {
            const overflowError = validateSalaryOverflow(data.salaryMin);
            if (overflowError) {
                errors.salaryMin = overflowError;
            }
        }
    } else if (data.salaryType === SALARY_TYPES.UP_TO) {
        if (!data.salaryMax || parseFloat(data.salaryMax) <= 0) {
            errors.salaryMax = "Maximum salary is required";
        } else {
            const overflowError = validateSalaryOverflow(data.salaryMax);
            if (overflowError) {
                errors.salaryMax = overflowError;
            }
        }
    }

    if (!data.locationCity.trim()) {
        errors.locationCity = "Location city is required";
    }

    if (!data.countryCode) {
        errors.countryCode = "Country for this job is required";
    }

    return errors;
};

/**
 * Validate Step 3: Description & Skills
 */
export const validateDescription = (data: JobPostFormData): JobPostFormErrors => {
    const errors: JobPostFormErrors = {};

    if (!data.description.trim()) {
        errors.description = "Job description is required";
    } else if (data.description.length < 50) {
        errors.description = "Job description should be at least 50 characters for better clarity";
    }

    // if (data.technicalSkills.length === 0) {
    //     errors.technicalSkills = "Please add at least one technical skill";
    // }

    // Update skills validation to use selectedSkills
    if (!data.selectedSkills || data.selectedSkills.length === 0) {
        errors.technicalSkills = "Please add at least one technical skill";
    }

    return errors;
};

/**
 * Validate Step 4: Visibility & Publish
 */
export const validateVisibility = (data: JobPostFormData): JobPostFormErrors => {
    const errors: JobPostFormErrors = {};

    if (data.expiryAt) {
        const expiryDate = new Date(data.expiryAt);
        const now = new Date();

        if (expiryDate <= now) {
            errors.expiryAt = "Expiry date must be in the future";
        }

        // Warn if expiry is within 7 days
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

        if (expiryDate < sevenDaysFromNow) {
            errors.expiryAt = "Warning: Job post will expire within 7 days";
        }
    }

    return errors;
};

/**
 * Validate all steps
 */
export const validateAllSteps = (data: JobPostFormData): JobPostFormErrors => {
    return {
        ...validateBasics(data),
        ...validateCompensation(data),
        ...validateDescription(data),
        ...validateVisibility(data),
    };
};

/**
 * Check if a step has errors
 */
export const hasStepErrors = (step: number, data: JobPostFormData): boolean => {
    let errors: JobPostFormErrors = {};

    switch (step) {
        case 0:
            errors = validateBasics(data);
            break;
        case 1:
            errors = validateCompensation(data);
            break;
        case 2:
            errors = validateDescription(data);
            break;
        case 3:
            errors = validateVisibility(data);
            break;
    }

    return Object.keys(errors).length > 0;
};
