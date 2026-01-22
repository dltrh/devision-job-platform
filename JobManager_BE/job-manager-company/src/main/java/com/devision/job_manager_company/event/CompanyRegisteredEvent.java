package com.devision.job_manager_company.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Event received when a new company account is registered.
 * Triggers creation of company profile.
 * Must match the event published by job-manager-auth.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyRegisteredEvent {
    private UUID companyId;
    private String email;
    private String countryCode;
    private String activationToken;
    private LocalDateTime registeredAt;
}
