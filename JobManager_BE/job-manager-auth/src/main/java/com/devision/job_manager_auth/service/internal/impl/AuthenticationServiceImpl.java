package com.devision.job_manager_auth.service.internal.impl;

import com.devision.job_manager_auth.config.sharding.ShardContext;
import com.devision.job_manager_auth.dto.internal.*;
import com.devision.job_manager_auth.entity.AuthProvider;
import com.devision.job_manager_auth.entity.CompanyAccount;
import com.devision.job_manager_auth.entity.Country;
import com.devision.job_manager_auth.entity.Role;
import com.devision.job_manager_auth.event.CompanyActivatedEvent;
import com.devision.job_manager_auth.event.CompanyAccountLockedEvent;
import com.devision.job_manager_auth.event.CompanyRegisteredEvent;
import com.devision.job_manager_auth.repository.CompanyAccountRepository;
import com.devision.job_manager_auth.service.internal.*;
import com.nimbusds.jwt.JWTClaimsSet;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.redis.core.RedisTemplate;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationServiceImpl implements AuthenticationService {

    private final CompanyAccountRepository companyAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JweTokenService jweTokenService;
    private final EventPublisherService eventPublisherService;
    private final EmailService emailService;
    private final ShardLookupService shardLookupService;
    private final ShardDirectQueryService shardDirectQueryService;
    private final RedisTemplate<String, String> redisTemplate;

    private static final String SESSION_INVALIDATION_PREFIX = "session-invalidated:";

    @Value("${app.activation.token-expiration}")
    private long activationTokenExpiration;

    @Value("${app.password-reset.token-expiration:3600000}") // Default 1 hour
    private long passwordResetTokenExpiration;

    @Override
    @Transactional
    public ApiResponse<String> registerCompany(RegisterRequest request) {

        if (shardDirectQueryService.emailExistsInAnyShard(request.getEmail())) {
            log.warn("Registration failed: Email '{}' already exists in another shard", request.getEmail());
            throw new IllegalArgumentException("Email already in use");
        }

        Country country = request.getCountry();
        String shardKey = country.getShardKey();

        // Set shard context BEFORE saving
        ShardContext.setShardKey(shardKey);


        String activationToken = UUID.randomUUID().toString();
        LocalDateTime tokenExpiry = LocalDateTime.now().plus(activationTokenExpiration, ChronoUnit.MILLIS);

        CompanyAccount account = CompanyAccount.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .authProvider(AuthProvider.LOCAL)
                .role(Role.COMPANY)
                .country(request.getCountry())
                .isActivated(false)
                .activationToken(activationToken)
                .activationTokenExpiry(tokenExpiry)
                .failedLoginAttempts(0)
                .isLocked(false)
                .build();

        // The account is saved to the correct shard
        account = companyAccountRepository.save(account);
        log.info("Company account registered successfully in shard '{}': {}", shardKey, request.getEmail());

        // Cache the email to shard mapping for fast login
        shardLookupService.cacheEmailShard(request.getEmail(), shardKey);

        // Publish event for Company Service to create profile and for Email Service to send activation link
        CompanyRegisteredEvent event = buildCompanyRegisteredEvent(request, account.getId(), activationToken);
        eventPublisherService.publishCompanyRegistered(event);

        emailService.sendActivationEmail(account, activationToken);

        return ApiResponse.success(
                "Registration successful! Please check your email to activate your account.",
                null
        );

    }

    @Override
    public ApiResponse<String> registerCompanyViaSso(SsoRegisterRequest request) {

        // Check if the account already exists
        if (shardDirectQueryService.emailExistsInAnyShard(request.getEmail())) {
            log.warn("SSO registration failed: Account already exists - {}", request.getEmail());
            return ApiResponse.error("SSO account already registered");
        }

        if (ssoProviderIdExistsInAnyShard(request.getProvider(), request.getSsoProviderId())) {
            log.warn("SSO registration failed: SSO account already exists - {}", request.getEmail());
            return ApiResponse.error("SSO account already registered");
        }

        Country country = request.getCountry();
        String shardKey = country.getShardKey();

        // Set shard context BEFORE saving
        ShardContext.setShardKey(shardKey);
        log.info("Registering SSO company in shard '{}' for country '{}'", shardKey, country.getDisplayName());

        try {
            CompanyAccount account = CompanyAccount.builder()
                    .email(request.getEmail())
                    .passwordHash(null) // SSO users don't have passwords
                    .country(request.getCountry())
                    .authProvider(request.getProvider())
                    .ssoProviderId(request.getSsoProviderId())
                    .role(Role.COMPANY)
                    .isActivated(true) // SSO accounts are pre-activated (verified by provider)
                    .activationToken(null)
                    .activationTokenExpiry(null)
                    .failedLoginAttempts(0)
                    .isLocked(false)
                    .build();

            account = companyAccountRepository.save(account);
            log.info("SSO company account registered successfully in shard '{}': {}", shardKey, request.getEmail());

            // Cache the email-to-shard mapping
            shardLookupService.cacheEmailShard(request.getEmail(), shardKey);

            // Publish event for Company Service to create profile
            CompanyRegisteredEvent event = buildCompanyRegisteredEvent(request, account.getId(), null);
            eventPublisherService.publishCompanyRegistered(event);

            return ApiResponse.success("SSO registration successful!", null);
        } finally {
            ShardContext.clear();
        }

    }

    @Override
    public ApiResponse<String> activateAccount(ActivationRequest request) {
        // Activation token lookup requires scatter-gather since we don't know the shard
        // We need to search all shards for the activation token
        CompanyAccount account = findAccountByActivationToken(request.getToken());

        if (account == null) {
            log.warn("Activation failed: Invalid token");
            throw new IllegalArgumentException("Invalid activation token");
        }

        // Set shard context based on the account's country
        String shardKey = account.getCountry().getShardKey();
        ShardContext.setShardKey(shardKey);
        log.info("Activating account in shard '{}' for email '{}'", shardKey, account.getEmail());

        try {
            // Check if already activated
            if (account.getIsActivated()) {
                log.info("Account already activated: {}", account.getEmail());
                return ApiResponse.success("Account is already activated", null);
            }

            // Check if token expired
            if (account.getActivationTokenExpiry().isBefore(LocalDateTime.now())) {
                log.warn("Activation failed: Token expired for {}", account.getEmail());
                return ApiResponse.error("Activation token has expired. Please request a new one.");
            }

            // Activate account - this will use the shard context we just set
            companyAccountRepository.activateAccount(account.getEmail());
            log.info("Account activated successfully: {}", account.getEmail());

            // Publish activation event
            CompanyActivatedEvent event = CompanyActivatedEvent.builder()
                    .companyId(account.getId())
                    .email(account.getEmail())
                    .activatedAt(LocalDateTime.now())
                    .build();
            eventPublisherService.publishCompanyActivated(event);

            emailService.sendWelcomeEmail(account);

            return ApiResponse.success("Account activated successfully! You can now login.", null);
        } finally {
            ShardContext.clear();
        }
    }

    private CompanyAccount findAccountByPasswordResetToken(String token) {
        return shardDirectQueryService.findByPasswordResetTokenAcrossShards(token)
                .orElse(null);
    }

    @Override
    public ApiResponse<String> resendActivationEmail(String email) {
        log.info("Resend activation email requested for: {}", email);

        // Use ShardLookupService to find the account
        CompanyAccount account = shardLookupService.findAccountByEmail(email)
                .orElseThrow(() -> {
                    log.warn("Resend activation failed: Email not found - {}", email);
                    return new IllegalArgumentException("Email not found");
                });

        // Shard context is already set by findAccountByEmail, but let's be explicit
        ShardContext.setShardKey(account.getCountry().getShardKey());

        try {
            // Check if already activated
            if (account.getIsActivated()) {
                log.info("Cannot resend: Account already activated - {}", email);
                return ApiResponse.error("Account is already activated");
            }

            // Generate new activation token
            String newToken = UUID.randomUUID().toString();
            LocalDateTime newExpiry = LocalDateTime.now().plus(activationTokenExpiration, ChronoUnit.MILLIS);

            account.setActivationToken(newToken);
            account.setActivationTokenExpiry(newExpiry);
            companyAccountRepository.saveAndFlush(account);

            // Publish event for email service to resend activation email
            CompanyRegisteredEvent event = CompanyRegisteredEvent.builder()
                    .companyId(account.getId())
                    .email(account.getEmail())
                    .activationToken(newToken)
                    .registeredAt(LocalDateTime.now())
                    .build();
            eventPublisherService.publishCompanyRegistered(event);

            emailService.sendActivationEmail(account, newToken);

            log.info("Activation email resent to: {}", email);

            return ApiResponse.success("Activation email sent! Please check your inbox.", null);
        } finally {
            ShardContext.clear();
        }
    }

    @Override
    public ApiResponse<AuthResponse> login(LoginRequest request) {
        // Use ShardLookupService to find account across all shards
        CompanyAccount account = shardLookupService.findAccountByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.warn("Login failed: Email not found - {}", request.getEmail());
                    return new IllegalArgumentException("Invalid email or password");
                });

        // Set shard context for subsequent operations
        ShardContext.setShardKey(account.getCountry().getShardKey());

        try {
            // Check if account is locked
            if (account.getIsLocked()) {
                log.warn("Login failed: Account is locked - {}", request.getEmail());
                return ApiResponse.error("Account is locked due to multiple failed login attempts. Please try again later.");
            }

            // Check if account is activated
            if (!account.getIsActivated()) {
                log.warn("Login failed: Account not activated - {}", request.getEmail());
                return ApiResponse.error("Please activate your account first. Check your email for activation link.");
            }

            // Check if SSO user trying to login with password
            if (account.getAuthProvider() != AuthProvider.LOCAL) {
                log.warn("Login failed: SSO user trying to use password login - {}", request.getEmail());
                return ApiResponse.error("This account uses SSO login. Please login with " + account.getAuthProvider().name());
            }

            // Verify password
            if (!passwordEncoder.matches(request.getPassword(), account.getPasswordHash())) {
                log.warn("Login failed: Invalid password - {}", request.getEmail());
                handleFailedLogin(account);
                return ApiResponse.error("Invalid email or password");
            }

            // Reset failed login attempts on successful login
            if (account.getFailedLoginAttempts() > 0) {
                companyAccountRepository.resetFailedLoginAttempts(account.getEmail());
            }

            String accessToken = jweTokenService.generateAccessToken(account);
            String refreshToken = jweTokenService.generateRefreshToken(account);

            log.info("Login successful for: {} (shard: {})", request.getEmail(), account.getCountry().getShardKey());

            // Clear any session invalidation flag (e.g., from country change)
            clearSessionInvalidation(account.getId());

            AuthResponse authResponse = AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .expiresIn(86400L) // 24 hours in seconds
                    .companyId(account.getId())
                    .email(account.getEmail())
                    .role(account.getRole())
                    .authProvider(account.getAuthProvider())
                    .build();

            return ApiResponse.success("Login successful", authResponse);
        } finally {
            ShardContext.clear();
        }
    }

    @Override
    public ApiResponse<AuthResponse> loginViaSso(String ssoProviderId) {
        log.info("SSO login attempt for provider ID: {}", ssoProviderId);

        // SSO login requires scatter-gather to find the account
        CompanyAccount account = findAccountBySsoProviderId(ssoProviderId);

        if (account == null) {
            log.warn("SSO login failed: User not found with provider ID - {}", ssoProviderId);
            throw new IllegalArgumentException("SSO user not found. Please register first.");
        }

        // Set shard context
        ShardContext.setShardKey(account.getCountry().getShardKey());

        try {
            // Check if account is locked
            if (account.getIsLocked()) {
                log.warn("SSO login failed: Account is locked - {}", account.getEmail());
                return ApiResponse.error("Account is locked. Please contact support.");
            }

            if (!account.getIsActivated()) {
                account.setIsActivated(true);
                companyAccountRepository.save(account);
            }

            // Generate tokens
            String accessToken = jweTokenService.generateAccessToken(account);
            String refreshToken = jweTokenService.generateRefreshToken(account);

            log.info("SSO login successful for: {} (shard: {})", account.getEmail(), account.getCountry().getShardKey());

            // Clear any session invalidation flag (e.g., from country change)
            clearSessionInvalidation(account.getId());

            AuthResponse authResponse = AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .expiresIn(86400L)
                    .companyId(account.getId())
                    .email(account.getEmail())
                    .role(account.getRole())
                    .authProvider(account.getAuthProvider())
                    .build();

            return ApiResponse.success("SSO login successful", authResponse);
        } finally {
            ShardContext.clear();
        }
    }

    private void handleFailedLogin(CompanyAccount account) {
        LocalDateTime now = LocalDateTime.now();

        // Increment failed attempts
        companyAccountRepository.incrementFailedLoginAttempts(account.getEmail(), now);

        int newFailedAttempts = account.getFailedLoginAttempts() + 1;

        // lock account when 5 failed attempts within 60 seconds
        if (newFailedAttempts >= 5) {
            LocalDateTime lastFailedTime = account.getLastFailedLoginTime();

            if (lastFailedTime != null &&
                    lastFailedTime.isAfter(now.minusSeconds(60))) {
                // Lock account
                companyAccountRepository.lockAccount(account.getEmail());

                // Publish account locked event
                CompanyAccountLockedEvent event = CompanyAccountLockedEvent.builder()
                        .companyId(account.getId())
                        .email(account.getEmail())
                        .reason("Multiple failed login attempts")
                        .lockedAt(now)
                        .build();
                eventPublisherService.publishCompanyAccountLocked(event);

                emailService.sendAccountLockedEmail(account);

                log.warn("Account locked due to brute force: {}", account.getEmail());
            }
        }
    }

    @Override
    public ApiResponse<String> logout(String authHeader) {
        // Extract token from the header but remove the prefix
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("Logout failed: Invalid authorization header");
            return ApiResponse.error("Invalid authorization header");
        }

        String token = authHeader.substring(7);

        jweTokenService.revokeToken(token);
        log.info("Logout successful, token revoked");
        return ApiResponse.success("Logout successful", null);
    }

    @Override
    public ApiResponse<AuthResponse> refreshToken(RefreshTokenRequest request) {
        try {
            // validate the refresh token and get claims
            JWTClaimsSet claims = jweTokenService.isValidRefreshToken(request.getRefreshToken());

            if (claims == null) {
                log.warn("Token refresh failed: Invalid or expired refresh token");
                return ApiResponse.error("Invalid or expired refresh token");
            }

            // Get the user Id and country code
            UUID accountId = jweTokenService.extractUserId(claims);
            String countryCode = jweTokenService.extractCountryCode(claims);

            // Set shard context
            if (countryCode != null) {
                Country country = Country.fromCode(countryCode);
                if (country != null) {
                    ShardContext.setShardKey(country.getShardKey());
                }
            }

            try {
                // Get account from the correct shard
                CompanyAccount account = companyAccountRepository.findById(accountId)
                        .orElseThrow(() -> new IllegalArgumentException("Account not found in shard: " + countryCode));

                // Check if account is still alive
                if (!account.getIsActivated() || account.getIsLocked()) {
                    log.warn("Token refresh failed: Account inactive or locked - {}", account.getEmail());
                    return ApiResponse.error("Account is not active");
                }

                // Generate new access token
                String newAccessToken = jweTokenService.generateAccessToken(account);
                log.info("Token refreshed successfully for: {}", account.getEmail());

                AuthResponse authResponse = AuthResponse.builder()
                        .accessToken(newAccessToken)
                        .refreshToken(request.getRefreshToken())
                        .tokenType("Bearer")
                        .expiresIn(86400L)
                        .companyId(account.getId())
                        .email(account.getEmail())
                        .role(account.getRole())
                        .authProvider(account.getAuthProvider())
                        .build();

                return ApiResponse.success("Token refreshed successfully", authResponse);
            } finally {
                ShardContext.clear();
            }
        } catch (Exception e) {
            log.error("Token refresh failed: {}", e.getMessage());
            return ApiResponse.error("Can't refresh token: " + e.getMessage());
        }
    }

    @Override
    public ApiResponse<String> forgotPassword(ForgotPasswordRequest request) {
        log.info("Password reset requested for email: {}", request.getEmail());

        // Use ShardLookupService to find the account across shards
        CompanyAccount account = shardLookupService.findAccountByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.warn("Password reset failed: Email not found - {}", request.getEmail());
                    return new IllegalArgumentException("Email not found");
                });

        // Set shard context for subsequent operations
        String shardKey = account.getCountry().getShardKey();
        ShardContext.setShardKey(shardKey);

        try {
            // Check if account is activated
            if (!account.getIsActivated()) {
                log.warn("Password reset failed: Account not activated - {}", request.getEmail());
                return ApiResponse.error("Please activate your account first before resetting password");
            }

            // Check if account uses SSO
            if (account.getAuthProvider() != AuthProvider.LOCAL) {
                log.warn("Password reset failed: SSO account - {}", request.getEmail());
                return ApiResponse.error("This account uses SSO login. Password reset is not applicable.");
            }

            // Generate reset token
            String resetToken = UUID.randomUUID().toString();
            LocalDateTime tokenExpiry = LocalDateTime.now().plus(passwordResetTokenExpiration, ChronoUnit.MILLIS);

            account.setPasswordResetToken(resetToken);
            account.setPasswordResetTokenExpiry(tokenExpiry);
            companyAccountRepository.save(account);

            // Send reset email
            emailService.sendPasswordResetEmail(account, resetToken);

            log.info("Password reset email sent to: {}", request.getEmail());
            return ApiResponse.success(
                    "Password reset instructions have been sent to your email address.",
                    null
            );
        } finally {
            ShardContext.clear();
        }
    }

    @Override
    public ApiResponse<String> resetPassword(ResetPasswordRequest request) {
        log.info("Password reset attempt with token");

        // Find account by reset token across all shards using direct JDBC
        CompanyAccount account = findAccountByPasswordResetToken(request.getToken());

        if (account == null) {
            log.warn("Password reset failed: Invalid token");
            throw new IllegalArgumentException("Invalid or expired reset token");
        }

        // Set shard context for the update operation
        String shardKey = account.getCountry().getShardKey();
        ShardContext.setShardKey(shardKey);

        try {
            // Check if token expired
            if (account.getPasswordResetTokenExpiry().isBefore(LocalDateTime.now())) {
                log.warn("Password reset failed: Token expired for {}", account.getEmail());
                return ApiResponse.error("Reset token has expired. Please request a new one.");
            }

            // Update password
            account.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
            account.setPasswordResetToken(null);
            account.setPasswordResetTokenExpiry(null);

            // Reset failed login attempts and unlock account if locked
            account.setFailedLoginAttempts(0);
            account.setIsLocked(false);

            companyAccountRepository.save(account);

            emailService.sendPasswordChangedEmail(account);

            log.info("Password reset successfully for: {}", account.getEmail());
            return ApiResponse.success("Password has been reset successfully. You can now login with your new password.", null);
        } finally {
            ShardContext.clear();
        }
    }

    @Override
    @Transactional
    public ApiResponse<String> changePassword(String companyId, ChangePasswordRequest request) {
        log.info("Change password request for company: {}", companyId);

        UUID id = UUID.fromString(companyId);

        // Find account across shards
        ShardDirectQueryService.AccountWithShard accountWithShard = shardDirectQueryService.findByIdAcrossShards(id)
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));

        CompanyAccount account = accountWithShard.account();
        String shardKey = accountWithShard.shardKey();

        // Set shard context
        ShardContext.setShardKey(shardKey);

        try {
            // SSO accounts cannot change password
            if (account.getAuthProvider() != AuthProvider.LOCAL) {
                log.warn("Change password failed: SSO account - {}", account.getEmail());
                throw new IllegalArgumentException("This account uses SSO login. Password change is not applicable.");
            }

            // Verify current password
            if (!passwordEncoder.matches(request.getCurrentPassword(), account.getPasswordHash())) {
                log.warn("Change password failed: Incorrect current password for {}", account.getEmail());
                throw new IllegalArgumentException("Current password is incorrect");
            }

            // Update password
            account.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
            companyAccountRepository.save(account);

            // Send notification email
            emailService.sendPasswordChangedEmail(account);

            log.info("Password changed successfully for: {}", account.getEmail());
            return ApiResponse.success("Password has been changed successfully.", null);
        } finally {
            ShardContext.clear();
        }
    }

    @Override
    @Transactional
    public ApiResponse<String> changeEmail(String companyId, ChangeEmailRequest request) {
        log.info("Change email request for company: {}", companyId);

        UUID id = UUID.fromString(companyId);

        // Find account across shards
        ShardDirectQueryService.AccountWithShard accountWithShard = shardDirectQueryService.findByIdAcrossShards(id)
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));

        CompanyAccount account = accountWithShard.account();
        String shardKey = accountWithShard.shardKey();

        // Set shard context
        ShardContext.setShardKey(shardKey);

        try {
            // SSO accounts cannot change email
            if (account.getAuthProvider() != AuthProvider.LOCAL) {
                log.warn("Change email failed: SSO account - {}", account.getEmail());
                throw new IllegalArgumentException("This account uses SSO login. Email change is not applicable.");
            }

            // Verify current password
            if (!passwordEncoder.matches(request.getCurrentPassword(), account.getPasswordHash())) {
                log.warn("Change email failed: Incorrect password for {}", account.getEmail());
                throw new IllegalArgumentException("Password is incorrect");
            }

            // Check if new email already exists
            if (shardDirectQueryService.emailExistsInAnyShard(request.getNewEmail())) {
                log.warn("Change email failed: Email {} already exists", request.getNewEmail());
                throw new IllegalArgumentException("This email is already in use");
            }

            String oldEmail = account.getEmail();

            // Update email in db
            account.setEmail(request.getNewEmail());
            companyAccountRepository.save(account);

            // Remove old email from Redis cache
            shardLookupService.removeEmailFromCache(oldEmail);
            log.info("Removed old email '{}' from Redis cache", oldEmail);

            // Add new email to the cache
            shardLookupService.cacheEmailShard(request.getNewEmail(), shardKey);
            log.info("Cached new email '{}' to shard '{}' in Redis", request.getNewEmail(), shardKey);

            // Send confirmation email to new address
            emailService.sendEmailChangedConfirmation(account);

            log.info("Email changed successfully from {} to {}", oldEmail, request.getNewEmail());
            return ApiResponse.success("Email has been changed successfully. A confirmation has been sent to your new email.", null);

        } finally {
            ShardContext.clear();
        }
    }

    /**
     * Find account by activation token across all shards (scatter-gather)
     */
    private CompanyAccount findAccountByActivationToken(String token) {
        return shardDirectQueryService.findByActivationTokenAcrossShards(token)
                .orElse(null);
    }

    /**
     * Find account by SSO provider ID across all shards (scatter-gather)
     */
    private CompanyAccount findAccountBySsoProviderId(String ssoProviderId) {
        Optional<CompanyAccount> accountOpt = shardDirectQueryService
                .findBySsoProviderIdAcrossShards(AuthProvider.GOOGLE, ssoProviderId);

        if (accountOpt.isPresent()) {
            CompanyAccount account = accountOpt.get();
            // Cache the email-to-shard mapping for future lookups
            shardLookupService.cacheEmailShard(
                    account.getEmail(),
                    account.getCountry().getShardKey()
            );
            return account;
        }

        return null;
    }

    /**
     * Get all shard keys for scatter-gather operations
     */
    private List<String> getShardKeys() {
        return java.util.List.of(
                "auth_shard_vn",
                "auth_shard_sg",
                "auth_shard_asia",
                "auth_shard_oceania",
                "auth_shard_na",
                "auth_shard_eu",
                "auth_shard_others"
        );
    }

    private boolean ssoProviderIdExistsInAnyShard(AuthProvider provider, String ssoProviderId) {
        return shardDirectQueryService.ssoProviderIdExistsInAnyShard(provider, ssoProviderId);
    }

    /**
     * Builder for CompanyRegisteredEvent.
     * Ensures all registration flows emit consistent Kafka events with required fields.
     *
     * @param request         Base registration request containing email and country
     * @param companyId       The generated company ID
     * @param activationToken Optional activation token (null for SSO registrations)
     * @return A fully populated CompanyRegisteredEvent
     */
    private CompanyRegisteredEvent buildCompanyRegisteredEvent(
            BaseCompanyRegisterRequest request,
            UUID companyId,
            String activationToken
    ) {
        return CompanyRegisteredEvent.builder()
                .companyId(companyId)
                .email(request.getEmail())
                .countryCode(request.getCountry() != null ? request.getCountry().getCode() : null)
                .activationToken(activationToken)
                .registeredAt(LocalDateTime.now())
                .build();
    }

    /**
     * Clear session invalidation flag when user successfully logs in.
     * This allows the user to use the system after re-authenticating.
     */
    private void clearSessionInvalidation(UUID companyId) {
        String redisKey = SESSION_INVALIDATION_PREFIX + companyId.toString();
        Boolean deleted = redisTemplate.delete(redisKey);
        if (Boolean.TRUE.equals(deleted)) {
            log.info("Cleared session invalidation for company ID: {}", companyId);
        }
    }
}
