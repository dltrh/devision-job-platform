import type {
    Company,
    CompanyProfile,
    CompanyFormData,
    ProfileFormData,
    CompanyMedia,
    MediaUploadPayload,
    MediaReorderItem,
} from "../types";
import { getAccessToken, getStoredUser } from "@/services/authStorage";
import { API_BASE_URL } from "@/utils/constants";
import { API_ENDPOINTS } from "@/utils/backendAPIs";

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
    const token = getAccessToken();
    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };
};

const getAuthHeadersFormData = (): HeadersInit => {
    const token = getAccessToken();
    return {
        Authorization: `Bearer ${token}`,
    };
};

// Get company ID from storage
const getCompanyId = (): string => {
    const user = getStoredUser();
    return user?.companyId || "";
};

// Helper to build full URL from endpoint
const buildUrl = (endpoint: string): string => {
    // Ensure API_BASE_URL exists
    if (!API_BASE_URL) {
        throw new Error("API_BASE_URL is not defined");
    }

    // Remove trailing slash from base URL if present
    const baseUrl = API_BASE_URL.endsWith("/")
        ? API_BASE_URL.slice(0, -1)
        : API_BASE_URL;

    // Ensure endpoint starts with slash
    const normalizedEndpoint = endpoint.startsWith("/")
        ? endpoint
        : `/${endpoint}`;

    return `${baseUrl}${normalizedEndpoint}`;
};

