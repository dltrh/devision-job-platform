package com.devision.job_manager_jobpost.service.external;

import com.devision.job_manager_jobpost.dto.external.ApplicationResponseDto;
import com.devision.job_manager_jobpost.dto.external.PageableResponseDto;

import java.util.UUID;

public interface ApplicationService {

    /**
     * Get applications for a job post with pagination and filtering
     * @param jobPostId The job post ID
     * @param companyId The company ID (for archive filtering)
     * @param page Page number (0-indexed)
     * @param size Page size
     * @param archived Filter by archive status (true = archived only, false = pending only, null = all)
     * @return Paginated list of applications
     */
    PageableResponseDto<ApplicationResponseDto> getApplicationsByJobPost(
            UUID jobPostId,
            UUID companyId,
            int page,
            int size,
            Boolean archived);

    /**
     * Archive an application
     * @param applicationId The application ID
     * @param companyId The company ID
     * @param jobPostId The job post ID
     */
    void archiveApplication(UUID applicationId, UUID companyId, UUID jobPostId);

    /**
     * Unarchive an application
     * @param applicationId The application ID
     * @param companyId The company ID
     */
    void unarchiveApplication(UUID applicationId, UUID companyId);

    /**
     * Download application file (Resume or Cover Letter)
     * @param applicationId The application ID
     * @param docType Document type: "RESUME" or "COVER_LETTER"
     * @return File content as byte array
     */
    byte[] downloadApplicationFile(UUID applicationId, String docType);

    /**
     * Get count of pending and archived applications for a job post
     * @param jobPostId The job post ID
     * @param companyId The company ID
     * @return Array with [pendingCount, archivedCount]
     */
    long[] getApplicationCounts(UUID jobPostId, UUID companyId);
}
