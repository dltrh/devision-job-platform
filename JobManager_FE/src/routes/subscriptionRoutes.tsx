import { Route } from "react-router-dom";
import SubscriptionManagementPage from "@/pages/subscription/SubscriptionManagementPage";
import { PaymentFlowPage } from "@/components/feature/Payment";
import { ROUTES } from "@/utils";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";

export const subscriptionRoutes = [
    <Route
        key="subscription"
        path={ROUTES.SUBSCRIPTION}
        element={
            <ProtectedRoute>
                <SubscriptionManagementPage />
            </ProtectedRoute>
        }
    />,
    <Route
        key="subscription-upgrade"
        path={`${ROUTES.SUBSCRIPTION}/upgrade`}
        element={
            <ProtectedRoute>
                <PaymentFlowPage />
            </ProtectedRoute>
        }
    />,
    <Route
        key="subscription-manage"
        path={`${ROUTES.SUBSCRIPTION}/manage`}
        element={
            <ProtectedRoute>
                <PaymentFlowPage />
            </ProtectedRoute>
        }
    />,
];
