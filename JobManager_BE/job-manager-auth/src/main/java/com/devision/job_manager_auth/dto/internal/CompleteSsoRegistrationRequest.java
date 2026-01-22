package com.devision.job_manager_auth.dto.internal;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompleteSsoRegistrationRequest {
    @NotBlank(message = "Temporary token for SSO Registration is required")
    private String token;

    @NotBlank(message = "Country is required")
    private String country;
}
