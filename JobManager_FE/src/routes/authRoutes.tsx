import { Route } from "react-router-dom";
import LoginPage from "@/pages/auth/LoginPage";
import RegistrationPage from "@/pages/auth/RegistrationPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import ActivateAccountPage from "@/pages/auth/ActivateAccountPage";
import CompleteProfilePage from "@/pages/auth/CompleteProfilePage";
import { PublicRoute } from "@/components/common/PublicRoute";

export const authRoutes = [
    <Route
        key="login"
        path="/login"
        element={
            <PublicRoute>
                <LoginPage />
            </PublicRoute>
        }
    />,
    <Route
        key="register"
        path="/register"
        element={
            <PublicRoute>
                <RegistrationPage />
            </PublicRoute>
        }
    />,
    <Route
        key="forgot-password"
        path="/forgot-password"
        element={
            <PublicRoute>
                <ForgotPasswordPage />
            </PublicRoute>
        }
    />,
    <Route
        key="reset-password"
        path="/reset-password"
        element={
            <PublicRoute>
                <ResetPasswordPage />
            </PublicRoute>
        }
    />,
    <Route
        key="activate-account"
        path="/activate"
        element={<ActivateAccountPage />}
    />,
    <Route
        key="complete-profile"
        path="/complete-profile"
        element={<CompleteProfilePage />}
    />,
];
