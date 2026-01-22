import { SignupPayload } from "./types";
import {
    isPasswordValid,
    getPasswordErrorMessage,
} from "@/utils/passwordValidation";

const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const phoneRegex = /^[+]?[-0-9 ()]{7,}$/;

export const validateSignupForm = (
    values: SignupPayload
): Partial<Record<keyof SignupPayload, string>> => {
    const errors: Partial<Record<keyof SignupPayload, string>> = {};

    if (!values.email) {
        errors.email = "Email is required";
    } else if (!emailRegex.test(values.email)) {
        errors.email = "Invalid email address";
    }

    if (!values.country) {
        errors.country = "Country is required";
    }

    if (values.signupMethod !== "google") {
        if (!values.password) {
            errors.password = "Password is required";
        } else if (!isPasswordValid(values.password)) {
            const errorMessage = getPasswordErrorMessage(values.password);
            if (errorMessage) {
                errors.password = errorMessage;
            }
        }

        if (!values.confirmPassword) {
            errors.confirmPassword = "Please confirm your password";
        } else if (values.password !== values.confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
        }
    }

    // Company profile fields validation removed for initial signup
    // if (!values.companyName) {
    //     errors.companyName = "Company name is required";
    // }

    // if (!values.phoneNumber) {
    //     errors.phoneNumber = "Phone number is required";
    // } else if (!phoneRegex.test(values.phoneNumber)) {
    //     errors.phoneNumber = "Enter a valid phone number";
    // }

    // if (!values.address) {
    //     errors.address = "Detailed address is required";
    // }

    // if (!values.companyLogo) {
    //     errors.companyLogo = "Company logo is required";
    // }

    return errors;
};

export const validateSignupFields = (
    values: SignupPayload,
    fields: (keyof SignupPayload)[]
): Partial<Record<keyof SignupPayload, string>> => {
    const allErrors = validateSignupForm(values);
    const stepErrors: Partial<Record<keyof SignupPayload, string>> = {};

    fields.forEach((field) => {
        if (allErrors[field]) {
            stepErrors[field] = allErrors[field];
        }
    });

    return stepErrors;
};
