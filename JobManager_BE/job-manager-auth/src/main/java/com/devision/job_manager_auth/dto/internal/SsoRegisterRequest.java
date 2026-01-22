package com.devision.job_manager_auth.dto.internal;

import com.devision.job_manager_auth.entity.AuthProvider;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class SsoRegisterRequest extends BaseCompanyRegisterRequest {

    @NotNull(message = "Auth provider is required")
    private AuthProvider provider;

    @NotBlank(message = "SSO provider ID is required")
    private String ssoProviderId;

    // Optional name from SSO provider (e.g., Google profile name)
    private String name;
}
