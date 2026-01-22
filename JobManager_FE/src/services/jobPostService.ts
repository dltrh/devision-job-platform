// Job Post API Service
import httpClient from "./httpClient";
import { API_ENDPOINTS } from "@/utils/backendAPIs";
import { transformJobPost } from "@/utils/jobPostHelpers";
import { getCompanyId } from "./authStorage";
import {
    JobPost,
    JobPostFilters,
    CreateJobPostRequest,
    UpdateJobPostRequest,
    ApiResponse,
    PaginatedResponse,
} from "@/types";

/**
 * Fetch all job posts with optional filters
 */
export const fetchJobPosts = async (
    filters?: JobPostFilters
): Promise<PaginatedResponse<JobPost>> => {
    const companyId = getCompanyId();

    if (!companyId) {
        throw new Error("Company ID not found. Please log in again.");
    }

    const page = filters?.page || 0;
    const size = filters?.pageSize || 10;

    const response = await httpClient.get<ApiResponse<any>>(
        `${API_ENDPOINTS.JOB_POSTS.BY_COMPANY(companyId)}?page=${page}&size=${size}`
    );

    // Backend returns Page<JobPostDto> in the data field
    const pageData = response.data.data;

    // Transform backend data to include computed fields
    const transformedData = pageData.content.map(transformJobPost);

    return {
        data: transformedData,
        meta: {
            currentPage: pageData.number,
            totalPages: pageData.totalPages,
            totalItems: pageData.totalElements,
            itemsPerPage: pageData.size,
        },
    };
};

/**
 * Fetch a single job post by ID
 */
export const fetchJobPostById = async (id: string): Promise<JobPost> => {
    const response = await httpClient.get<ApiResponse<JobPost>>(
        API_ENDPOINTS.JOB_POSTS.GET(id)
    );

    return transformJobPost(response.data.data);
};

/**
 * Create a new job post
 */
export const createJobPost = async (
    data: CreateJobPostRequest
): Promise<JobPost> => {
    const response = await httpClient.post<ApiResponse<JobPost>>(
        API_ENDPOINTS.JOB_POSTS.CREATE,
        data
    );

    return transformJobPost(response.data.data);
};

/**
 * Update an existing job post
 */
export const updateJobPost = async (
    id: string,
    data: UpdateJobPostRequest
): Promise<JobPost> => {
    const response = await httpClient.put<ApiResponse<JobPost>>(
        API_ENDPOINTS.JOB_POSTS.UPDATE(id),
        data
    );

    return transformJobPost(response.data.data);
};

/**
 * Delete a job post
 */
export const deleteJobPost = async (id: string): Promise<void> => {
    await httpClient.delete(API_ENDPOINTS.JOB_POSTS.DELETE(id));
};

/**
 * Publish a job post
 */
export const publishJobPost = async (id: string): Promise<JobPost> => {
    const response = await httpClient.post<ApiResponse<JobPost>>(
        API_ENDPOINTS.JOB_POSTS.PUBLISH(id)
    );

    return transformJobPost(response.data.data);
};

/**
 * Unpublish a job post (formerly archive)
 */
export const unpublishJobPost = async (id: string): Promise<JobPost> => {
    const response = await httpClient.post<ApiResponse<JobPost>>(
        API_ENDPOINTS.JOB_POSTS.UNPUBLISH(id)
    );

    return transformJobPost(response.data.data);
};

/**
 * Archive a job post - alias for unpublishJobPost for backward compatibility
 * @deprecated Use unpublishJobPost instead
 */
export const archiveJobPost = unpublishJobPost;

/**
 * Get job post statistics
 */
export const fetchJobPostStats = async (
    id: string
): Promise<{
    applicationsCount: number;
    viewsCount: number;
    syncStatus: string;
}> => {
    const response = await httpClient.get<
        ApiResponse<{
            applicationsCount: number;
            viewsCount: number;
            syncStatus: string;
        }>
    >(API_ENDPOINTS.JOB_POSTS.STATS(id));

    return response.data.data;
};
