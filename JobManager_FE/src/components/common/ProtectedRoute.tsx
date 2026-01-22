import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/utils/constants";
import { getCompany } from "@/components/feature/CompanyProfile/api/CompanyProfileService";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

/**
 * Component to protect routes that require authentication
 * Redirects to login if user is not authenticated
 * Redirects to complete-profile if profile is incomplete
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();
    const [isCheckingProfile, setIsCheckingProfile] = useState(true);
    const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);

    useEffect(() => {
        const checkProfile = async () => {
            // Skip profile check if we're already on the complete-profile page
            if (location.pathname === "/complete-profile") {
                setIsCheckingProfile(false);
                return;
            }

            if (!isAuthenticated) {
                setIsCheckingProfile(false);
                return;
            }

            try {
                const company = await getCompany();

                // Check if essential fields are missing
                const incomplete =
                    !company.name || !company.phone || !company.streetAddress;

                setIsProfileIncomplete(incomplete);
            } catch (error) {
                console.error("Failed to check company profile:", error);
                // If 404 or company doesn't exist, consider profile incomplete
                if (
                    error instanceof Error &&
                    error.message.includes("Failed to fetch company")
                ) {
                    setIsProfileIncomplete(true);
                } else {
                    // For other errors, allow access (fail open)
                    setIsProfileIncomplete(false);
                }
            } finally {
                setIsCheckingProfile(false);
            }
        };

        checkProfile();
    }, [isAuthenticated, location.pathname]);

    if (!isAuthenticated) {
        return <Navigate to={ROUTES.HOME} replace />;
    }

    // Show loading state while checking profile
    if (isCheckingProfile) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect to complete profile if profile is incomplete
    if (isProfileIncomplete && location.pathname !== "/complete-profile") {
        return <Navigate to="/complete-profile" replace />;
    }

    return <>{children}</>;
};