// Company APIs (GET/PUT /companies/{companyId})
export const getCompany = async (): Promise<Company> => {
    const companyId = getCompanyId();
    const response = await fetch(
        buildUrl(API_ENDPOINTS.COMPANIES.GET(companyId)),
        {
            method: "GET",
            headers: getAuthHeaders(),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch company");
    }

    const data = await response.json();
    return data.data || data;
};

export const updateCompany = async (
    companyData: Partial<CompanyFormData>
): Promise<Company> => {
    const companyId = getCompanyId();
    const response = await fetch(
        buildUrl(API_ENDPOINTS.COMPANIES.UPDATE(companyId)),
        {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(companyData),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to update company");
    }

    const data = await response.json();
    return data.data || data;
};

// Profile APIs (GET/PUT /companies/{companyId}/profile)
export const getCompanyProfile = async (): Promise<CompanyProfile> => {
    const companyId = getCompanyId();
    const response = await fetch(
        buildUrl(API_ENDPOINTS.COMPANIES.PROFILE(companyId)),
        {
            method: "GET",
            headers: getAuthHeaders(),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch company profile");
    }

    const data = await response.json();
    return data.data || data;
};

export const updateCompanyProfile = async (
    profileData: Partial<ProfileFormData>
): Promise<CompanyProfile> => {
    const companyId = getCompanyId();
    // Convert foundedYear to number if present
    const payload = {
        ...profileData,
        foundedYear: profileData.foundedYear
            ? parseInt(profileData.foundedYear, 10)
            : undefined,
    };
    const response = await fetch(
        buildUrl(API_ENDPOINTS.COMPANIES.PROFILE(companyId)),
        {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to update company profile");
    }

    const data = await response.json();
    return data.data || data;
};

// Media APIs
export const uploadLogo = async (file: File): Promise<{ url: string }> => {
    const companyId = getCompanyId();
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
        buildUrl(API_ENDPOINTS.COMPANIES.MEDIA.LOGO(companyId)),
        {
            method: "POST",
            headers: getAuthHeadersFormData(),
            body: formData,
        }
    );

    if (!response.ok) {
        throw new Error("Failed to upload logo");
    }

    const data = await response.json();
    return data.data || data;
};

export const uploadBanner = async (file: File): Promise<{ url: string }> => {
    const companyId = getCompanyId();
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
        buildUrl(API_ENDPOINTS.COMPANIES.MEDIA.BANNER(companyId)),
        {
            method: "POST",
            headers: getAuthHeadersFormData(),
            body: formData,
        }
    );

    if (!response.ok) {
        throw new Error("Failed to upload banner");
    }

    const data = await response.json();
    return data.data || data;
};

export const uploadMedia = async (
    payload: MediaUploadPayload
): Promise<CompanyMedia> => {
    const companyId = getCompanyId();
    const formData = new FormData();
    formData.append("file", payload.file);
    formData.append("type", payload.mediaType); // Backend expects 'type' field
    if (payload.title) formData.append("title", payload.title);
    if (payload.description)
        formData.append("description", payload.description);

    const response = await fetch(
        buildUrl(API_ENDPOINTS.COMPANIES.MEDIA.BASE(companyId)),
        {
            method: "POST",
            headers: getAuthHeadersFormData(),
            body: formData,
        }
    );

    if (!response.ok) {
        throw new Error("Failed to upload media");
    }

    const data = await response.json();
    return data.data || data;
};

export const getAllMedia = async (): Promise<CompanyMedia[]> => {
    const companyId = getCompanyId();
    const response = await fetch(
        buildUrl(API_ENDPOINTS.COMPANIES.MEDIA.BASE(companyId)),
        {
            method: "GET",
            headers: getAuthHeaders(),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch media");
    }

    const data = await response.json();
    // Handle paginated response: { data: { content: [...], page, size, totalElements, ... } }
    if (data.data?.content) {
        return data.data.content;
    }
    // Fallback for direct array response
    return Array.isArray(data.data)
        ? data.data
        : Array.isArray(data)
          ? data
          : [];
};

export const getMediaById = async (mediaId: string): Promise<CompanyMedia> => {
    const companyId = getCompanyId();
    const response = await fetch(
        buildUrl(API_ENDPOINTS.COMPANIES.MEDIA.GET(companyId, mediaId)),
        {
            method: "GET",
            headers: getAuthHeaders(),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch media");
    }

    const data = await response.json();
    return data.data || data;
};

export const updateMedia = async (
    mediaId: string,
    updateData: { title?: string; description?: string; displayOrder?: number }
): Promise<CompanyMedia> => {
    const companyId = getCompanyId();
    const response = await fetch(
        buildUrl(API_ENDPOINTS.COMPANIES.MEDIA.GET(companyId, mediaId)),
        {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(updateData),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to update media");
    }

    const data = await response.json();
    return data.data || data;
};

export const reorderMedia = async (
    reorderItems: MediaReorderItem[]
): Promise<void> => {
    const companyId = getCompanyId();
    // Backend expects array of UUIDs in desired order, not objects with mediaId/displayOrder
    // Sort by displayOrder and extract just the IDs
    const orderedIds = reorderItems
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((item) => item.mediaId);

    const response = await fetch(
        buildUrl(API_ENDPOINTS.COMPANIES.MEDIA.REORDER(companyId)),
        {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(orderedIds),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to reorder media");
    }
};

export const deleteMedia = async (mediaId: string): Promise<void> => {
    const companyId = getCompanyId();
    const response = await fetch(
        buildUrl(API_ENDPOINTS.COMPANIES.MEDIA.GET(companyId, mediaId)),
        {
            method: "DELETE",
            headers: getAuthHeaders(),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to delete media");
    }
};

export const getDialCodes = async (): Promise<
    Array<{ code: string; name: string }>
> => {
    const response = await fetch(buildUrl(API_ENDPOINTS.COMPANIES.DIAL_CODES), {
        method: "GET",
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw new Error("Failed to fetch dial codes");
    }

    const data = await response.json();
    return data.data || [];
};

const CompanyProfileService = {
    getCompany,
    updateCompany,
    getCompanyProfile,
    updateCompanyProfile,
    uploadLogo,
    uploadBanner,
    uploadMedia,
    getAllMedia,
    getMediaById,
    updateMedia,
    reorderMedia,
    deleteMedia,
    getDialCodes,
};

export default CompanyProfileService;
