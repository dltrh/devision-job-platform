package com.devision.job_manager_auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * LoginAttempt entity - tracks login attempts for security monitoring.
 */
@Entity
@Table(name = "login_attempt", indexes = {
    @Index(name = "idx_login_attempt_account_time", columnList = "account_id, attempted_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginAttempt {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private CompanyAccount account;

    @Column(name = "ip_address", length = 64)
    private String ipAddress;

    @Column(name = "attempted_at", nullable = false)
    private LocalDateTime attemptedAt;

    @Column(name = "is_success", nullable = false)
    private Boolean isSuccess;

    @Column(name = "user_agent", length = 512)
    private String userAgent;

    @Column(name = "failure_reason", length = 255)
    private String failureReason;
}
