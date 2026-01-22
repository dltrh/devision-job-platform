import { Route } from "react-router-dom";
import { JobPostsPage } from "@/pages/jobPosts";
import { CreateJobPostPage } from "@/pages/jobPosts/CreateJobPost";
import JobPostDetailPage from "@/pages/jobPosts/JobPostDetailPage";
import { ROUTES } from "@/utils";

/**
 * Job-related routes
 * All routes for job posts, job applications, and job management
 */
export const jobRoutes = [
    <Route
        key="job-posts"
        path={ROUTES.JOB_POSTS}
        element={<JobPostsPage />}
    />,
    <Route
        key="job-post-create"
        path={ROUTES.JOB_POST_CREATE}
        element={<CreateJobPostPage />}
    />,
    <Route
        key="job-post-edit"
        path={ROUTES.JOB_POST_EDIT}
        element={<CreateJobPostPage />}
    />,
    <Route
        key="job-post-detail"
        path={ROUTES.JOB_POST_DETAIL}
        element={<JobPostDetailPage />}
    />,
];
