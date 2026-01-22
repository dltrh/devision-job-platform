package com.devision.job_manager_auth.dto.internal;

import com.devision.job_manager_auth.entity.AuthProvider;
import com.devision.job_manager_auth.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private Long expiresIn; // seconds until token expires
    private UUID companyId;
    private String email;
    private Role role;
    private AuthProvider authProvider;
}
