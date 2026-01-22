import React from "react";
import { useCompanyLogin } from "./hooks/useCompanyLogin";
import { useSsoLogin } from "./hooks/useSsoLogin";
import { LoginFormUI } from "./ui/LoginFormUI";
import { HeadlessForm } from "../../../headless";
import { LoginPayload } from "../api/AuthService";

export const CompanyLogin: React.FC = () => {
    const { login, isLoading, error } = useCompanyLogin();
    const { ssoLoginResult, isProcessingSso, clearSsoResult } = useSsoLogin();

    return (
        <HeadlessForm<LoginPayload>
            initialValues={{ email: "", password: "" }}
            onSubmit={login}
        >
            {({ values, handleChange, handleSubmit }) => (
                <LoginFormUI
                    formData={values}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    isLoading={isLoading}
                    error={error}
                    ssoLoginResult={ssoLoginResult}
                    isProcessingSso={isProcessingSso}
                    clearSsoResult={clearSsoResult}
                />
            )}
        </HeadlessForm>
    );
};
