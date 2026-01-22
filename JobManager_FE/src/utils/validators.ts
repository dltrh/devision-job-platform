// Common validation functions

export const validators = {
    email: (value: string): string | undefined => {
        if (!value) return "Email is required";
        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
            return "Invalid email address";
        }
        return undefined;
    },

    password: (value: string, minLength: number = 6): string | undefined => {
        if (!value) return "Password is required";
        if (value.length < minLength) {
            return `Password must be at least ${minLength} characters`;
        }
        return undefined;
    },

    required: (
        value: any,
        fieldName: string = "This field"
    ): string | undefined => {
        if (!value || (typeof value === "string" && !value.trim())) {
            return `${fieldName} is required`;
        }
        return undefined;
    },

    minLength: (
        value: string,
        min: number,
        fieldName: string = "Value"
    ): string | undefined => {
        if (value && value.length < min) {
            return `${fieldName} must be at least ${min} characters`;
        }
        return undefined;
    },

    maxLength: (
        value: string,
        max: number,
        fieldName: string = "Value"
    ): string | undefined => {
        if (value && value.length > max) {
            return `${fieldName} must not exceed ${max} characters`;
        }
        return undefined;
    },

    url: (value: string): string | undefined => {
        if (!value) return undefined;
        try {
            new URL(value);
            return undefined;
        } catch {
            return "Invalid URL";
        }
    },

    phone: (value: string): string | undefined => {
        if (!value) return undefined;
        if (!/^[\d\s\-\+\(\)]+$/.test(value)) {
            return "Invalid phone number";
        }
        return undefined;
    },
};

// Company-specific validators

// Dial code type (matches backend response)
export interface DialCode {
    code: string;
    name: string;
}

// Re-export getDialCodes from CompanyProfileService for convenience
export { getDialCodes } from '@/components/feature/CompanyProfile/api/CompanyProfileService';

// Valid company size ranges
const VALID_COMPANY_SIZES = [
    "1-10",
    "11-50",
    "51-200",
    "201-500",
    "501-1000",
    "1001-5000",
    "5001-10000",
    "10001+",
];

