package com.devision.job_manager_auth.service.internal.impl;

import com.devision.job_manager_auth.config.sharding.ShardContext;
import com.devision.job_manager_auth.config.sharding.ShardingProperties;
import com.devision.job_manager_auth.entity.CompanyAccount;
import com.devision.job_manager_auth.repository.CompanyAccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ShardLookupService {
    private final RedisTemplate<String, String> redisTemplate;
    private final ShardingProperties shardingProperties;
    private final CompanyAccountRepository companyAccountRepository;

    private static final Duration CACHE_TTL = Duration.ofDays(30);
    private static final String EMAIL_SHARD_PREFIX = "email:shard:";

    private final ExecutorService executorService = Executors.newFixedThreadPool(10);

    /**
     * First checks Redis cache, then falls back to scatter-gather across all shards to find which shard contains the account
     *
     */
    public String findShardByEmail(String email) {
        String cachedShard = getCachedShard(email);
        if (cachedShard != null) {
            log.debug("Cache hit: email '{}' found in shard '{}'", email, cachedShard);
            return cachedShard;
        }

        log.debug("Cache miss for email '{}', performing scatter-gather", email);
        String foundShard = scatterGatherFindByEmail(email);
        if (foundShard != null) {
            cacheEmailShard(email, foundShard);
            log.debug("Cached email '{}' -> shard '{}'", email, foundShard);
        }

        return foundShard;
    }

    /**
     * Find the company account by email, then route to the correct shard
     *
     */
    public Optional<CompanyAccount> findAccountByEmail(String email) {
        String shardKey = findShardByEmail(email);

        if (shardKey == null) {
            log.debug("No shard found for email '{}'", email);
            return Optional.empty();
        }

        ShardContext.setShardKey(shardKey);
        try {
            return companyAccountRepository.findByEmail(email);
        } finally {
//            let the interceptor handle it
        }
    }

    /**
     * Since querying all shards at once runs into problems, I query all shards sequentially to find the email
     */
    private String scatterGatherFindByEmail(String email) {
        List<String> shardKeys = new ArrayList<>(shardingProperties.getShards().keySet());

        log.debug("Scatter-gather searching for email '{}' across {} shards", email, shardKeys.size());

        for (String shardKey : shardKeys) {
//            CompletableFuture<Optional<String>> future = CompletableFuture.supplyAsync(() -> {
//                try {
//                    ShardContext.setShardKey(shardKey);
//
//                    boolean exists = companyAccountRepository.existsByEmail(email);
//
//                    if (exists) {
//                        log.debug("Email '{}' found in shard '{}'", email, shardKey);
//                        return Optional.of(shardKey);
//                    }
//                    return Optional.empty();
//                } catch (Exception e) {
//                    log.error("Error querying shard '{}' for email '{}': {}",
//                            shardKey, email, e.getMessage());
//                    return Optional.empty();
//                } finally {
//                    ShardContext.clear();
//                }
//            }, executorService);
//            futures.add(future);

            try {
                ShardContext.setShardKey(shardKey);
                log.debug("Checking shard '{}' for email '{}'", shardKey, email);
                boolean exists = companyAccountRepository.existsByEmail(email);
                if (exists) {
                    log.info("Email '{}' found in shard '{}'", email, shardKey);
                    return shardKey;
                }
            } catch (Exception e) {
                log.error("Error querying shard '{}' for email '{}': {}", shardKey, email, e.getMessage());

            } finally {
                ShardContext.clear();
            }
        }

        log.debug("Email '{}' not found in any shard", email);

        return null;
    }

    public boolean emailExistsInAnyShard(String email) {
        // First check cache
        String cachedShard = getCachedShard(email);
        if (cachedShard != null) {
            // Go verify if the account still exists in the database
            ShardContext.setShardKey(cachedShard);
            try {
                boolean exists = companyAccountRepository.existsByEmail(email);
                if (!exists) {
                    log.warn("Email '{}' not found in shard '{}'", email, cachedShard);
                    invalidateCache(email);
                    return false;
                }
                return true;
            } finally {
                ShardContext.clear();
            }

        }

        // Scatter-gather to check all shards
        return scatterGatherFindByEmail(email) != null;
    }

    public void cacheEmailShard(String email, String shardKey) {
        String key = EMAIL_SHARD_PREFIX + email.toLowerCase();
        redisTemplate.opsForValue().set(key, shardKey, CACHE_TTL);
    }

    private String getCachedShard(String email) {
        String key = EMAIL_SHARD_PREFIX + email.toLowerCase();
        return redisTemplate.opsForValue().get(key);
    }

    /**
     * This is called when an account is deleted or email is changed
     * @param email
     */
    public void invalidateCache(String email) {
        String key = EMAIL_SHARD_PREFIX + email.toLowerCase();
        redisTemplate.delete(key);
        log.debug("Invalidated cache for email '{}'", email);
    }

    /**
     * Update cache when user changes their email.
     */
    public void removeEmailFromCache(String email) {
        String redisKey = EMAIL_SHARD_PREFIX + email;
        Boolean deleted = redisTemplate.delete(redisKey);
        if (Boolean.TRUE.equals(deleted)) {
            log.info("Deleted email from Redis cache: {}", email);
        } else {
            log.warn("Email not found in Redis cache: {}", email);
        }
    }
}
