import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CompleteProfilePayload } from "../types";
import CompanyProfileService from "@/components/feature/CompanyProfile/api/CompanyProfileService";
import { getStoredUser } from "@/services/authStorage";

export const useCompleteProfile = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const navigate = useNavigate();

    const completeProfile = async (formData: CompleteProfilePayload) => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const session = getStoredUser();
            if (!session || !session.companyId) {
                throw new Error("User session not found. Please log in again.");
            }

            // Update company details
            await CompanyProfileService.updateCompany({
                name: formData.companyName,
                phone: formData.phoneNumber,
                streetAddress: formData.address,
            });

            // Upload logo if provided
            if (formData.companyLogo) {
                try {
                    await CompanyProfileService.uploadLogo(
                        formData.companyLogo
                    );
                } catch (logoError) {
                    console.warn("Logo upload failed:", logoError);
                }
            }

            setSuccess("Profile updated successfully!");

            // Redirect to dashboard after short delay
            setTimeout(() => {
                navigate("/dashboard");
            }, 1500);

            return true;
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Failed to update profile. Please try again.";
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
        completeProfile,
        isLoading,
        error,
        success,
        clearError,
        clearSuccess,
    };
};
