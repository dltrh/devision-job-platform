import httpClient from "@/services/httpClient";
import { API_ENDPOINTS } from "@/utils/backendAPIs";
import { getStoredUser } from "@/services/authStorage";
import type {
    ApiResponse,
    SearchProfileResponse,
    CreateSearchProfileRequest,
    UpdateSearchProfileRequest,
    UpdateStatusRequest,
    ApplicantSearchResponse,
    SearchState,
    Country,
} from "../types";

// Helper Functions
const getCompanyId = (): string => {
    const user = getStoredUser();
    return user?.companyId || "";
};

// Applicant Search API
// Connects to JM backend which proxies to JA service
// Updated 2026-01-04 to use new JA API params

export const searchApplicants = async (
    searchState: SearchState
): Promise<ApiResponse<ApplicantSearchResponse>> => {
    // Build query params from search state
    const params = new URLSearchParams();

    if (searchState.username) {
        params.append("username", searchState.username);
    }
    // FTS Query - Full-Text Search across Work Experience, Objective Summary, and Technical Skills
    if (searchState.ftsQuery) {
        params.append("ftsQuery", searchState.ftsQuery);
    }
    if (searchState.countryCode) {
        params.append("countryCode", searchState.countryCode);
    }
    if (searchState.city) {
        params.append("city", searchState.city);
    }
    if (searchState.education) {
        params.append("education", searchState.education);
    }
    if (searchState.workExperience) {
        params.append("workExperience", searchState.workExperience);
    }
    if (searchState.employmentTypes.length > 0) {
        searchState.employmentTypes.forEach((type) => {
            params.append("employmentTypes", type);
        });
    }
    if (searchState.skillIds.length > 0) {
        try {
            // Resolve IDs to Names for JA API (which expects names)
            const skillsResponse = await getSkills();
            if (skillsResponse.success && skillsResponse.data) {
                searchState.skillIds.forEach((id) => {
                    const skill = skillsResponse.data.find((s) => s.id === id);
                    if (skill) {
                        params.append("skills", skill.name);
                    }
                });
            }
        } catch (error) {
            console.error("Failed to resolve skill IDs for search", error);
        }
    }
    // TODO: Salary filtering - uncomment when JA adds salary support
    // if (searchState.minSalary !== undefined) {
    //     params.append("minSalary", searchState.minSalary.toString());
    // }
    // if (searchState.maxSalary !== undefined) {
    //     params.append("maxSalary", searchState.maxSalary.toString());
    // }
    if (searchState.sortBy) {
        params.append("sortBy", searchState.sortBy);
    }
    if (searchState.statusFilter && searchState.statusFilter !== 'ALL') {
        params.append("statusFilter", searchState.statusFilter);
    }
    params.append("page", searchState.page.toString());
    params.append("size", searchState.pageSize.toString());

    const companyId = getCompanyId();
    const response = await httpClient.get<ApiResponse<ApplicantSearchResponse>>(
        `${API_ENDPOINTS.APPLICANT_SEARCH.SEARCH}?${params.toString()}`,
        companyId ? { headers: { 'X-Company-Id': companyId } } : undefined
    );
    return response.data;
};

// Search Profile APIs (Premium Feature)
export const createSearchProfile = async (
    request: Omit<CreateSearchProfileRequest, "companyId">
): Promise<ApiResponse<SearchProfileResponse>> => {
    const companyId = getCompanyId();
    const payload: CreateSearchProfileRequest = {
        ...request,
        companyId,
    };
    const response = await httpClient.post<ApiResponse<SearchProfileResponse>>(
        API_ENDPOINTS.SEARCH_PROFILES.CREATE,
        payload
    );
    return response.data;
};

export const getSearchProfile = async (
    profileId: string
): Promise<ApiResponse<SearchProfileResponse>> => {
    const response = await httpClient.get<ApiResponse<SearchProfileResponse>>(
        API_ENDPOINTS.SEARCH_PROFILES.GET(profileId)
    );
    return response.data;
};

export const updateSearchProfile = async (
    profileId: string,
    request: UpdateSearchProfileRequest
): Promise<ApiResponse<SearchProfileResponse>> => {
    const response = await httpClient.put<ApiResponse<SearchProfileResponse>>(
        API_ENDPOINTS.SEARCH_PROFILES.UPDATE(profileId),
        request
    );
    return response.data;
};

