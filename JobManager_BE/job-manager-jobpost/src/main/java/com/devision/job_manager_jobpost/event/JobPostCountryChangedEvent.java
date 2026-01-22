package com.devision.job_manager_jobpost.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Event published when the country of a job post is changed.
 * This is CRITICAL for Ultimo requirement 4.3.1:
 * "Profile updates must be propagated to a Kafka topic when the company
 * changes country of a job post. This enables all subscribed Job Applicants
 * to be notified instantly if the applicant's country matches the job post
 * criteria."
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPostCountryChangedEvent {
    private UUID jobPostId;
    private UUID companyId;
    private String title;
    private String locationCity;

    /**
     * Previous country code before the change
     */
    private String previousCountryCode;

    /**
     * New country code after the change
     */
    private String newCountryCode;

    /**
     * Current skills (for applicant matching)
     * Included so applicant service can match both country AND skills
     */
    private List<UUID> currentSkills;

    private LocalDateTime changedAt;
}
