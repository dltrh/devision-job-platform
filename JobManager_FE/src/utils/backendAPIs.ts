// Backend API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    PROFILE: "/auth/profile",
  },

  // Job Posts
  JOB_POSTS: {
    BASE: "/job-posts",
    LIST: "/job-posts",
    CREATE: "/job-posts",
    GET: (id: string) => `/job-posts/${id}`,
    UPDATE: (id: string) => `/job-posts/${id}`,
    DELETE: (id: string) => `/job-posts/${id}`,
    PUBLISH: (id: string) => `/job-posts/${id}/publish`,
    UNPUBLISH: (id: string) => `/job-posts/${id}/unpublish`,
    STATS: (id: string) => `/job-posts/${id}/stats`,
    BY_COMPANY: (companyId: string) => `/job-posts/company/${companyId}`,
    BY_COMPANY_PUBLISHED: (companyId: string) =>
      `/job-posts/company/${companyId}/published`,
  },

  // Applications
  APPLICATIONS: {
    BASE: "/applications",
    // Get applications by job post with filters
    BY_JOB_POST: (jobPostId: string) => `/applications/job-posts/${jobPostId}`,
    // Get application counts
    COUNTS: (jobPostId: string) => `/applications/job-posts/${jobPostId}/counts`,
    // Archive/Unarchive operations
    ARCHIVE: (applicationId: string) => `/applications/${applicationId}/archive`,
    UNARCHIVE: (applicationId: string) => `/applications/${applicationId}/unarchive`,
    // Download files
    DOWNLOAD_FILE: (applicationId: string, docType: string) =>
      `/applications/${applicationId}/files/${docType}`,
  },

// Companies
  COMPANIES: {
    BASE: "/companies",
    LIST: "/companies",
    GET: (id: string) => `/companies/${id}`,
    UPDATE: (id: string) => `/companies/${id}`,
    // Profile endpoints
    PROFILE: (id: string) => `/companies/${id}/profile`,
    // Media endpoints
    MEDIA: {
      BASE: (id: string) => `/companies/${id}/media`,
      LOGO: (id: string) => `/companies/${id}/media/logo`,
      BANNER: (id: string) => `/companies/${id}/media/banner`,
      GET: (companyId: string, mediaId: string) =>
        `/companies/${companyId}/media/${mediaId}`,
      REORDER: (id: string) => `/companies/${id}/media/reorder`,
    },
    // Dial codes
    DIAL_CODES: "/companies/dial-codes",
  },

  // Applicant Search
  APPLICANT_SEARCH: {
    // Search applicants via JM backend (proxies to JA service)
    SEARCH: "/internal/applicants/search",
    // Skills endpoints for filter dropdown
    SKILLS: "/internal/applicants/skills",
    SKILLS_SEARCH: "/internal/applicants/skills/search",
  },

  // Search Profiles (Premium Feature)
  SEARCH_PROFILES: {
    // External endpoint (read-only)
    ACTIVE: "/search-profiles/active",
    // Internal endpoints (via gateway routing)
    BASE: "/internal/search-profiles",
    CREATE: "/internal/search-profiles",
    GET: (id: string) => `/internal/search-profiles/${id}`,
    UPDATE: (id: string) => `/internal/search-profiles/${id}`,
    DELETE: (id: string) => `/internal/search-profiles/${id}`,
    BY_COMPANY: (companyId: string) =>
      `/internal/search-profiles/company/${companyId}`,
    ACTIVE_BY_COMPANY: (companyId: string) =>
      `/internal/search-profiles/company/${companyId}/active`,
    UPDATE_STATUS: (id: string) => `/internal/search-profiles/${id}/status`,
  },

  SUBSCRIPTIONS: {
    STATUS: (companyId: string) => `/subscriptions/company/${companyId}`,
    IS_PREMIUM: (companyId: string) =>
      `/subscriptions/company/${companyId}/is-premium`,
    PLANS: "/subscriptions/plans",
    PLAN: (planId: string) => `/subscriptions/plans/${planId}`,
    CREATE_PAYMENT_INTENT: "/subscriptions/payment-intent",
    PURCHASE: "/subscriptions/purchase",
    HISTORY: (companyId: string) => `/subscriptions/company/${companyId}/history`,
    CANCEL: (subscriptionId: string) => `/internal/subscriptions/${subscriptionId}/cancel`,
    GET_BY_COMPANY: (companyId: string) => `/internal/subscriptions/company/${companyId}`,
    RENEW: (companyId: string) => `/subscriptions/company/${companyId}/renew`,
  },

  // Payment
  PAYMENT: {
    HISTORY_BY_PAYER: (payerId: string, payerType: string) =>
      `/payment/payer/${payerId}/type/${payerType}`,
  },
} as const;
