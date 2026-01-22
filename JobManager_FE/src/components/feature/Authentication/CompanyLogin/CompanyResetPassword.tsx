import React from "react";
import { HeadlessForm } from "@/components/headless";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { useResetPassword } from "./hooks/useResetPassword";

interface ResetPasswordFormData {
    newPassword: string;
    confirmPassword: string;
}

// Validation function
const validateResetPasswordForm = (values: ResetPasswordFormData) => {
    const errors: Partial<Record<keyof ResetPasswordFormData, string>> = {};

    if (!values.newPassword) {
        errors.newPassword = "Password is required";
    } else if (values.newPassword.length < 8) {
        errors.newPassword = "Password must be at least 8 characters";
    } else if (
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/.test(
            values.newPassword
        )
    ) {
        errors.newPassword =
            "Password must contain uppercase, lowercase, number, and special character";
    }

    if (!values.confirmPassword) {
        errors.confirmPassword = "Please confirm your password";
    } else if (values.newPassword !== values.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
    }

    return errors;
};

export const CompanyResetPassword: React.FC = () => {
    const {
        resetPassword,
        isLoading,
        error,
        success,
        clearError,
        clearSuccess,
        hasToken,
    } = useResetPassword();

    if (!hasToken) {
        return (
            <div className="w-full text-center">
                <h2 className="text-2xl tracking-tight text-gray-600">
                    Invalid Reset Link
                </h2>
                <p className="mt-4 text-sm text-gray-600">
                    This password reset link is invalid or has expired. Please
                    request a new one.
                </p>
            </div>
        );
    }

    return (
        <HeadlessForm<ResetPasswordFormData>
            initialValues={{ newPassword: "", confirmPassword: "" }}
            onSubmit={resetPassword}
            validate={validateResetPasswordForm}
        >
            {({ values, errors, touched, handleChange, handleBlur }) => (
                <ResetPasswordForm
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
