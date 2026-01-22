import React from "react";
import { HeadlessForm } from "@/components/headless";
import { CompanyForgotPasswordForm } from "./CompanyForgotPasswordForm";
import { useCompanyForgotPassword } from "./hooks/useCompanyForgotPassword";
import { ForgotPasswordPayload } from "../api/AuthService";

// Validation function
const validateForgotPasswordForm = (values: ForgotPasswordPayload) => {
    const errors: Partial<Record<keyof ForgotPasswordPayload, string>> = {};

    if (!values.email) {
        errors.email = "Email is required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
        errors.email = "Invalid email address";
    }

    return errors;
};

export const CompanyForgotPassword: React.FC = () => {
    const { forgotPassword, isLoading, error, success, clearError, clearSuccess } = useCompanyForgotPassword();

    return (
        <HeadlessForm<ForgotPasswordPayload>
            initialValues={{ email: "" }}
            onSubmit={forgotPassword}
            validate={validateForgotPasswordForm}
        >
            {({ values, errors, touched, handleChange, handleBlur }) => (
                <CompanyForgotPasswordForm
                    values={values}
                    errors={errors}
                    touched={touched}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    isLoading={isLoading}
                    error={error}
                    success={success}
                    onDismissError={clearError}
                    onDismissSuccess={clearSuccess}
                />
            )}
        </HeadlessForm>
    );
};
