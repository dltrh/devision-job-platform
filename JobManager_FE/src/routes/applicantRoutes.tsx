import { Route } from "react-router-dom";
import { ROUTES } from "@/utils";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import ApplicantSearchPage from "@/pages/applicantSearch";

export const applicantRoutes = [
    <Route
        key="applicant-search"
        path={ROUTES.APPLICANT_SEARCH}
        element={
            <ProtectedRoute>
                <ApplicantSearchPage />
            </ProtectedRoute>
        }
    />,
];
