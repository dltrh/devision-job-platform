package com.devision.job_manager_jobpost.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Event received from Company service when a company's country is changed.
 * This is a mirror class that matches the event published by Company service.
 *
 * When this event is received, JobPost service will:
 * 1. Find all job posts belonging to this company
 * 2. Publish JobPostCountryChangedEvent for each affected job post
 *
 * This enables Ultimo 4.3.1 requirement for instant applicant notifications
 * when job location criteria change.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyCountryChangedEvent {
    /**
     * The company whose country was changed
     */
    private UUID companyId;

    /**
     * Previous country code before the change (e.g., "VN", "AUS")
     */
    private String previousCountryCode;

    /**
     * New country code after the change (e.g., "VN", "AUS")
     */
    private String newCountryCode;

    /**
     * Timestamp when the country was changed
     */
    private LocalDateTime changedAt;
}
