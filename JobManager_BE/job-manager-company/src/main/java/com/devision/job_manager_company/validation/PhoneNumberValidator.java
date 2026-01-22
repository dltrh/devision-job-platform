package com.devision.job_manager_company.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Set;
import java.util.regex.Pattern;

/**
 * Validator for phone numbers with international dial codes.
 * Rules:
 * - Must start with + followed by a valid country dial code
 * - Contains only digits after the + sign
 * - Total digits (including country code) must be between 7 and 15
 */
public class PhoneNumberValidator implements ConstraintValidator<ValidPhoneNumber, String> {

    private static final Set<String> VALID_DIAL_CODES = Set.of(
            // North America
            "1",      // USA, Canada
            // Europe
            "30",     // Greece
            "31",     // Netherlands
            "32",     // Belgium
            "33",     // France
            "34",     // Spain
            "36",     // Hungary
            "39",     // Italy
            "40",     // Romania
            "41",     // Switzerland
            "43",     // Austria
            "44",     // UK
            "45",     // Denmark
            "46",     // Sweden
            "47",     // Norway
            "48",     // Poland
            "49",     // Germany
            // Asia
            "60",     // Malaysia
            "61",     // Australia
            "62",     // Indonesia
            "63",     // Philippines
            "65",     // Singapore
            "66",     // Thailand
            "81",     // Japan
            "82",     // South Korea
            "84",     // Vietnam
            "86",     // China
            "91",     // India
            "92",     // Pakistan
            "93",     // Afghanistan
            "94",     // Sri Lanka
            "95",     // Myanmar
            "98",     // Iran
            // Middle East
            "90",     // Turkey
            "966",    // Saudi Arabia
            "971",    // UAE
            "972",    // Israel
            "973",    // Bahrain
            "974",    // Qatar
            // Africa
            "20",     // Egypt
            "27",     // South Africa
            "234",    // Nigeria
            "254",    // Kenya
            // South America
            "54",     // Argentina
            "55",     // Brazil
            "56",     // Chile
            "57",     // Colombia
            "58",     // Venezuela
            // Others
            "7",      // Russia
            "380",    // Ukraine
            "375",    // Belarus
            "852",    // Hong Kong
            "853",    // Macau
            "886"     // Taiwan
    );

    // Pattern: + followed by 1-4 digit country code, then remaining digits
    // Total digits (after +) should be 7-15 (E.164 standard)
    private static final Pattern PHONE_PATTERN = Pattern.compile("^\\+\\d{7,15}$");

    @Override
    public void initialize(ValidPhoneNumber constraintAnnotation) {
        // No initialization needed
    }

    @Override
    public boolean isValid(String phone, ConstraintValidatorContext context) {
        // Null or empty is valid (use @NotBlank if required)
        if (phone == null || phone.isBlank()) {
            return true;
        }

        // Must match the basic pattern
        if (!PHONE_PATTERN.matcher(phone).matches()) {
            setCustomMessage(context, "Phone number must start with + followed by 7-15 digits");
            return false;
        }

        // Extract the number without the + sign
        String digits = phone.substring(1);

        // Check if it starts with a valid dial code
        boolean hasValidDialCode = false;
        for (String code : VALID_DIAL_CODES) {
            if (digits.startsWith(code)) {
                // Verify remaining digits after dial code are less than 13
                String remainingDigits = digits.substring(code.length());
                if (remainingDigits.length() > 12) {
                    setCustomMessage(context, 
                            "Phone number digits after country code must be less than 13 characters");
                    return false;
                }
                if (remainingDigits.length() < 4) {
                    setCustomMessage(context, 
                            "Phone number must have at least 4 digits after country code");
                    return false;
                }
                hasValidDialCode = true;
                break;
            }
        }

        if (!hasValidDialCode) {
            setCustomMessage(context, "Phone number must start with a valid international dial code");
            return false;
        }

        return true;
    }

    private void setCustomMessage(ConstraintValidatorContext context, String message) {
        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate(message).addConstraintViolation();
    }
}
