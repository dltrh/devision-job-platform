// Job Post transformation utilities
import { JobPost, JobStatus } from "@/types";
import { JOB_STATUS, SYNC_STATUS } from "@/utils/constants";

/**
 * Transform backend JobPost to include computed frontend fields
 */
export const transformJobPost = (jobPost: JobPost): JobPost => {
    return {
        ...jobPost,
        // Add jobPostId alias for backward compatibility
        jobPostId: jobPost.id,

        // Compute status from boolean flags
        status: getJobStatus(jobPost),

        // Create aliases for better naming
        location: jobPost.locationCity,
        expiryDate: jobPost.expiryAt,
        publishedDate: jobPost.postedAt || undefined,

        // Default values
        applicationsCount: jobPost.applicationsCount || 0,
        syncStatus: jobPost.syncStatus || SYNC_STATUS.SYNCED,
    };
};

/**
 * Determine job status from database boolean flags
 * Logic:
 * - Draft: Not yet published (isPublished = false)
 * - Private: Published but private (isPublished = true, isPrivate = true)
 * - Published: Published and public (isPublished = true, isPrivate = false)
 */
export const getJobStatus = (jobPost: JobPost): JobStatus => {
    // First check if it's published at all
    if (!jobPost.isPublished) {
        return JOB_STATUS.DRAFT;
    }
    
    // If published, check visibility
    if (jobPost.isPrivate) {
        return JOB_STATUS.PRIVATE;
    }
    
    return JOB_STATUS.PUBLISHED;
};

/**
 * Format salary for display based on SalaryType enum
 * RANGE: "1000 - 1500 USD" (requires both min and max)
 * ABOUT: "About 1000 USD" (uses min or max)
 * UP_TO: "Up to 2000 USD" (uses max)
 * FROM: "From 3000 USD" (uses min)
 * NEGOTIABLE: "Negotiable" (no amounts needed)
 */
export const formatSalary = (
    min: number | null,
    max: number | null,
    type: string,
    note: string | null
): string => {
    const formatAmount = (amount: number): string => {
        return new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    let formattedSalary: string;

    // Format based on salary type
    switch (type) {
        case "RANGE":
            if (min !== null && max !== null) {
                return `${formatAmount(min)} – ${formatAmount(max)} USD`;
            }
            return "Salary Range Not Specified";

        case "ABOUT":
            const aboutAmount = min !== null ? min : max;
            if (aboutAmount !== null) {
                return `About ${formatAmount(aboutAmount)} USD`;
            }
            return "About (amount not specified)";

        case "UP_TO":
            if (max !== null) {
                return `Up to ${formatAmount(max)} USD`;
            }
            return "Up to (amount not specified)";

        case "FROM":
            if (min !== null) {
                return `From ${formatAmount(min)} USD`;
            }
            return "From (amount not specified)";

        case "NEGOTIABLE":
            return "Negotiable";

        default:
            return "Negotiable";
    }
};

/**
 * Check if job post is expiring soon (within 3 days)
 */
export const isExpiringSoon = (expiryAt: string): boolean => {
    const expiryDate = new Date(expiryAt);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
};

/**
 * Format expiry date with urgency awareness
 */
export const formatExpiryDate = (expiryAt: string | null | undefined): string => {

	if (!expiryAt) {
		return "N/A";
	}

    const date = new Date(expiryAt);

    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return `Expired ${Math.abs(diffDays)} days ago`;
    } else if (diffDays === 0) {
        return "Expires today";
    } else if (diffDays === 1) {
        return "Expires tomorrow";
    } else if (diffDays <= 7) {
        return `Expires in ${diffDays} days`;
    } else {
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }
};
