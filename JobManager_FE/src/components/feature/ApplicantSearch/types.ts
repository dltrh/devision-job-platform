// Applicant Search Types

import { EDUCATION_DEGREES, EMPLOYMENT_TYPES, APPLICANT_SORT_OPTIONS } from "@/utils/constants";

// Education Degree enum
export type EducationDegree = typeof EDUCATION_DEGREES[keyof typeof EDUCATION_DEGREES];

// Employment Type enum
export type EmploymentType = typeof EMPLOYMENT_TYPES[keyof typeof EMPLOYMENT_TYPES];

// Sort options
export type ApplicantSortOption = typeof APPLICANT_SORT_OPTIONS[keyof typeof APPLICANT_SORT_OPTIONS];

// Applicant Status Type (for Warning/Favorite feature)
export type ApplicantStatusType = 'NONE' | 'WARNING' | 'FAVORITE';

// Status Filter Type (for filtering search results)
export type StatusFilterType = 'ALL' | 'FAVORITE' | 'WARNING' | 'MARKED';

// ============================================================
// Search State (Frontend UI State)
// ============================================================

export interface SearchState {
    /** Username/name search (firstName, lastName). Maps to JA's 'username' param. */
    username: string;
    /**
     * Full-Text Search query for searching across Work Experience, Objective Summary, 
     * and Technical Skills fields. Case-insensitive.
     */
    ftsQuery?: string;
    countryCode?: string;
    /** City filter. Maps to JA's 'city' param. */
    city?: string;
    employmentTypes: EmploymentType[];
    /** Education level. Maps to JA's 'education' param. */
    education?: EducationDegree;
    /** Work experience keywords. Maps to JA's 'workExperience' param. */
    workExperience?: string;
    /**
     * Minimum salary expectation.
     * TODO: Salary for Search - JA's UserResponse doesn't have salary fields.
     * These are ONLY used for creating/editing search profiles (for Kafka notification matching).
     * They are NOT sent to the search API because JA cannot filter by salary.
     * When JA adds salary to UserResponse, enable salary filtering in ApplicantSearchService.ts.
     */
    minSalary?: number;
    maxSalary?: number;
    skillIds: string[];
    sortBy: ApplicantSortOption;
    page: number;
    pageSize: number;
    /** Filter by company-specific status (ALL, FAVORITE, WARNING, MARKED) */
    statusFilter?: StatusFilterType;
}

export const DEFAULT_SEARCH_STATE: SearchState = {
    username: "",
    ftsQuery: undefined,
    countryCode: undefined,
    city: undefined,
    employmentTypes: [],
    education: undefined,
    workExperience: undefined,
    // TODO: Salary filtering - uncomment when JA adds salary support
    minSalary: undefined,
    maxSalary: undefined,
    skillIds: [],
    sortBy: "newest",
    page: 0,
    pageSize: 10,
    statusFilter: 'ALL',
};

// ============================================================
// Saved Profile State (Frontend UI State)
// ============================================================

export interface SavedProfileState {
    selectedProfileId?: string;
    isEditing: boolean;
}

// ============================================================
// API Request/Response Types
// ============================================================

// Search Profile - Create Request
export interface CreateSearchProfileRequest {
    companyId: string;
    profileName: string;
    countryCode?: string;
    city?: string;
    education?: EducationDegree;
    workExperience?: string;
    employmentTypes?: EmploymentType[];
    skillIds?: string[];
    isActive?: boolean;
    /**
     * TODO: Salary for Search - These are saved to profiles for Kafka notification matching.
     * They are NOT used in search API because JA's UserResponse doesn't have salary.
     */
    minSalary?: number;
    maxSalary?: number;
}

// Search Profile - Update Request
export interface UpdateSearchProfileRequest {
    profileName?: string;
    countryCode?: string;
    city?: string;
    education?: EducationDegree;
    workExperience?: string;
    employmentTypes?: EmploymentType[];
    skillIds?: string[];
    isActive?: boolean;
    /**
     * TODO: Salary for Search - These are saved to profiles for Kafka notification matching.
     * They are NOT used in search API because JA's UserResponse doesn't have salary.
     */
    minSalary?: number;
    maxSalary?: number;
}

// Search Profile - Update Status Request
export interface UpdateStatusRequest {
    isActive: boolean;
}

// Search Profile - Response (Internal)
export interface SearchProfileResponse {
    id: string;
    companyId: string;
    profileName: string;
    countryCode?: string;
    city?: string;
    education?: EducationDegree;
    workExperience?: string;
    employmentTypes: EmploymentType[];
    skillIds: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    /**
     * TODO: Salary for Search - Saved for Kafka notification matching.
     */
    minSalary?: number;
    maxSalary?: number;
}

// Search Profile - Active Response (External, read-only)
export interface ActiveSearchProfileResponse {
    id: string;
    companyId: string;
    profileName: string;
    countryCode?: string;
    city?: string;
    education?: EducationDegree;
    workExperience?: string;
    employmentTypes: EmploymentType[];
    skillIds: string[];
    // TODO: Salary filtering - uncomment when JA adds salary support
    // minSalary?: number;
    // maxSalary?: number;
}

// ============================================================
// Applicant Types
// Aligned with JA service's UserResponse
// ============================================================

export interface ApplicantSkill {
    id: string;
    name: string;
    usageCount?: number;
}

export interface ApplicantEducation {
    id: string;
    degree: EducationDegree;
    fieldOfStudy: string;
    institution: string;
    gpa?: number;
    country?: string;
    startYear: number;
    endYear?: number;
}

export interface ApplicantWorkExperience {
    id: string;
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    description?: string;
}

export interface ApplicantCountry {
    id: string;
    name: string;
    abbreviation: string;
}

/**
 * Applicant model - aligned with JA service's UserResponse.
 * 
 * Updated 2026-01-04 to include new fields: address, city
 */
export interface Applicant {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    fullName: string;
    phone?: string;
    /** Street address */
    address?: string;
    /** City name */
    city?: string;
    avatarUrl?: string;
    /** Maps from JA's objectiveSummary */
    bio?: string;
    /** Nested country object from JA */
    country?: ApplicantCountry;
    /** Derived from country.abbreviation for backwards compatibility */
    countryCode?: string;
    premium?: boolean;
    active?: boolean;
    skills: ApplicantSkill[];
    // JA now returns these in search response
    education: ApplicantEducation[];
    workExperience: ApplicantWorkExperience[];
    employmentTypes: EmploymentType[];
    createdAt: string;
    updatedAt: string;
    // TODO: Salary - JA service does not have salary fields yet
    // desiredSalary?: number;
    // Company-specific status (Warning/Favorite)
    companyStatus?: ApplicantStatusType;
    companyStatusNote?: string;
}

// Applicant Search Response (Paginated)
export interface ApplicantSearchResponse {
    content: Applicant[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
    first: boolean;
}

// ============================================================
// Common API Response Wrapper
// ============================================================

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// Paged response wrapper
export interface PagedResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
    first: boolean;
}

// ============================================================
// Country type (from auth service)
// ============================================================

export interface Country {
    code: string;
    displayName: string;
}
