import React from "react";
import { HeadlessForm } from "@/components/headless";
import { CompleteProfileForm } from "./CompleteProfileForm";
import { useCompleteProfile } from "./hooks/useCompleteProfile";
import { CompleteProfilePayload } from "./types";
import { validateCompleteProfileForm } from "./validation";

export const CompleteProfile: React.FC = () => {
    const {
        completeProfile,
        isLoading,
        error,
        success,
        clearError,
        clearSuccess,
    } = useCompleteProfile();

    const initialValues: CompleteProfilePayload = {
        companyName: "",
        phoneNumber: "",
        address: "",
        companyLogo: null,
    };

    return (
        <HeadlessForm<CompleteProfilePayload>
            initialValues={initialValues}
            onSubmit={completeProfile}
            validate={validateCompleteProfileForm}
            className="w-full"
        >
            {(formProps) => (
                <CompleteProfileForm
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
