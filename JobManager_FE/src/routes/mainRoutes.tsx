import { Route } from "react-router-dom";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import ProfilePage from "@/pages/profile/ProfilePage";
import { NotificationsPage } from "@/pages/notifications";
import { ROUTES } from "@/utils";
import { PublicRoute } from "@/components/common/PublicRoute";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { PremiumRoute } from "@/components/common/PremiumRoute";

export const mainRoutes = [
    <Route
        key="home"
        path={ROUTES.HOME}
        element={
            <PublicRoute>
                <Landing />
            </PublicRoute>
        }
    />,
    <Route
        key="dashboard"
        path={ROUTES.DASHBOARD}
        element={
            <ProtectedRoute>
                <Dashboard />
            </ProtectedRoute>
        }
    />,
    <Route
        key="profile"
        path={ROUTES.PROFILE}
        element={
            <ProtectedRoute>
                <ProfilePage />
            </ProtectedRoute>
        }
    />,
    <Route
        key="notifications"
        path="/notifications"
        element={
            <PremiumRoute featureName="Notifications">
                <NotificationsPage />
            </PremiumRoute>
        }
    />,
];
