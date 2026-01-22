import { useState } from "react";
import AuthService, {
    SignupPayload,
} from "@/components/feature/Authentication/api/AuthService";

export const useCompanySignup = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const signup = async (formData: SignupPayload) => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await AuthService.signupCompany(formData);

            if (!response.success) {
                throw new Error(
                    response.message || "Failed to sign up. Please try again."
                );
            }

            const message =
                response.message ||
                "Registration successful! Please check your email to activate your account.";
            setSuccess(message);
            return response;
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Failed to sign up. Please try again.";
            setError(message);
            console.error(err);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const clearError = () => setError(null);
    const clearSuccess = () => setSuccess(null);

    return {
        signup,
        isLoading,
        error,
        success,
        clearError,
        clearSuccess,
    };
};
