import React from "react";
import { HeadlessForm } from "@/components/headless";
import { CompanySignupForm } from "./CompanySignupForm";
import { useCompanySignup } from "./hooks/useCompanySignup";
import { SignupPayload } from "./types";
import { validateSignupForm } from "./validation";

export const CompanySignup: React.FC = () => {
    const { signup, isLoading, error, success, clearError, clearSuccess } =
        useCompanySignup();

    const initialValues: SignupPayload = {
        email: "",
        password: "",
        confirmPassword: "",
        country: "",
        companyName: "",
        phoneNumber: "",
        address: "",
        companyLogo: null,
        signupMethod: "credentials",
    };

    return (
        <HeadlessForm<SignupPayload>
            initialValues={initialValues}
            onSubmit={signup}
            validate={validateSignupForm}
            className="w-full"
        >
            {(formProps) => (
                <CompanySignupForm
                    {...formProps}
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
