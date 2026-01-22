package com.devision.job_manager_auth.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Event published when a company account is locked due to security reasons.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyAccountLockedEvent {
    private UUID companyId;
    private String email;
    private String reason;
    private LocalDateTime lockedAt;
}