export const companyValidators = {
    /**
     * Company name: max 255 characters
     */
    name: (value: string): string | undefined => {
        if (!value) return undefined;
        if (value.length > 255) {
            return "Company name must be less than 255 characters";
        }
        return undefined;
    },

    /**
     * Phone number: Must start with + followed by valid dial code and 4-12 more digits
     * Format: +[dial_code][4-12 digits] (7-15 total digits after +)
     * 
     * @param value - The phone number to validate
     * @param validDialCodes - Array of valid dial code strings (fetched from API via getDialCodes())
     */
    phone: (value: string, validDialCodes?: string[]): string | undefined => {
        if (!value) return undefined;

        // Must match pattern: + followed by 7-15 digits
        if (!/^\+\d{7,15}$/.test(value)) {
            return "Phone number must start with + followed by 7-15 digits";
        }

        // If no dial codes provided, skip dial code validation
        // (validation will be handled by PhoneInput component after fetching codes)
        if (!validDialCodes || validDialCodes.length === 0) {
            return undefined;
        }

        const digitsAfterPlus = value.slice(1);

        // Check for valid dial code
        const hasValidDialCode = validDialCodes.some((code) =>
            digitsAfterPlus.startsWith(code)
        );

        if (!hasValidDialCode) {
            return "Phone number must start with a valid international dial code";
        }

        // Find the dial code and check digits after it
        const matchedDialCode = validDialCodes.find((code) =>
            digitsAfterPlus.startsWith(code)
        );

        if (matchedDialCode) {
            const digitsAfterCode = digitsAfterPlus.slice(
                matchedDialCode.length
            );
            if (digitsAfterCode.length < 4) {
                return "Phone number must have at least 4 digits after country code";
            }
            if (digitsAfterCode.length > 12) {
                return "Phone number digits after country code must be less than 13 characters";
            }
        }

        return undefined;
    },

    /**
     * Street address: max 255 characters
     */
    streetAddress: (value: string): string | undefined => {
        if (!value) return undefined;
        if (value.length > 255) {
            return "Street address must be less than 255 characters";
        }
        return undefined;
    },

    /**
     * City: max 128 characters
     */
    city: (value: string): string | undefined => {
        if (!value) return undefined;
        if (value.length > 128) {
            return "City must be less than 128 characters";
        }
        return undefined;
    },

    /**
     * Country code: 2-3 uppercase letters (ISO 3166-1)
     */
    countryCode: (value: string): string | undefined => {
        if (!value) return undefined;
        if (value.length < 2 || value.length > 3) {
            return "Country code must be 2-3 characters (ISO 3166-1 alpha-2 or alpha-3)";
        }
        if (!/^[A-Z]{2,3}$/.test(value)) {
            return "Country code must be uppercase letters (e.g., VN, USA)";
        }
        return undefined;
    },

    /**
     * About us: max 10000 characters
     */
    aboutUs: (value: string): string | undefined => {
        if (!value) return undefined;
        if (value.length > 10000) {
            return "About us must be less than 10000 characters";
        }
        return undefined;
    },

    /**
     * Who we seek: max 5000 characters
     */
    whoWeSeek: (value: string): string | undefined => {
        if (!value) return undefined;
        if (value.length > 5000) {
            return "Who we seek must be less than 5000 characters";
        }
        return undefined;
    },

    /**
     * Website URL: max 512 characters, valid URL format
     */
    websiteUrl: (value: string): string | undefined => {
        if (!value) return undefined;
        if (value.length > 512) {
            return "Website URL must be less than 512 characters";
        }
        // Match backend pattern: ^(https?://)?([\\w.-]+)(:[0-9]+)?(/.*)?$|^$
        if (!/^(https?:\/\/)?[\w.-]+(:[0-9]+)?(\/.*)?$/.test(value)) {
            return "Website URL must be a valid URL format";
        }
        return undefined;
    },

    /**
     * LinkedIn URL: max 512 characters, valid LinkedIn URL format
     */
    linkedinUrl: (value: string): string | undefined => {
        if (!value) return undefined;
        if (value.length > 512) {
            return "LinkedIn URL must be less than 512 characters";
        }
        // Match backend pattern: ^(https?://)?(www\\.)?linkedin\\.com/(company|in)/[\\w\\-]+/?$
        if (
            !/^(https?:\/\/)?(www\.)?linkedin\.com\/(company|in)\/[\w-]+\/?$/.test(
                value
            )
        ) {
            return "LinkedIn URL must be a valid LinkedIn profile or company URL";
        }
        return undefined;
    },

    /**
     * Industry: max 128 characters
     */
    industry: (value: string): string | undefined => {
        if (!value) return undefined;
        if (value.length > 128) {
            return "Industry must be less than 128 characters";
        }
        return undefined;
    },

    /**
     * Company size: must be a valid range
     */
    companySize: (value: string): string | undefined => {
        if (!value) return undefined;
        if (!VALID_COMPANY_SIZES.includes(value)) {
            return "Company size must be a valid range (e.g., 1-10, 11-50, 51-200, 201-500, 501-1000, 1001-5000, 5001-10000, 10001+)";
        }
        return undefined;
    },

    /**
     * Founded year: between 1800 and current year
     */
    foundedYear: (value: string): string | undefined => {
        if (!value) return undefined;
        const year = parseInt(value, 10);
        const currentYear = new Date().getFullYear();
        if (isNaN(year)) {
            return "Founded year must be a valid number";
        }
        if (year < 1800) {
            return "Founded year must be at least 1800";
        }
        if (year > currentYear) {
            return `Founded year must be at most ${currentYear}`;
        }
        return undefined;
    },
};

// Export valid company sizes for dropdown/select usage
export const COMPANY_SIZE_OPTIONS = VALID_COMPANY_SIZES;

// Compose multiple validators
export const composeValidators = (
    ...validators: Array<(value: any) => string | undefined>
) => {
    return (value: any): string | undefined => {
        for (const validator of validators) {
            const error = validator(value);
            if (error) return error;
        }
        return undefined;
    };
};
