import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/utils/constants";

interface PublicRouteProps {
    children: React.ReactNode;
}

/**
 * Component for routes that should only be accessible to non-authenticated users
 * Redirects to dashboard if user is already authenticated
 */
export const PublicRoute = ({ children }: PublicRouteProps) => {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Navigate to={ROUTES.DASHBOARD} replace />;
    }

    return <>{children}</>;
};
