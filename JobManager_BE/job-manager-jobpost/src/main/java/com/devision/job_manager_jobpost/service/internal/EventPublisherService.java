package com.devision.job_manager_jobpost.service.internal;

import com.devision.job_manager_jobpost.event.*;

/**
 * Service for publishing job post related events to Kafka.
 */
public interface EventPublisherService {

    /**
     * Publish event when a new job post is created.
     */
    void publishJobPostCreated(JobPostCreatedEvent event);

    /**
     * Publish event when a job post is updated.
     */
    void publishJobPostUpdated(JobPostUpdatedEvent event);

    /**
     * Publish event when a job post is published.
     */
    void publishJobPostPublished(JobPostPublishedEvent event);

    /**
     * Publish event when a job post is unpublished.
     */
    void publishJobPostUnpublished(JobPostUnpublishedEvent event);

    /**
     * Publish event when a job post is deleted.
     */
    void publishJobPostDeleted(JobPostDeletedEvent event);

    /**
     * Publish event when a job post expires.
     */
    void publishJobPostExpired(JobPostExpiredEvent event);

    /**
     * Publish event when job post skills are changed.
     * CRITICAL for Ultimo 4.3.1: Enables instant notifications to matching applicants.
     */
    void publishJobPostSkillsChanged(JobPostSkillsChangedEvent event);

    /**
     * Publish event when job post country is changed.
     * CRITICAL for Ultimo 4.3.1: Enables instant notifications to matching applicants.
     */
    void publishJobPostCountryChanged(JobPostCountryChangedEvent event);
}