export const deleteSearchProfile = async (
    profileId: string
): Promise<ApiResponse<void>> => {
    const response = await httpClient.delete<ApiResponse<void>>(
        API_ENDPOINTS.SEARCH_PROFILES.DELETE(profileId)
    );
    return response.data;
};

export const getCompanySearchProfiles = async (): Promise<
    ApiResponse<SearchProfileResponse[]>
> => {
    const companyId = getCompanyId();
    const response = await httpClient.get<ApiResponse<SearchProfileResponse[]>>(
        API_ENDPOINTS.SEARCH_PROFILES.BY_COMPANY(companyId)
    );
    return response.data;
};

export const getCompanyActiveSearchProfiles = async (): Promise<
    ApiResponse<SearchProfileResponse[]>
> => {
    const companyId = getCompanyId();
    const response = await httpClient.get<ApiResponse<SearchProfileResponse[]>>(
        API_ENDPOINTS.SEARCH_PROFILES.ACTIVE_BY_COMPANY(companyId)
    );
    return response.data;
};

export const updateSearchProfileStatus = async (
    profileId: string,
    request: UpdateStatusRequest
): Promise<ApiResponse<SearchProfileResponse>> => {
    const response = await httpClient.patch<ApiResponse<SearchProfileResponse>>(
        API_ENDPOINTS.SEARCH_PROFILES.UPDATE_STATUS(profileId),
        request
    );
    return response.data;
};

// Countries API (from auth service)
export const getCountries = async (): Promise<ApiResponse<Country[]>> => {
    const response = await httpClient.get<ApiResponse<Country[]>>(
        "/auth/countries"
    );
    return response.data;
};

// Skills API (from JA service via JM backend)
export interface Skill {
    id: string;
    name: string;
    usageCount?: number;
}

export const getSkills = async (): Promise<ApiResponse<Skill[]>> => {
    const response = await httpClient.get<ApiResponse<Skill[]>>(
        API_ENDPOINTS.APPLICANT_SEARCH.SKILLS
    );
    return response.data;
};

// Applicant Status APIs (Warning/Favorite feature)
export interface SetApplicantStatusRequest {
    status: 'NONE' | 'WARNING' | 'FAVORITE';
    note?: string;
}

export interface ApplicantStatusResponse {
    id: string;
    companyId: string;
    applicantId: string;
    status: 'NONE' | 'WARNING' | 'FAVORITE';
    note?: string;
    createdAt: string;
    updatedAt: string;
}

export const setApplicantStatus = async (
    applicantId: string,
    request: SetApplicantStatusRequest
): Promise<ApiResponse<ApplicantStatusResponse | null>> => {
    const companyId = getCompanyId();
    const response = await httpClient.put<ApiResponse<ApplicantStatusResponse | null>>(
        `${API_ENDPOINTS.APPLICANT_SEARCH.SEARCH.replace('/search', '')}/${applicantId}/status`,
        request,
        { headers: { 'X-Company-Id': companyId } }
    );
    return response.data;
};

export const getApplicantStatus = async (
    applicantId: string
): Promise<ApiResponse<ApplicantStatusResponse | null>> => {
    const companyId = getCompanyId();
    const response = await httpClient.get<ApiResponse<ApplicantStatusResponse | null>>(
        `${API_ENDPOINTS.APPLICANT_SEARCH.SEARCH.replace('/search', '')}/${applicantId}/status`,
        { headers: { 'X-Company-Id': companyId } }
    );
    return response.data;
};

export const clearApplicantStatus = async (
    applicantId: string
): Promise<ApiResponse<void>> => {
    const companyId = getCompanyId();
    const response = await httpClient.delete<ApiResponse<void>>(
        `${API_ENDPOINTS.APPLICANT_SEARCH.SEARCH.replace('/search', '')}/${applicantId}/status`,
        { headers: { 'X-Company-Id': companyId } }
    );
    return response.data;
};

// Export as service object
const ApplicantSearchService = {
    // Search
    searchApplicants,
    // Search Profiles
    createSearchProfile,
    getSearchProfile,
    updateSearchProfile,
    deleteSearchProfile,
    getCompanySearchProfiles,
    getCompanyActiveSearchProfiles,
    updateSearchProfileStatus,
    // Countries
    getCountries,
    // Skills
    getSkills,
    // Applicant Status
    setApplicantStatus,
    getApplicantStatus,
    clearApplicantStatus,
};

export default ApplicantSearchService;

