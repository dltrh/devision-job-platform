package com.devision.job_manager_company.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Event published when a company changes their country.
 * Triggers shard migration in job-manager-auth.
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
