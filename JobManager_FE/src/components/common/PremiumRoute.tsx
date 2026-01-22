import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/utils/constants";
import { useSubscription } from "@/components/feature/ApplicantSearch/hooks/useSubscription";
import { Crown, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";

interface PremiumRouteProps {
    children: React.ReactNode;
    featureName?: string;
}

/**
 * Component to protect routes that require premium subscription
 * Shows upgrade prompt if user is not a premium subscriber
 */
export const PremiumRoute = ({ children, featureName = "This feature" }: PremiumRouteProps) => {
    const { isAuthenticated } = useAuth();
    const { isPremium, isLoading } = useSubscription();

    // If not authenticated, redirect to home
    if (!isAuthenticated) {
        return <Navigate to={ROUTES.HOME} replace />;
    }

    // Show loading state while checking subscription
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Checking subscription...</p>
                </div>
            </div>
        );
    }

    // Show upgrade prompt if not premium
    if (!isPremium) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="max-w-md w-full mx-4">
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Crown className="w-8 h-8 text-amber-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Premium Feature</h2>
                        <p className="text-gray-600 mb-6">
                            {featureName} is only available for premium subscribers. Upgrade your
                            plan to unlock this and other exclusive features.
                        </p>
                        <div className="space-y-3">
                            <Button
                                variant="primary"
                                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                                onClick={() => (window.location.href = ROUTES.SUBSCRIPTION)}
                            >
                                <Crown className="w-4 h-4 mr-2" />
                                Upgrade to Premium
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => window.history.back()}
                            >
                                Go Back
                            </Button>
                        </div>
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <h3 className="text-sm font-medium text-gray-900 mb-3">
                                Premium Benefits Include:
                            </h3>
                            <ul className="text-sm text-gray-600 space-y-2 text-left">
                                <li className="flex items-center">
                                    <Lock className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0" />
                                    Real-time notifications
                                </li>
                                <li className="flex items-center">
                                    <Lock className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0" />
                                    Advanced applicant search filters
                                </li>
                                <li className="flex items-center">
                                    <Lock className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0" />
                                    Saved search profiles
                                </li>
                                <li className="flex items-center">
                                    <Lock className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0" />
                                    Priority support
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
