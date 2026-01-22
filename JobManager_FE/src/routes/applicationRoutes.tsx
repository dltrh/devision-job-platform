import { Route } from "react-router-dom";
import { ROUTES } from "@/utils";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { ApplicationsPage } from "@/pages/applications";

export const applicationRoutes = [
    <Route
        key="job-post-applications"
        path={ROUTES.JOB_POST_APPLICATIONS}
        element={
            <ProtectedRoute>
                <ApplicationsPage />
            </ProtectedRoute>
        }
    />,
    // ApplicationDetailsPage route commented out - not needed for current implementation
    // Viewing CV/Cover Letter is done in new browser tabs
    // <Route
    //     key="application-details"
    //     path={ROUTES.APPLICATION_DETAILS}
    //     element={
    //         <ProtectedRoute>
    //             <ApplicationDetailsPage />
    //         </ProtectedRoute>
    //     }
    // />,
];
