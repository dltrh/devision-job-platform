package com.devision.job_manager_applicant_search.client;

import com.devision.job_manager_applicant_search.dto.ApiResponse;
import com.devision.job_manager_applicant_search.event.SubscriptionUpdatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionClient {

    private static final String CACHE_KEY_PREFIX = "subscription:premium:";
    private static final long CACHE_TTL_MINUTES = 60; // 1 hour TTL

    private final RedisTemplate<String, Boolean> redisTemplate;
    private final WebClient subscriptionWebClient;

    /**
     * Checks if a company has premium status.
     * First checks Redis cache, then falls back to HTTP call to subscription service.
     * 
     * @param companyId the company UUID
     * @return true if the company is premium, false otherwise
     */
    public boolean isPremium(UUID companyId) {
        String cacheKey = CACHE_KEY_PREFIX + companyId.toString();
        
        try {
            Boolean isPremium = redisTemplate.opsForValue().get(cacheKey);
            
            if (isPremium != null) {
                log.debug("Cache hit for company {}: isPremium={}", companyId, isPremium);
                return isPremium;
            }
            
            log.debug("Cache miss for company {}, falling back to HTTP", companyId);
        } catch (Exception e) {
            log.warn("Redis error for company {}: {}", companyId, e.getMessage());
        }
        
        // Fallback to HTTP call
        return fetchAndCachePremiumStatus(companyId);
    }

    /**
     * Fetches premium status from subscription service and caches it.
     */
    private boolean fetchAndCachePremiumStatus(UUID companyId) {
        try {
            ApiResponse<Boolean> response = subscriptionWebClient.get()
                    .uri("/api/subscriptions/company/{companyId}/is-premium", companyId)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<ApiResponse<Boolean>>() {})
                    .timeout(Duration.ofSeconds(5))
                    .block();
            
            boolean result = response != null && response.isSuccess() && Boolean.TRUE.equals(response.getData());
            
            // Cache the result
            try {
                setPremiumStatus(companyId, result);
            } catch (Exception e) {
                log.warn("Failed to cache premium status for company {}: {}", companyId, e.getMessage());
            }
            
            log.info("Fetched premium status from subscription service for company {}: {}", companyId, result);
            return result;
        } catch (Exception e) {
            log.error("Failed to fetch premium status from subscription service for company {}: {}", 
                    companyId, e.getMessage());
            return false; // Fail-safe: treat as not premium
        }
    }

    /**
     * Updates the cached premium status for a company.
     * Called when a subscription update event is received from Kafka.
     * 
     * @param event the subscription updated event
     */
    public void updatePremiumStatus(SubscriptionUpdatedEvent event) {
        String cacheKey = CACHE_KEY_PREFIX + event.getCompanyId().toString();
        
        boolean isPremium = event.isPremium();
        
        // Also check if subscription has expired based on endAt
        if (isPremium && event.getEndAt() != null) {
            isPremium = event.getEndAt().isAfter(LocalDateTime.now());
        }
        
        redisTemplate.opsForValue().set(cacheKey, isPremium, CACHE_TTL_MINUTES, TimeUnit.MINUTES);
        log.info("Updated premium status cache for company {}: {}", event.getCompanyId(), isPremium);
    }

    /**
     * Manually sets the premium status for a company.
     * Useful for initialization or manual overrides.
     * 
     * @param companyId the company UUID
     * @param isPremium the premium status
     */
    public void setPremiumStatus(UUID companyId, boolean isPremium) {
        String cacheKey = CACHE_KEY_PREFIX + companyId.toString();
        redisTemplate.opsForValue().set(cacheKey, isPremium, CACHE_TTL_MINUTES, TimeUnit.MINUTES);
        log.debug("Set premium status cache for company {}: {}", companyId, isPremium);
    }

    /**
     * Removes the cached premium status for a company.
     * 
     * @param companyId the company UUID
     */
    public void evictPremiumStatus(UUID companyId) {
        String cacheKey = CACHE_KEY_PREFIX + companyId.toString();
        redisTemplate.delete(cacheKey);
        log.debug("Evicted premium status cache for company: {}", companyId);
    }
}
