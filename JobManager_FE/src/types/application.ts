// Application types for job applicant subsystem integration

export const APPLICATION_STATUS = {
    PENDING: "PENDING",
    REVIEWING: "REVIEWING",
    INTERVIEWING: "INTERVIEWING",
    OFFERED: "OFFERED",
    REJECTED: "REJECTED",
    ARCHIVED: "ARCHIVED",
} as const;

export type ApplicationStatus =
    (typeof APPLICATION_STATUS)[keyof typeof APPLICATION_STATUS];

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
    PENDING: "Pending Review",
    REVIEWING: "Under Review",
    INTERVIEWING: "Interview Stage",
    OFFERED: "Offer Extended",
    REJECTED: "Rejected",
    ARCHIVED: "Archived",
};

export interface Application {
    id: string;
    applicantId: string;
    applicantName: string;
    applicantEmail: string;
    applicantPhone?: string;
    jobPostId: string;
    jobTitle: string;
    status: ApplicationStatus;
    submittedAt: string;
    cvUrl?: string;
    coverLetter?: string;
    notes?: string;
    // Metadata to indicate source subsystem
    sourceSubsystem: "job-applicant";
    createdAt: string;
    updatedAt: string;
}

export interface ApplicationListFilters {
    status?: ApplicationStatus;
    searchQuery?: string;
    sortBy?: "newest" | "oldest" | "name";
}

export interface ApplicationsState {
    pending: Application[];
    archived: Application[];
    isLoading: boolean;
    error: string | null;
}
