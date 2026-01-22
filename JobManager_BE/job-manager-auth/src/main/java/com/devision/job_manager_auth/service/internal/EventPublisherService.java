package com.devision.job_manager_auth.service.internal;

import com.devision.job_manager_auth.event.CompanyAccountLockedEvent;
import com.devision.job_manager_auth.event.CompanyActivatedEvent;
import com.devision.job_manager_auth.event.CompanyRegisteredEvent;

/**
 * Service for publishing auth-related events to Kafka.
 */
public interface EventPublisherService {

    /**
     * Publish event when a new company is registered.
     */
    void publishCompanyRegistered(CompanyRegisteredEvent event);

    /**
     * Publish event when a company account is activated.
     */
    void publishCompanyActivated(CompanyActivatedEvent event);

    /**
     * Publish event when a company account is locked.
     */
    void publishCompanyAccountLocked(CompanyAccountLockedEvent event);
}
