/**
 * Password validation utility for enforcing password requirements
 */

export interface PasswordRequirement {
    label: string;
    test: (password: string) => boolean;
    met: boolean;
}

/**
 * Password must meet these requirements:
 * - At least 8 characters
 * - At least 1 number
 * - At least 1 uppercase letter
 * - At least 1 special character (@#$%^&+=!)
 */
export const PASSWORD_REQUIREMENTS = {
    minLength: {
        label: "At least 8 characters",
        test: (password: string) => password.length >= 8,
    },
    hasNumber: {
        label: "At least 1 number (0-9)",
        test: (password: string) => /[0-9]/.test(password),
    },
    hasUppercase: {
        label: "At least 1 uppercase letter (A-Z)",
        test: (password: string) => /[A-Z]/.test(password),
    },
    hasSpecialChar: {
        label: "At least 1 special character (@#$%^&+=!)",
        test: (password: string) => /[@#$%^&+=!]/.test(password),
    },
};

/**
 * Check which password requirements are met
 */
export const checkPasswordRequirements = (
    password: string
): PasswordRequirement[] => {
    return Object.values(PASSWORD_REQUIREMENTS).map((req) => ({
        label: req.label,
        test: req.test,
        met: req.test(password),
    }));
};

/**
 * Check if password meets all requirements
 */
export const isPasswordValid = (password: string): boolean => {
    if (!password) return false;
    return Object.values(PASSWORD_REQUIREMENTS).every((req) =>
        req.test(password)
    );
};

/**
 * Get a user-friendly error message for password validation
 */
export const getPasswordErrorMessage = (password: string): string | null => {
    if (!password) {
        return "Password is required";
    }

    const unmetRequirements: string[] = [];

    if (!PASSWORD_REQUIREMENTS.minLength.test(password)) {
        unmetRequirements.push("at least 8 characters");
    }
    if (!PASSWORD_REQUIREMENTS.hasNumber.test(password)) {
        unmetRequirements.push("at least 1 number");
    }
    if (!PASSWORD_REQUIREMENTS.hasUppercase.test(password)) {
        unmetRequirements.push("at least 1 uppercase letter");
    }
    if (!PASSWORD_REQUIREMENTS.hasSpecialChar.test(password)) {
        unmetRequirements.push("at least 1 special character (@#$%^&+=!)");
    }

    if (unmetRequirements.length === 0) {
        return null;
    }

    return `Password must contain ${unmetRequirements.join(", ")}`;
};

/**
 * Password regex pattern that enforces all requirements
 * Must have: 8+ chars, 1 number, 1 uppercase, 1 special char (@#$%^&+=!)
 */
export const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,}$/;

/**
 * Validate password using regex
 */
export const validatePasswordRegex = (password: string): boolean => {
    return PASSWORD_REGEX.test(password);
};
