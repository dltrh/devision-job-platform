package com.devision.job_manager_auth.dto.external;

import com.devision.job_manager_auth.entity.AuthProvider;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO for external services to check authentication status.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyAuthStatusDto {
    private UUID companyId;
    private String email;
    private boolean isActivated;
    private boolean isLocked;
    private AuthProvider authProvider;
}
