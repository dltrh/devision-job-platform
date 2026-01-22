import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthService, { ResetPasswordPayload } from "../../api/AuthService";

export const useResetPassword = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get("token");

    const clearError = () => setError(null);
    const clearSuccess = () => setSuccess(null);

    const resetPassword = async (formData: {
        newPassword: string;
        confirmPassword: string;
    }) => {
        if (!token) {
            setError(
                "Reset token is missing. Please use the link from your email."
            );
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const payload: ResetPasswordPayload = {
                token,
                newPassword: formData.newPassword,
            };

            const response = await AuthService.resetPasswordCompany(payload);

            if (response.success) {
                setSuccess(
                    response.message ||
                        "Password reset successful! Redirecting to login..."
                );

                // Redirect to login after 2 seconds
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            } else {
                setError(
                    response.message ||
                        "Failed to reset password. Please try again."
                );
            }
        } catch (err: any) {
            setError(
                err.message ||
                    "Failed to reset password. The token may be invalid or expired."
            );
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        resetPassword,
        isLoading,
        error,
        success,
        clearError,
        clearSuccess,
        hasToken: !!token,
    };
};
