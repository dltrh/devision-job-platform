package com.devision.job_manager_auth.dto.internal;

import com.devision.job_manager_auth.entity.AuthProvider;
import jakarta.persistence.Column;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PendingSsoRegistration implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    private String name;

    @NotBlank(message = "SSO Provider ID is required")
    private String ssoProviderId;

    @NotBlank(message = "SSO Provider is required")
    private AuthProvider authProvider;

    private LocalDateTime createdAt;

}