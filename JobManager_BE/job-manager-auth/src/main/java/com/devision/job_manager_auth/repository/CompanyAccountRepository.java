package com.devision.job_manager_auth.repository;

import com.devision.job_manager_auth.entity.AuthProvider;
import com.devision.job_manager_auth.entity.CompanyAccount;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyAccountRepository extends JpaRepository<CompanyAccount, UUID> {

    /**
     * REGISTRATION QUERIES
     */

    // Find account by email
    Optional<CompanyAccount> findByEmail(String email);

    // Find account by id
    Optional<CompanyAccount> findById(UUID id);

    // Check if email already exists
    boolean existsByEmail(String email);

    // Find account by activation token
    Optional<CompanyAccount> findByActivationToken(String activationToken);

    // Find account by password reset token
    Optional<CompanyAccount> findByPasswordResetToken(String passwordResetToken);

    /**
     * SSO QUERIES
     */

    // Find account by SSO provider and provider ID
    Optional<CompanyAccount> findByAuthProviderAndSsoProviderId(AuthProvider authProvider, String ssoProviderId);

    // Check if SSO account already exists
    boolean existsByAuthProviderAndSsoProviderId(AuthProvider authProvider, String ssoProviderId);

    /**
     * LOGIN AND SECURITY QUERIES
     */

    // Find activated account by email
    Optional<CompanyAccount> findByEmailAndIsActivatedTrue(String email);

    // Find by email and not locked for login validation
    Optional<CompanyAccount> findByEmailAndIsLockedFalse(String email);

    // For secure login - activated and not locked
    Optional<CompanyAccount> findByEmailAndIsActivatedTrueAndIsLockedFalse(String email);

    /**
     * BRUTE-FORCE PROTECTION
     */

    // Increment failed login attempts
    @Modifying
    @Transactional
    @Query("UPDATE CompanyAccount c SET c.failedLoginAttempts = c.failedLoginAttempts + 1, " +
            "c.lastFailedLoginTime = :failedTime WHERE c.email = :email")
    void incrementFailedLoginAttempts(
            @Param("email") String email,
            @Param("failedTime") LocalDateTime failedTime
    );

    // Reset failed login attempts on successful login
    @Modifying
    @Transactional
    @Query("UPDATE CompanyAccount c SET c.failedLoginAttempts = 0, c.lastFailedLoginTime = null " +
            "WHERE c.email = :email")
    void resetFailedLoginAttempts(@Param("email") String email);

    // Lock account
    @Modifying
    @Transactional
    @Query("UPDATE CompanyAccount c SET c.isLocked = true WHERE c.email = :email")
    void lockAccount(@Param("email") String email);

    // Unlock account
    @Modifying
    @Transactional
    @Query("UPDATE CompanyAccount c SET c.isLocked = false, c.failedLoginAttempts = 0 WHERE c.email = :email")
    void unlockAccount(@Param("email") String email);

    // Activate account
    @Modifying
    @Transactional
    @Query("UPDATE CompanyAccount c SET c.isActivated = true, c.activationToken = null, " +
            "c.activationTokenExpiry = null WHERE c.email = :email")
    void activateAccount(@Param("email") String email);
}
