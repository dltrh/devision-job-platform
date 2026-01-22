// Application constants

// API Configuration
// All requests should go through the gateway (port 8080), not individual services
// In production with HTTPS, VITE_GATEWAY_API_URL should be empty so requests go through nginx proxy
const gatewayUrl = import.meta.env.VITE_GATEWAY_API_URL;
export const API_BASE_URL = gatewayUrl ? `${gatewayUrl}/api` : "/api";

export const JA_USER_SERVICE_URL = import.meta.env.VITE_JA_USER_SERVICE_URL;
export const JA_AUTH_TOKEN = import.meta.env.VITE_JA_AUTH_TOKEN;

export const NGROK_HEADERS = {
    "ngrok-skip-browser-warning": "true",
    "User-Agent": "DEVisionJobManager/1.0",
};

export const API_TIMEOUT = 30000; // 30 seconds

// Authentication
export const TOKEN_KEY = "auth_token";
export const REFRESH_TOKEN_KEY = "refresh_token";
export const USER_KEY = "user_data";

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Validation
export const MIN_PASSWORD_LENGTH = 6;
export const MAX_PASSWORD_LENGTH = 128;
export const MIN_NAME_LENGTH = 2;
export const MAX_NAME_LENGTH = 100;

// Routes
export const ROUTES = {
    HOME: "/",
    LOGIN: "/login",
    REGISTER: "/register",
    DASHBOARD: "/dashboard",
    JOBS: "/jobs",
    JOB_POSTS: "/job-posts",
    JOB_POST_CREATE: "/job-posts/create",
    JOB_POST_EDIT: "/job-posts/:id/edit",
    JOB_POST_DETAIL: "/job-posts/:id",
    JOB_DETAIL: "/jobs/:id",
    JOB_POST_APPLICATIONS: "/job-posts/:jobPostId/applications",
    APPLICATION_DETAILS: "/job-posts/:jobPostId/applications/:applicationId",
    PROFILE: "/profile",
    SETTINGS: "/settings",
    APPLICANT_SEARCH: "/applicant-search",
    SUBSCRIPTION: "/subscription",
} as const;

// Status
export const JOB_STATUS = {
    DRAFT: "DRAFT",
    PUBLISHED: "PUBLISHED",
    CLOSED: "CLOSED",
    ARCHIVED: "ARCHIVED",
    PRIVATE: "PRIVATE",
} as const;

export const APPLICATION_STATUS = {
    PENDING: "pending",
    REVIEWED: "reviewed",
    ACCEPTED: "accepted",
    REJECTED: "rejected",
} as const;

// Employment Types
export const EMPLOYMENT_TYPES = {
    FULL_TIME: "FULL_TIME",
    PART_TIME: "PART_TIME",
    CONTRACT: "CONTRACT",
    INTERNSHIP: "INTERNSHIP",
    FRESHER: "FRESHER",
} as const;

export const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
    FULL_TIME: "Full-time",
    PART_TIME: "Part-time",
    CONTRACT: "Contract",
    INTERNSHIP: "Internship",
    FRESHER: "Fresher",
};

// Education Degrees (for applicant search)
export const EDUCATION_DEGREES = {
    BACHELOR: "BACHELOR",
    MASTER: "MASTER",
    DOCTORATE: "DOCTORATE",
    OTHER: "OTHER",
} as const;

export const EDUCATION_DEGREE_LABELS: Record<string, string> = {
    BACHELOR: "Bachelor",
    MASTER: "Master",
    DOCTORATE: "Doctorate",
    OTHER: "Other",
};

// Education degree hierarchy (for filtering: minimum degree)
export const EDUCATION_DEGREE_HIERARCHY: Record<string, number> = {
    OTHER: 0,
    BACHELOR: 1,
    MASTER: 2,
    DOCTORATE: 3,
};

// Subscription Status
export const SUBSCRIPTION_STATUS = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
    EXPIRED: "EXPIRED",
    CANCELLED: "CANCELLED",
} as const;

// Sort options for applicant search
export const APPLICANT_SORT_OPTIONS = {
    NEWEST: "newest",
    OLDEST: "oldest",
    // TODO: Salary sorting - uncomment when JA adds salary support
    // SALARY_ASCENDING: "salaryAsc",
    // SALARY_DESCENDING: "salaryDesc",
} as const;

export const APPLICANT_SORT_LABELS: Record<string, string> = {
    newest: "Newest",
    oldest: "Oldest",
    // TODO: Salary sorting - uncomment when JA adds salary support
    // salaryAsc: "Salary ascending",
    // salaryDesc: "Salary descending",
};

export const SKILLS_ENDPOINT = "/api/v1/skills";

// Salary Types (matching backend SalaryType enum)
export const SALARY_TYPES = {
    RANGE: "RANGE",
    ABOUT: "ABOUT",
    UP_TO: "UP_TO",
    FROM: "FROM",
    NEGOTIABLE: "NEGOTIABLE",
} as const;

export const SALARY_TYPE_LABELS: Record<string, string> = {
    RANGE: "Range",
    ABOUT: "About",
    UP_TO: "Up to",
    FROM: "From",
    NEGOTIABLE: "Negotiable",
};

// Kafka Sync Status
export const SYNC_STATUS = {
    SYNCED: "SYNCED",
    PENDING: "PENDING",
    UPDATING: "UPDATING",
    FAILED: "FAILED",
} as const;

// Error Messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: "Network error. Please check your connection.",
    UNAUTHORIZED: "You are not authorized to perform this action.",
    NOT_FOUND: "The requested resource was not found.",
    SERVER_ERROR: "Server error. Please try again later.",
    VALIDATION_ERROR: "Please check your input and try again.",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: "Successfully logged in.",
    LOGOUT_SUCCESS: "Successfully logged out.",
    SAVE_SUCCESS: "Successfully saved.",
    DELETE_SUCCESS: "Successfully deleted.",
    UPDATE_SUCCESS: "Successfully updated.",
} as const;
