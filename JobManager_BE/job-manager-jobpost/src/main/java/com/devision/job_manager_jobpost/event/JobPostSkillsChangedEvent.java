package com.devision.job_manager_jobpost.event;

import com.devision.job_manager_jobpost.model.EmploymentType;
import com.devision.job_manager_jobpost.model.SalaryType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Event published when skills are added or removed from a job post.
 * This is CRITICAL for Ultimo requirement 4.3.1:
 * "Profile updates must be propagated to a Kafka topic when the company
 * changes skills of a job post. This enables all subscribed Job Applicants
 * to be notified instantly if the applicant's technical background matches
 * the job post criteria."
 *
 * Structure mirrors JobPostPublishedEvent to maintain consistency
 * across all job post events consumed by applicant notification service.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPostSkillsChangedEvent {
    // Core identifiers (same as JobPostPublished)
    private UUID jobPostId;
    private UUID companyId;
    private String title;
    private String description;
    private String locationCity;
    private String countryCode;

    // Salary information (same as JobPostPublished)
    private SalaryType salaryType;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;

    // Job type and status (same as JobPostPublished)
    private List<EmploymentType> employmentTypes;
    private boolean fresher;

    // Publishing timestamps (same as JobPostPublished)
    private LocalDateTime publishedAt;
    private LocalDateTime expiryAt;

    /**
     * Skills that were added in this update
     */
    private List<UUID> addedSkills;

    /**
     * Skills that were removed in this update
     */
    private List<UUID> removedSkills;

    /**
     * All current skills after the update
     * (Used by applicant service for matching)
     */
    private List<UUID> currentSkills;

    /**
     * Timestamp when skills were changed
     */
    private LocalDateTime changedAt;
}
