import { CompleteProfilePayload } from "./types";

const phoneRegex = /^[+]?[-0-9 ()]{7,}$/;

export const validateCompleteProfileForm = (
    values: CompleteProfilePayload
): Partial<Record<keyof CompleteProfilePayload, string>> => {
    const errors: Partial<Record<keyof CompleteProfilePayload, string>> = {};

    if (!values.companyName) {
        errors.companyName = "Company name is required";
    }

    if (!values.phoneNumber) {
        errors.phoneNumber = "Phone number is required";
    } else if (!phoneRegex.test(values.phoneNumber)) {
        errors.phoneNumber = "Enter a valid phone number";
    }

    if (!values.address) {
        errors.address = "Detailed address is required";
    }

    if (!values.companyLogo) {
        errors.companyLogo = "Company logo is required";
    }

    return errors;
};
