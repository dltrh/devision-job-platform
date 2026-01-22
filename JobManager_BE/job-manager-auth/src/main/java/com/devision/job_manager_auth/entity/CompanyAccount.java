package com.devision.job_manager_auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * CompanyAccount entity - handles authentication concerns only.
 * Profile data is managed by the Company service.
 */
@Entity
@Table(name = "company_account")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Country country;

    @Column(name = "auth_provider", nullable = false, length = 32)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AuthProvider authProvider = AuthProvider.LOCAL;

    @Column(length = 255)
    private String ssoProviderId;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Role role = Role.COMPANY;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActivated = false;

    @Column(length = 255)
    private String activationToken;

    @Column
    private LocalDateTime activationTokenExpiry;

    @Column(length = 255)
    private String passwordResetToken;

    @Column
    private LocalDateTime passwordResetTokenExpiry;

    @Column(nullable = false)
    @Builder.Default
    private Integer failedLoginAttempts = 0;

    @Column
    private LocalDateTime lastFailedLoginTime;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isLocked = false;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
