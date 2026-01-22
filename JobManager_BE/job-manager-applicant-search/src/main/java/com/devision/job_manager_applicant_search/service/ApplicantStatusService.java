package com.devision.job_manager_applicant_search.service;

import com.devision.job_manager_applicant_search.model.ApplicantStatusType;
import com.devision.job_manager_applicant_search.model.CompanyApplicantStatus;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Service for managing company-specific applicant statuses (Warning/Favorite).
 */
public interface ApplicantStatusService {

    /**
     * Set or update the status for an applicant.
     * 
     * @param companyId The company setting the status
     * @param applicantId The applicant being marked
     * @param status The status to set (FAVORITE, WARNING, or NONE to clear)
     * @param note Optional note explaining the status
     * @return The created/updated status entity
     */
    CompanyApplicantStatus setStatus(UUID companyId, UUID applicantId, ApplicantStatusType status, String note);

    /**
     * Get the status for a specific applicant.
     * 
     * @param companyId The company
     * @param applicantId The applicant
     * @return The status, or null if no status is set
     */
    CompanyApplicantStatus getStatus(UUID companyId, UUID applicantId);

    /**
     * Get statuses for multiple applicants (for enriching search results).
     * 
     * @param companyId The company
     * @param applicantIds Collection of applicant IDs
     * @return Map of applicant ID to status type
     */
    Map<UUID, ApplicantStatusType> getStatusesForApplicants(UUID companyId, Collection<UUID> applicantIds);

    /**
     * Clear the status for an applicant.
     * 
     * @param companyId The company
     * @param applicantId The applicant
     */
    void clearStatus(UUID companyId, UUID applicantId);

    /**
     * Get all applicants with a specific status.
     * 
     * @param companyId The company
     * @param status The status to filter by
     * @return List of status entries
     */
    List<CompanyApplicantStatus> getApplicantsByStatus(UUID companyId, ApplicantStatusType status);
}
