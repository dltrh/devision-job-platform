import { useState } from "react";
import AuthService, { ForgotPasswordPayload } from "../../api/AuthService";

export const useCompanyForgotPassword = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const clearError = () => setError(null);
    const clearSuccess = () => setSuccess(null);

    const forgotPassword = async (formData: ForgotPasswordPayload) => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await AuthService.forgotPasswordCompany(formData);

            if (response.success) {
                setSuccess(
                    response.message ||
                        "Password reset email sent successfully. Please check your inbox."
                );
            } else {
                setError(
                    response.message ||
                        "Failed to send reset email. Please try again."
                );
            }
        } catch (err: any) {
            setError(
                err.message || "Failed to send reset email. Please try again."
            );
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        forgotPassword,
        isLoading,
        error,
        success,
        clearError,
        clearSuccess,
    };
};
