package com.devision.job_manager_auth.service.internal.impl;

import com.devision.job_manager_auth.dto.internal.PendingSsoRegistration;
import com.devision.job_manager_auth.service.internal.SsoRegistrationCacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Qualifier;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.LinkedHashMap;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class SsoRegistrationCacheServiceImpl implements SsoRegistrationCacheService {
    private static final String KEY_PREFIX = "pending-sso:";
    private static final long TTL_MINUTES = 10;

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    public SsoRegistrationCacheServiceImpl(
            @Qualifier("redisObjectTemplate") RedisTemplate<String, Object> redisTemplate,
            ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    
    public String storePendingRegistration(PendingSsoRegistration registration) {
        String token = UUID.randomUUID().toString();
        String key = KEY_PREFIX + token;
        redisTemplate.opsForValue().set(key, registration, TTL_MINUTES, TimeUnit.MINUTES);
        return token;
    }

    @Override
    public Optional<PendingSsoRegistration> retrieveAndDeletePendingRegistration(String token) {
        String key = KEY_PREFIX + token;
        Object redisData = redisTemplate.opsForValue().get(key);

        if (redisData == null) {
            log.debug("No pending registration found for token: {}", token);
            return Optional.empty();
        }

        try {
            PendingSsoRegistration registration;

            if (redisData instanceof PendingSsoRegistration) {
                registration = (PendingSsoRegistration) redisData;
            } else if (redisData instanceof LinkedHashMap) {
                // Convert LinkedHashMap to PendingSsoRegistration
                registration = objectMapper.convertValue(redisData, PendingSsoRegistration.class);
            } else {
                log.error("Unexpected Redis data type: {}", redisData.getClass().getName());
                return Optional.empty();
            }

            redisTemplate.delete(key);
            log.debug("Retrieved and deleted pending registration for token: {}", token);
            return Optional.of(registration);
        } catch (Exception e) {
            log.error("Failed to deserialize pending registration for token: {}", token, e);
            redisTemplate.delete(key); // Clean up invalid data
            return Optional.empty();
        }
    }
}
