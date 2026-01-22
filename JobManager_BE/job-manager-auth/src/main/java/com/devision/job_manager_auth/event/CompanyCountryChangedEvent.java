package com.devision.job_manager_auth.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Event received when a company changes their country.
 * Triggers shard migration for the company account.
 * Must match the event published by job-manager-company.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyCountryChangedEvent {
    private UUID companyId;
    private String previousCountryCode;
    private String newCountryCode;
    private LocalDateTime changedAt;
}
