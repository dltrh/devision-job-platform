package com.devision.job_manager_jobpost.repository;

import com.devision.job_manager_jobpost.model.ApplicationArchive;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApplicationArchiveRepository extends JpaRepository<ApplicationArchive, UUID> {

    /**
     * Check if an application is archived by a specific company
     */
    boolean existsByApplicationIdAndCompanyId(UUID applicationId, UUID companyId);

    /**
     * Find archive record for a specific application and company
     */
    Optional<ApplicationArchive> findByApplicationIdAndCompanyId(UUID applicationId, UUID companyId);

    /**
     * Get all archived application IDs for a specific job post and company
     */
    @Query("SELECT aa.applicationId FROM ApplicationArchive aa " +
            "WHERE aa.jobPostId = :jobPostId AND aa.companyId = :companyId")
    List<UUID> findArchivedApplicationIdsByJobPostAndCompany(
            @Param("jobPostId") UUID jobPostId,
            @Param("companyId") UUID companyId);

    /**
     * Delete archive record (unarchive)
     */
    void deleteByApplicationIdAndCompanyId(UUID applicationId, UUID companyId);

    /**
     * Count archived applications for a job post
     */
    long countByJobPostIdAndCompanyId(UUID jobPostId, UUID companyId);
}
