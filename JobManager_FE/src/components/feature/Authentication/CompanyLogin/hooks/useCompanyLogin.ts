import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService, {
    LoginPayload,
} from "@/components/feature/Authentication/api/AuthService";
import CompanyProfileService from "@/components/feature/CompanyProfile/api/CompanyProfileService";
import { storeAuthSession } from "@/services/authStorage";
import { ROUTES } from "@/utils";

export const useCompanyLogin = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const clearError = () => setError(null);

    const login = async (formData: LoginPayload) => {
        setIsLoading(true);
        setError(null);

        try {
            console.log("Attempting login for:", formData.email);
            const response = await AuthService.loginCompany(formData);

            if (!response.success || !response.data) {
                throw new Error(
                    response.message ||
                        "Failed to login. Please check your credentials."
                );
            }

            console.log("Login successful, storing auth session");
            storeAuthSession(response.data);

            // Check if profile is complete
            try {
                console.log(
                    "Fetching company profile for ID:",
                    response.data.companyId
                );
                const company = await CompanyProfileService.getCompany();
                console.log("Company profile response:", company);

                if (company) {
                    console.log("Company data:", company);

                    // Check if essential fields are missing
                    const isProfileIncomplete =
                        !company.name ||
                        !company.phone ||
                        !company.streetAddress;
                    console.log("Is profile incomplete?", isProfileIncomplete);

                    if (isProfileIncomplete) {
                        console.log(
                            "Profile incomplete, navigating to complete-profile"
                        );
                        navigate("/complete-profile", { replace: true });
                        return response.data;
                    }

                    // Profile is complete, navigate to dashboard
                    console.log("Profile is complete, navigating to dashboard");
                    navigate(ROUTES.DASHBOARD, { replace: true });
                    return response.data;
                }
            } catch (profileError: any) {
                console.error("Failed to fetch company profile:", profileError);
                // If we can't check, maybe let them go to dashboard or stay?
                // For now, proceed to dashboard, but maybe log it.
            }

            console.log("Navigating to dashboard");
            navigate(ROUTES.DASHBOARD, { replace: true });
            return response.data;
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Failed to login. Please check your credentials.";
            setError(message);
            console.error("Login error:", err);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        login,
        isLoading,
        error,
        clearError,
    };
};
