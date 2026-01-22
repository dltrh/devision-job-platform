package com.devision.job_manager_applicant_search.repository;

import com.devision.job_manager_applicant_search.model.ApplicantStatusType;
import com.devision.job_manager_applicant_search.model.CompanyApplicantStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for company applicant status operations.
 */
@Repository
public interface CompanyApplicantStatusRepository extends JpaRepository<CompanyApplicantStatus, UUID> {

    /**
     * Find status for a specific applicant by a specific company.
     */
    Optional<CompanyApplicantStatus> findByCompanyIdAndApplicantId(UUID companyId, UUID applicantId);

    /**
     * Find statuses for multiple applicants by a specific company (for bulk enrichment).
     */
    List<CompanyApplicantStatus> findByCompanyIdAndApplicantIdIn(UUID companyId, Collection<UUID> applicantIds);

    /**
     * Find all applicants with a specific status for a company.
     */
    List<CompanyApplicantStatus> findByCompanyIdAndStatus(UUID companyId, ApplicantStatusType status);

    /**
     * Find all statuses for a company.
     */
    List<CompanyApplicantStatus> findByCompanyId(UUID companyId);

    /**
     * Delete status for a specific applicant by a specific company.
     */
    void deleteByCompanyIdAndApplicantId(UUID companyId, UUID applicantId);
}
