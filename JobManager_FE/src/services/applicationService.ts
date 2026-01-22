// Application API Service
import httpClient from "./httpClient";
import { API_ENDPOINTS } from "@/utils/backendAPIs";
import { getCompanyId } from "./authStorage";
import { ApiResponse } from "@/types";

// Application Response from backend (matches ApplicationResponseDto)
export interface ApplicationResponse {
    id: string;
    userId: string;
    jobPostId: string;
    resumeUrl: string | null;
    coverLetterUrl: string | null;
    status: string;
    userNotes: string | null;
    adminNotes: string | null;
    appliedAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

// Paginated response structure
export interface PageableResponse<T> {
    content: T[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
}

// Application counts response
export interface ApplicationCounts {
    pending: number;
    archived: number;
}

// Fetch applications params
export interface FetchApplicationsParams {
    jobPostId: string;
    page?: number;
    size?: number;
    archived?: boolean; // true = archived only, false = pending only, null/undefined = all
}

/**
 * Fetch applications for a job post with optional filtering
 */
export const fetchApplications = async (
    params: FetchApplicationsParams
): Promise<PageableResponse<ApplicationResponse>> => {
    const companyId = getCompanyId();
    
    if (!companyId) {
        throw new Error("Company ID not found. Please log in again.");
    }

    const { jobPostId, page = 0, size = 20, archived } = params;

    // Build query parameters
    const queryParams = new URLSearchParams({
        companyId,
        page: page.toString(),
        size: size.toString(),
    });

    // Add archived filter if specified
    if (archived !== undefined && archived !== null) {
        queryParams.append("archived", archived.toString());
    }

    const response = await httpClient.get<ApiResponse<PageableResponse<ApplicationResponse>>>(
        `${API_ENDPOINTS.APPLICATIONS.BY_JOB_POST(jobPostId)}?${queryParams.toString()}`
    );

    return response.data.data;
};

/**
 * Get application counts (pending and archived) for a job post
 */
export const fetchApplicationCounts = async (
    jobPostId: string
): Promise<ApplicationCounts> => {
    const companyId = getCompanyId();
    
    if (!companyId) {
        throw new Error("Company ID not found. Please log in again.");
    }

    const response = await httpClient.get<ApiResponse<ApplicationCounts>>(
        `${API_ENDPOINTS.APPLICATIONS.COUNTS(jobPostId)}?companyId=${companyId}`
    );

    return response.data.data;
};

/**
 * Archive an application
 */
export const archiveApplication = async (
    applicationId: string,
    jobPostId: string
): Promise<void> => {
    const companyId = getCompanyId();
    
    if (!companyId) {
        throw new Error("Company ID not found. Please log in again.");
    }

    await httpClient.post<ApiResponse<void>>(
        API_ENDPOINTS.APPLICATIONS.ARCHIVE(applicationId),
        {
            companyId,
            jobPostId,
        }
    );
};

/**
 * Unarchive an application
 */
export const unarchiveApplication = async (
    applicationId: string
): Promise<void> => {
    const companyId = getCompanyId();
    
    if (!companyId) {
        throw new Error("Company ID not found. Please log in again.");
    }

    await httpClient.post<ApiResponse<void>>(
        API_ENDPOINTS.APPLICATIONS.UNARCHIVE(applicationId),
        {
            companyId,
        }
    );
};

/**
 * Download application file (CV or Cover Letter)
 * Returns blob URL that can be used in an iframe or download link
 */
export const downloadApplicationFile = async (
    applicationId: string,
    docType: "RESUME" | "COVER_LETTER"
): Promise<string> => {
    const response = await httpClient.get(
        API_ENDPOINTS.APPLICATIONS.DOWNLOAD_FILE(applicationId, docType),
        {
            responseType: "blob", // Important: tells axios to handle binary data
        }
    );

    // Create a blob URL from the response
    const blob = new Blob([response.data], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);
    
    return blobUrl;
};

/**
 * Open application file in new tab
 */
export const openApplicationFileInNewTab = async (
    applicationId: string,
    docType: "RESUME" | "COVER_LETTER"
): Promise<void> => {
    try {
        const blobUrl = await downloadApplicationFile(applicationId, docType);
        window.open(blobUrl, "_blank");
        
        // Clean up blob URL after a delay (5 seconds)
        setTimeout(() => {
            URL.revokeObjectURL(blobUrl);
        }, 5000);
    } catch (error) {
        console.error(`Error opening ${docType}:`, error);
        throw error;
    }
};