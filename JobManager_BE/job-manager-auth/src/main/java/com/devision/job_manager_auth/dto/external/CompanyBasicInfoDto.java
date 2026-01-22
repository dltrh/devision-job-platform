package com.devision.job_manager_auth.dto.external;

import com.devision.job_manager_auth.entity.AuthProvider;
import com.devision.job_manager_auth.entity.Country;
import com.devision.job_manager_auth.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CompanyBasicInfoDto {
    private UUID id;
    private String email;
    private Role role;
    private Country country;
    private AuthProvider authProvider;
    private boolean isActivated;
    private LocalDateTime createdAt;
}
