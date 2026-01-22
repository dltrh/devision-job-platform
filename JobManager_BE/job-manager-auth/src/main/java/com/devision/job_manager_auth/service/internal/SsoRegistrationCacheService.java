package com.devision.job_manager_auth.service.internal;

import com.devision.job_manager_auth.dto.internal.PendingSsoRegistration;
import org.springframework.data.redis.core.RedisTemplate;

import java.util.Optional;

public interface SsoRegistrationCacheService {
    String storePendingRegistration(PendingSsoRegistration registration);
    Optional<PendingSsoRegistration> retrieveAndDeletePendingRegistration(String token);
}
