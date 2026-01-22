package com.devision.job_manager_auth.service.internal.impl;

import com.devision.job_manager_auth.config.sharding.ShardContext;
import com.devision.job_manager_auth.entity.CompanyAccount;
import com.devision.job_manager_auth.entity.Country;
import com.devision.job_manager_auth.repository.CompanyAccountRepository;
import com.devision.job_manager_auth.service.internal.ShardMigrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShardMigrationServiceImpl implements ShardMigrationService {
    
    private static final String SESSION_INVALIDATION_PREFIX = "session-invalidated:";
    private static final Duration SESSION_INVALIDATION_TTL = Duration.ofDays(7);
    
    private final CompanyAccountRepository companyAccountRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final ShardDirectQueryService shardDirectQueryService;
    private final ShardLookupService shardLookupService;

    @Override
    public void migrateCompanyAccount(UUID companyId, String previousCountryCode, String newCountryCode) {
        log.info("Starting shard migration for company ID: {} (country: {} -> {})",
                companyId, previousCountryCode, newCountryCode);
        
        // Step 1: Find the account across all shards (scatter-gather)
        // This is necessary because the previousCountryCode from company service
        // may not match the actual shard where the account is stored
        ShardDirectQueryService.AccountWithShard accountWithShard = 
                shardDirectQueryService.findByIdAcrossShards(companyId)
                        .orElseThrow(() -> new IllegalStateException(
                                "Company account not found in any shard: " + companyId));
        
        CompanyAccount account = accountWithShard.account();
        String sourceShardKey = accountWithShard.shardKey();
        String email = account.getEmail();
        
        log.info("Found company account in shard '{}' (email: {})", sourceShardKey, email);
        
        // Determine target shard from new country code
        Country newCountry = Country.fromCode(newCountryCode);
        if (newCountry == null) {
            log.warn("Unknown new country code: {}, using default shard", newCountryCode);
            newCountry = Country.OTHER;
        }
        
        String targetShardKey = newCountry.getShardKey();
        
        // If same shard, just update the country field
        if (sourceShardKey.equals(targetShardKey)) {
            log.info("Source and target shards are the same ({}), updating country field only", sourceShardKey);
            updateCountryInSameShard(companyId, newCountry, sourceShardKey);
            return;
        }
        
        log.info("Migrating from shard {} to shard {}", sourceShardKey, targetShardKey);
        
        // Step 2: Create a new record in target shard using JDBC
        CompanyAccount newAccount = CompanyAccount.builder()
                .id(account.getId())
                .email(email)
                .passwordHash(account.getPasswordHash())
                .country(newCountry)
                .authProvider(account.getAuthProvider())
                .ssoProviderId(account.getSsoProviderId())
                .role(account.getRole())
                .isActivated(account.getIsActivated())
                .activationToken(account.getActivationToken())
                .activationTokenExpiry(account.getActivationTokenExpiry())
                .passwordResetToken(account.getPasswordResetToken())
                .passwordResetTokenExpiry(account.getPasswordResetTokenExpiry())
                .failedLoginAttempts(account.getFailedLoginAttempts())
                .lastFailedLoginTime(account.getLastFailedLoginTime())
                .isLocked(account.getIsLocked())
                .build();
        
        shardDirectQueryService.insertAccountInShard(newAccount, targetShardKey);
        log.info("Created company account in target shard: {}", targetShardKey);
        
        // Step 3: Delete from source shard using JDBC
        shardDirectQueryService.deleteAccountFromShard(companyId, sourceShardKey);
        log.info("Deleted company account from source shard: {}", sourceShardKey);
        
        // Step 4: Update the email-to-shard cache to point to new shard
        shardLookupService.cacheEmailShard(email, targetShardKey);
        log.info("Updated email cache: {} -> {}", email, targetShardKey);
        
        // Step 5: Invalidate user session to force re-login with new country in JWT
        invalidateUserSession(companyId);
        
        log.info("Successfully migrated company ID: {} from {} to {}", 
                companyId, sourceShardKey, targetShardKey);
    }
    
    private void updateCountryInSameShard(UUID companyId, Country newCountry, String shardKey) {
        try {
            ShardContext.setShardKey(shardKey);
            CompanyAccount account = companyAccountRepository.findById(companyId)
                    .orElseThrow(() -> new IllegalStateException(
                            "Company account not found: " + companyId));
            
            account.setCountry(newCountry);
            companyAccountRepository.save(account);
            
            // Still need to invalidate session for country change in JWT
            invalidateUserSession(companyId);
            
            log.info("Updated country for company ID: {} to {} in shard {}", 
                    companyId, newCountry.getCode(), shardKey);
        } finally {
            ShardContext.clear();
        }
    }
    
    /**
     * Invalidate the user's session by marking their session as invalid in Redis.
     * This forces the user to re-login on their next request, getting a new JWT 
     * with the updated country code.
     */
    private void invalidateUserSession(UUID companyId) {
        String redisKey = SESSION_INVALIDATION_PREFIX + companyId.toString();
        redisTemplate.opsForValue().set(redisKey, "country_changed", SESSION_INVALIDATION_TTL);
        log.info("Invalidated session for company ID: {} (requires re-login)", companyId);
    }
}

